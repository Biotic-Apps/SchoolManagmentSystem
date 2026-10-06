package com.schoolapp.feature.diary.teacher

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.diary.DiaryRepository
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.diary.DiaryEntry
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.feature.diary.editor.DiaryEditResults
import com.schoolapp.feature.diary.subjects.TaughtSubjects
import com.schoolapp.feature.diary.subjects.TeacherSubjects
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.Job
import kotlinx.coroutines.async
import kotlinx.coroutines.awaitAll
import kotlinx.coroutines.coroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate
import javax.inject.Inject

/** Teacher / helper diary: every assigned section's entries for the chosen date, plus outbox and not-written subjects. */
@HiltViewModel
class TeacherDiaryViewModel @Inject constructor(
    private val diaryRepository: DiaryRepository,
    private val scopedSections: ScopedSections,
    private val teacherSubjects: TeacherSubjects,
    private val authRepository: AuthRepository,
    private val results: DiaryEditResults,
    clock: AppClock,
) : ViewModel() {

    private data class Loaded(
        val date: String,
        val sections: List<Section>,
        val entries: Map<String, List<DiaryEntry>>,
        val taught: Map<String, TaughtSubjects>,
        val subjectNames: Map<String, String>,
    )

    private val today = clock.now().toLocalDate().toString()
    private var loaded: Loaded? = null
    private var queued: Set<String> = emptySet()
    private var loadJob: Job? = null

    private val _uiState = MutableStateFlow(TeacherDiaryUiState(date = today, today = today))
    val uiState: StateFlow<TeacherDiaryUiState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            authRepository.session.filterNotNull().map { it.activeRole }.distinctUntilChanged().collect { load() }
        }
        viewModelScope.launch {
            diaryRepository.queuedSlots.collect {
                queued = it
                rebuild()
            }
        }
        viewModelScope.launch {
            results.latest.filterNotNull().collect { result ->
                results.consume()
                _uiState.update { it.copy(message = result) }
                load()
            }
        }
    }

    fun load() {
        val date = _uiState.value.date
        loadJob?.cancel()
        _uiState.update { it.copy(isLoading = loaded?.date != date, error = null) }
        loadJob = viewModelScope.launch { loadDate(date) }
    }

    fun onPreviousDay() = onDateSelected(LocalDate.parse(_uiState.value.date).minusDays(1).toString())

    fun onNextDay() {
        val next = LocalDate.parse(_uiState.value.date).plusDays(1).toString()
        if (next <= today) onDateSelected(next)
    }

    fun onDateSelected(date: String) {
        if (date == _uiState.value.date) return
        _uiState.update { it.copy(date = date, message = null) }
        load()
    }

    private suspend fun loadDate(date: String) {
        val sections = when (val result = scopedSections.load()) {
            is AppResult.Failure -> return _uiState.update { it.copy(isLoading = false, error = result.error) }
            is AppResult.Success -> result.data.sortedWith(compareBy({ it.className }, { it.name }))
        }
        val subjects = (teacherSubjects.all() as? AppResult.Success)?.data.orEmpty()
        val entryResults = coroutineScope {
            sections.map { section -> async { section.id to diaryRepository.entries(section.id, date = date) } }.awaitAll()
        }
        entryResults.firstNotNullOfOrNull { (it.second as? AppResult.Failure)?.error }?.let { error ->
            return _uiState.update { it.copy(isLoading = false, error = error) }
        }
        val entries = entryResults.associate { (id, result) ->
            id to (result as AppResult.Success).data.filter { it.date == date }
        }
        val taught = teacherSubjects.taught(date, sections, subjects, onDateOnly = true)
        loaded = Loaded(date, sections, entries, taught, subjects.associate { it.id to it.name })
        _uiState.update { it.copy(isLoading = false, error = null) }
        rebuild()
    }

    private fun rebuild() {
        val data = loaded ?: return
        val sections = data.sections.map { section ->
            SectionDiary(section.id, listOfNotNull(section.className, section.name).joinToString(" - "), rowsFor(section.id, data))
        }
        _uiState.update { it.copy(sections = sections) }
    }

    private fun rowsFor(sectionId: String, data: Loaded): List<DiaryRow> {
        val entries = data.entries[sectionId].orEmpty()
        val rows = entries.map { DiaryRow(it.slotKey, it.subjectId, it.subjectName, it, queued = it.slotKey in queued) }.toMutableList()
        val prefix = "$sectionId|"
        val suffix = "|${data.date}"
        queued.filter { it.startsWith(prefix) && it.endsWith(suffix) && rows.none { row -> row.key == it } }.forEach { key ->
            val subjectId = key.removePrefix(prefix).removeSuffix(suffix).ifBlank { null }
            rows += DiaryRow(key, subjectId, subjectId?.let(data.subjectNames::get), entry = null, queued = true)
        }
        data.taught[sectionId]?.subjects.orEmpty().filter { subject -> rows.none { it.subjectId == subject.id } }.forEach { subject ->
            rows += DiaryRow("$prefix${subject.id}$suffix", subject.id, subject.name, entry = null, queued = false)
        }
        return rows.sortedBy { it.subjectName.orEmpty().lowercase() }
    }
}
