package com.schoolapp.feature.students.add

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.people.RegisteredStudent
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm

/** A section the student can be placed in: "Class 5 · A", seats used / capacity. */
@Immutable
data class SectionOption(
    val id: String,
    val label: String,
    val studentCount: Int,
    val capacity: Int?,
    val classId: String? = null,
    val className: String? = null,
) {
    val isFull: Boolean get() = capacity != null && studentCount >= capacity
}

/**
 * Add student (`students.add`): the same registration as the web — child, one to four guardians (one primary),
 * section of the active session and admission date. Roll number and admission number come from the server.
 */
@Immutable
data class AddStudentUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canAdd: Boolean = false,
    val today: String = "",
    val sections: List<SectionOption> = emptyList(),
    val child: ChildForm = ChildForm(),
    val guardians: List<GuardianForm> = listOf(GuardianForm(isPrimary = true)),
    val sectionId: String? = null,
    val admissionDate: String = "",
    val errors: FormErrors = FormErrors(),
    val submitting: Boolean = false,
    val submitError: ActionError? = null,
    val created: RegisteredStudent? = null,
)
