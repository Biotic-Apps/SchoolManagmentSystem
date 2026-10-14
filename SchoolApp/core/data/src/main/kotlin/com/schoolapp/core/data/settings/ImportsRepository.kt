package com.schoolapp.core.data.settings

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.model.settings.ImportKind
import com.schoolapp.core.model.settings.ImportSummary

/** Settings › Data import: template → upload (validated on the server) → commit, plus history and revert. */
interface ImportsRepository {
    /** Downloads the .xlsx template of [kind] into the document the user picked ([destinationUri]). */
    suspend fun saveTemplate(kind: ImportKind, destinationUri: String): AppResult<Unit>

    /** Uploads the picked .xlsx/.csv ([uri]); returns the new import id (validation runs in the background). */
    suspend fun upload(uri: String, kind: ImportKind, branchId: String, sessionId: String): AppResult<String>

    suspend fun history(branchId: String): AppResult<List<ImportSummary>>

    suspend fun detail(id: String): AppResult<ImportDetail>

    /** [skipInvalid] commits only the rows that passed. */
    suspend fun commit(id: String, skipInvalid: Boolean): AppResult<Unit>

    /** Fails with a 409 when the created records are already in use. */
    suspend fun revert(id: String): AppResult<Unit>
}
