package com.schoolapp.feature.questionbank.form

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import androidx.navigation.toRoute
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.questions.QuestionBankRepository
import com.schoolapp.core.model.questions.Difficulty
import com.schoolapp.core.model.questions.Question
import com.schoolapp.core.model.questions.QuestionType
import com.schoolapp.feature.questionbank.QuestionFormDestination
import com.schoolapp.feature.questionbank.common.CatalogLoader
import com.schoolapp.feature.questionbank.common.QuestionBankChange
import com.schoolapp.feature.questionbank.common.QuestionBankEvents
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.async
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

/** Add or edit one question; subject and class are fixed once the question exists (the API keeps them). */
@HiltViewModel
class QuestionFormViewModel @Inject constructor(
    savedStateHandle: SavedStateHandle,
    private val repository: QuestionBankRepository,
    private val catalogLoader: CatalogLoader,
    private val events: QuestionBankEvents,
) : ViewModel() {

    private val route = savedStateHandle.toRoute<QuestionFormDestination>()

    private val _uiState = MutableStateFlow(QuestionFormUiState(isEdit = route.questionId != null))
    val uiState: StateFlow<QuestionFormUiState> = _uiState.asStateFlow()

    init {
        load()
    }

    fun load() {
        _uiState.update { it.copy(isLoading = true, loadError = null) }
        viewModelScope.launch {
            val catalogCall = async { catalogLoader.load(route.schoolId) }
            val questionCall = async { route.questionId?.let { repository.question(it) } }
            val catalog = catalogCall.await()
            val question = questionCall.await()
            val error = (catalog as? AppResult.Failure)?.error ?: (question as? AppResult.Failure)?.error
            if (error != null) return@launch _uiState.update { it.copy(isLoading = false, loadError = error) }
            _uiState.update { s ->
                val base = s.copy(isLoading = false, catalog = (catalog as AppResult.Success).data)
                (question as? AppResult.Success)?.data?.let { base.fill(it) } ?: base
            }
        }
    }

    fun onSubject(id: String?) = edit(QuestionField.SUBJECT) { it.copy(subjectId = id) }
    fun onClass(id: String?) = edit(QuestionField.CLASS) { it.copy(classId = id) }
    fun onChapter(value: String) = edit(QuestionField.CHAPTER) { it.copy(chapter = value) }
    fun onDifficulty(value: Difficulty) = edit(QuestionField.DIFFICULTY) { it.copy(difficulty = value) }
    fun onMarks(value: String) = edit(QuestionField.MARKS) { it.copy(marks = value.filter(Char::isDigit).take(MARKS_DIGITS)) }
    fun onText(value: String) = edit(QuestionField.TEXT) { it.copy(text = value) }
    fun onAnswer(value: String) = edit(QuestionField.ANSWER) { it.copy(answer = value) }
    fun onCorrect(index: Int) = edit(QuestionField.ANSWER) { it.copy(correctIndex = index) }

    fun onType(key: String?) {
        val type = QuestionType.from(key) ?: return
        edit(QuestionField.TYPE) { s ->
            val answer = when {
                type == QuestionType.TRUE_FALSE && s.answer !in TRUE_FALSE -> ""
                s.type == QuestionType.TRUE_FALSE && type != QuestionType.TRUE_FALSE -> ""
                else -> s.answer
            }
            s.copy(type = type, answer = answer)
        }
    }

    fun onOption(index: Int, value: String) = edit(QuestionField.OPTIONS) { s ->
        s.copy(options = s.options.toMutableList().also { it[index] = value })
    }

    fun addOption() = _uiState.update { s -> if (s.canAddOption) s.copy(options = s.options + "") else s }

    fun removeOption(index: Int) = _uiState.update { s ->
        if (!s.canRemoveOption) return@update s
        val correct = s.correctIndex?.let { c -> if (c == index) null else if (c > index) c - 1 else c }
        s.copy(options = s.options.filterIndexed { i, _ -> i != index }, correctIndex = correct)
    }

    fun save() {
        val state = _uiState.value
        if (state.isSaving) return
        val errors = QuestionValidation.check(state)
        if (errors.isNotEmpty()) return _uiState.update { it.copy(errors = errors, saveError = null) }
        val input = QuestionValidation.toInput(state, route.schoolId)
        _uiState.update { it.copy(isSaving = true, errors = emptyMap(), serverErrors = emptyMap(), saveError = null) }
        viewModelScope.launch {
            val id = route.questionId
            val result = if (id == null) repository.createQuestion(input) else repository.updateQuestion(id, input)
            when (result) {
                is AppResult.Success -> {
                    events.post(if (id == null) QuestionBankChange.QUESTION_ADDED else QuestionBankChange.QUESTION_UPDATED)
                    _uiState.update { it.copy(isSaving = false, saved = true) }
                }
                is AppResult.Failure -> _uiState.update { it.copy(isSaving = false, saveError = result.error, serverErrors = serverErrors(result.error)) }
            }
        }
    }

    private fun serverErrors(error: AppError): Map<QuestionField, String> =
        (error as? AppError.Validation)?.fields.orEmpty()
            .mapNotNull { (path, line) -> QuestionValidation.fieldOf(path.substringBefore('.'))?.let { it to line } }
            .toMap()

    private fun edit(field: QuestionField, change: (QuestionFormUiState) -> QuestionFormUiState) = _uiState.update { s ->
        change(s).copy(errors = s.errors - field, serverErrors = s.serverErrors - field)
    }

    private fun QuestionFormUiState.fill(q: Question): QuestionFormUiState {
        val mcq = q.type == QuestionType.MCQ
        val options = if (mcq && q.options.isNotEmpty()) q.options else options
        return copy(
            subjectId = q.subjectId,
            classId = q.classId,
            subjectName = q.subjectName,
            className = q.className,
            chapter = q.chapterName,
            type = q.type,
            difficulty = q.difficulty,
            marks = q.marks.toString(),
            text = q.text,
            options = if (options.size < QuestionFormUiState.MIN_OPTIONS) options + List(QuestionFormUiState.MIN_OPTIONS - options.size) { "" } else options,
            correctIndex = if (mcq) options.indexOfFirst { it.trim().equals(q.correctAnswer.trim(), ignoreCase = true) }.takeIf { it >= 0 } else null,
            answer = if (mcq) "" else q.correctAnswer,
        )
    }

    private companion object {
        const val MARKS_DIGITS = 3
        val TRUE_FALSE = setOf("True", "False")
    }
}
