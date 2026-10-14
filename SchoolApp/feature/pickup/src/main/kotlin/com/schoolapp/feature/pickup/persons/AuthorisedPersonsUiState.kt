package com.schoolapp.feature.pickup.persons

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.people.StudentSummary
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.feature.pickup.components.StudentSearchState

enum class PersonAction { VERIFY, REVOKE }

/** A verify / revoke waiting for confirmation. */
@Immutable
data class PersonConfirm(val person: PickupPerson, val action: PersonAction, val busy: Boolean = false)

/** One-shot outcome shown in a snackbar. */
sealed interface PersonsEvent {
    data class Done(val action: PersonAction) : PersonsEvent
    data class Failed(val error: AppError) : PersonsEvent
}

/** Branch "Authorised persons": find a student, then verify or revoke who may collect them ([canManage] = `pickup.edit`). */
@Immutable
data class AuthorisedPersonsUiState(
    val search: StudentSearchState = StudentSearchState(),
    val student: StudentSummary? = null,
    val isLoading: Boolean = false,
    val isRefreshing: Boolean = false,
    val persons: List<PickupPerson> = emptyList(),
    val error: AppError? = null,
    val canManage: Boolean = false,
    val confirm: PersonConfirm? = null,
)
