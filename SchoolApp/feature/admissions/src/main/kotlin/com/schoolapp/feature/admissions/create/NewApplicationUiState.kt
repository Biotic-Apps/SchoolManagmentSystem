package com.schoolapp.feature.admissions.create

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.FormErrors
import com.schoolapp.core.ui.people.GuardianForm

@Immutable
data class ClassChoice(val id: String, val name: String)

/**
 * New admission application (`admissions.add`), the web's application form: class applied for, child,
 * one to four guardians (one primary) and notes; branch and the active session come from the user's branch.
 */
@Immutable
data class NewApplicationUiState(
    val isLoading: Boolean = true,
    val loadError: AppError? = null,
    val canAdd: Boolean = false,
    /** No active session in the branch: applications can't be taken. */
    val noSession: Boolean = false,
    val today: String = "",
    val classes: List<ClassChoice> = emptyList(),
    val classId: String? = null,
    val child: ChildForm = ChildForm(),
    val guardians: List<GuardianForm> = listOf(GuardianForm(isPrimary = true)),
    val notes: String = "",
    val errors: FormErrors = FormErrors(),
    val submitting: Boolean = false,
    val submitError: ActionError? = null,
    val createdId: String? = null,
)
