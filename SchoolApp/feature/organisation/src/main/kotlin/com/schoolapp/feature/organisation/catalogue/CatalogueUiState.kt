package com.schoolapp.feature.organisation.catalogue

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.common.ActionError
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.Room

/**
 * "Subjects & rooms": the school's subject list and the branch's rooms. Adding/renaming follows the web:
 * subjects `classes.add` / `classes.edit`; rooms `classes.add` or `timetable.edit` / `classes.edit`.
 */
@Immutable
data class CatalogueUiState(
    val isLoading: Boolean = true,
    val error: AppError? = null,
    val subjects: List<CatalogueSubject> = emptyList(),
    val rooms: List<Room> = emptyList(),
    val canAddSubject: Boolean = false,
    val canAddRoom: Boolean = false,
    val canRename: Boolean = false,
    val editor: CatalogueEditor? = null,
)

enum class CatalogueKind { SUBJECT, ROOM }

/** Add or rename sheet; [id] null = new. [capacity] is text so the field can be blank (rooms only). */
@Immutable
data class CatalogueEditor(
    val kind: CatalogueKind,
    val id: String? = null,
    val name: String = "",
    val capacity: String = "",
    val nameError: CatalogueProblem? = null,
    val capacityError: Boolean = false,
    val saving: Boolean = false,
    val error: ActionError? = null,
)

enum class CatalogueProblem { REQUIRED, TOO_SHORT, TOO_LONG, DUPLICATE }
