package com.schoolapp.core.data.files

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile

interface FilesRepository {
    /** Uploads a picked content Uri (as string) via `POST /files`; the bytes are read on the IO dispatcher. */
    suspend fun upload(uri: String, purpose: FilePurpose = FilePurpose.ATTACHMENT): AppResult<UploadedFile>
}
