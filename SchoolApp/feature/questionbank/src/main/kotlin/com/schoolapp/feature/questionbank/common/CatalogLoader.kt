package com.schoolapp.feature.questionbank.common

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.designsystem.component.PickerOption
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject

/** Subject and class choices of one school, for filters and forms. */
data class Catalog(val subjects: List<PickerOption> = emptyList(), val classes: List<PickerOption> = emptyList())

class CatalogLoader @Inject constructor(
    private val organisation: OrganisationRepository,
) {
    suspend fun load(schoolId: String): AppResult<Catalog> = coroutineScope {
        val subjectsCall = async { organisation.subjects(schoolId) }
        val classesCall = async { organisation.classes(schoolId) }
        val subjects = subjectsCall.await()
        val classes = classesCall.await()
        when {
            subjects is AppResult.Failure -> subjects
            classes is AppResult.Failure -> classes
            else -> AppResult.Success(
                Catalog(
                    subjects = (subjects as AppResult.Success).data
                        .sortedBy { it.name.lowercase() }
                        .map { PickerOption(it.id, it.name) },
                    classes = (classes as AppResult.Success).data
                        .sortedWith(compareBy({ it.levelOrder ?: Int.MAX_VALUE }, { it.name }))
                        .map { PickerOption(it.id, it.name) },
                ),
            )
        }
    }
}
