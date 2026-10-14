package com.schoolapp.core.data.schools

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.schools.School
import com.schoolapp.core.model.schools.SchoolDeletionPreview
import com.schoolapp.core.model.schools.SchoolDeletionStatus
import com.schoolapp.core.model.schools.SchoolPage
import com.schoolapp.core.model.schools.SchoolSetupInput
import com.schoolapp.core.model.schools.SchoolSetupResult
import com.schoolapp.core.model.schools.SchoolUpdate
import kotlinx.coroutines.flow.StateFlow

/** Super admin: schools, one-form setup, archive/restore and permanent delete. */
interface SchoolsRepository {
    /** Bumped after every successful change so open lists and details reload. */
    val changes: StateFlow<Int>

    suspend fun schools(search: String?, status: String?, page: Int, pageSize: Int = PAGE_SIZE): AppResult<SchoolPage>
    suspend fun school(id: String): AppResult<School>
    suspend fun update(id: String, update: SchoolUpdate): AppResult<School>
    suspend fun archive(id: String): AppResult<School>
    suspend fun activate(id: String): AppResult<School>
    suspend fun setup(input: SchoolSetupInput): AppResult<SchoolSetupResult>
    suspend fun deletionPreview(id: String): AppResult<SchoolDeletionPreview>
    suspend fun requestDeletion(id: String, confirmCode: String): AppResult<SchoolDeletionStatus>
    suspend fun deletionStatus(id: String): AppResult<SchoolDeletionStatus>

    /** Call once a background deletion has finished so lists drop the school. */
    fun notifyChanged()

    companion object {
        const val PAGE_SIZE = 25
    }
}
