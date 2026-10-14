package com.schoolapp.feature.questionbank.generate

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.questions.QuestionBankRepository
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.GeneratePaperDestination
import com.schoolapp.feature.questionbank.common.CatalogLoader
import com.schoolapp.feature.questionbank.common.QuestionBankChange
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Paper generator: paper details plus sections; the server picks random matching questions from the bank. */
@HiltViewModel
class GeneratePaperViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: QuestionBankRepository,
    private val catalogLoader: CatalogLoader,
    private val events: QuestionBankEvents,
) : ViewModel() {

    private val schoolId = savedStateHandle.toRoute<GeneratePaperDestination>().schoolId

    private val _uiState = MutableStateFlow(GeneratePaperUiState())
    val uiState: StateFlow<GeneratePaperUiState> = _uiState.asStateFlow()

    private var nextKey = 1L

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            when (val result = catalogLoader.load(schoolId)) {
                is AppResult.Success -> _uiState.update { it.copy(isLoading = false, catalog = result.data) }
                is AppResult.Failure -> _uiState.update { it.copy(isLoading = false, loadError = result.error) }
            }
        }
    }

    fun onSubject(id: String?) = edit(PaperValidation.SUBJECT) { it.copy(subjectId = id) }
    fun onClass(id: String?) = edit(PaperValidation.CLASS) { it.copy(classId = id) }
    fun onTitle(value: String) = edit(PaperValidation.TITLE) { it.copy(title = value) }
    fun onTotalMarks(value: String) = edit(PaperValidation.TOTAL_MARKS) { it.copy(totalMarks = value.digits(3)) }
    fun onDuration(value: String) = edit(PaperValidation.DURATION_KEY) { it.copy(duration = value.digits(3)) }

    fun onSectionTitle(index: Int, value: String) = editSection(index, "title") { it.copy(title = value) }
    fun onSectionType(index: Int, key: String?) {
        val type = QuestionType.from(key) ?: return
        editSection(index, "type") { it.copy(type = type) }
    }
    fun onSectionDifficulty(index: Int, value: Difficulty) = editSection(index, "difficulty") { it.copy(difficulty = value) }
    fun onSectionCount(index: Int, value: String) = editSection(index, "count") { it.copy(count = value.digits(2)) }
    fun onSectionMarks(index: Int, value: String) = editSection(index, "marks") { it.copy(marksEach = value.digits(3)) }

    fun addSection() = _uiState.update { s ->
        val letter = 'A' + s.sections.size
        s.copy(sections = s.sections + SectionDraft(nextKey++, "Section $letter", QuestionType.SHORT, Difficulty.MEDIUM, "5", "2"))
    }

    fun removeSection(index: Int) = _uiState.update { s ->
        if (s.sections.size <= 1) return@update s
        s.copy(sections = s.sections.filterIndexed { i, _ -> i != index }, errors = s.errors.filterKeys { !(it.startsWith("s") && it.contains('.')) })
    }

    fun generate() {
        val state = _uiState.value
        if (state.isGenerating) return
        val errors = PaperValidation.check(state)
        if (errors.isNotEmpty()) return _uiState.update { it.copy(errors = errors, generateError = null) }
        _uiState.update { it.copy(isGenerating = true, errors = emptyMap(), generateError = null) }
        viewModelScope.launch {
            when (val result = repository.generatePaper(PaperValidation.toInput(state, schoolId))) {
                is AppResult.Success -> {
                    events.post(QuestionBankChange.PAPER_GENERATED, announce = false)
                    _uiState.update { it.copy(isGenerating = false, generatedPaperId = result.data.id) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isGenerating = false, generateError = result.error) }
            }
        }
    }

    private fun edit(key: String, change: (GeneratePaperUiState) -> GeneratePaperUiState) =
        _uiState.update { s -> change(s).copy(errors = s.errors - key, generateError = null) }

    private fun editSection(index: Int, field: String, change: (SectionDraft) -> SectionDraft) =
        edit(PaperValidation.sectionKey(index, field)) { s ->
            s.copy(sections = s.sections.mapIndexed { i, d -> if (i == index) change(d) else d })
        }

    private fun String.digits(max: Int) = filter(Char::isDigit).take(max)
}
