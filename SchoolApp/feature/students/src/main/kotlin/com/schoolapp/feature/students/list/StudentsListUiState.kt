package com.schoolapp.feature.students.list

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.students.list.StudentListFilter
import com.schoolapp.feature.students.add.SectionOption

enum class StudentsTab { STUDENTS, TRANSFERS }

/** Students page for branch roles (web StudentsPage): filters, permissions and the scope they apply to. */
@Immutable
data class StudentsListUiState(
    val tab: StudentsTab = StudentsTab.STUDENTS,
    val scopeLoading: Boolean = true,
    val scopeError: AppError? = null,
    /** Sections of the branch's active session (class and section filters). */
    val sections: List<SectionOption> = emptyList(),
    val filter: StudentListFilter = StudentListFilter(),
    val query: String = "",
    val canAdd: Boolean = false,
    val canPrintSlips: Boolean = false,
    val showLoginSlips: Boolean = false,
    /** `students.edit`: bulk ID cards. */
    val canPrintCards: Boolean = false,
    val showIdCards: Boolean = false,
) {
    val classes: List<Pair<String, String>> get() = sections.classOptions()

    /** Sections of the chosen class only (the web shows the section filter once a class is picked). */
    val classSections: List<SectionOption> get() = filter.classId?.let { id -> sections.filter { it.classId == id } }.orEmpty()
}
