package com.schoolapp.feature.health

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile

internal class FakeHealthFilesRepository : FilesRepository {
    var failWith: AppError? = null
    val purposes = mutableListOf<FilePurpose>()
    private var count = 0

    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> {
        purposes += purpose
        failWith?.let { return AppResult.Failure(it) }
        count++
        return AppResult.Success(UploadedFile("f$count", "https://files/f$count", "image/jpeg", 10, "photo$count.jpg"))
    }
}
