package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.DefaultFilesRepository
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.files.Attachment
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicInteger
import javax.inject.Inject
import javax.inject.Singleton

/** Demo uploads never touch the network: they get a fake id (no URL) remembered for attachment chips. */
@Singleton
class DemoAwareFilesRepository @Inject constructor(
    private val real: DefaultFilesRepository,
    private val auth: DemoAwareAuthRepository,
) : FilesRepository {

    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> {
        if (!auth.isDemoActive) return real.upload(uri, purpose)
        val n = DemoFiles.counter.incrementAndGet()
        val file = UploadedFile("demo-file-$n", null, "image/jpeg", 184_000L, "Attachment $n.jpg")
        DemoFiles.uploaded[file.id] = file
        return AppResult.Success(file)
    }
}

internal object DemoFiles {
    val counter = AtomicInteger(0)
    val uploaded = ConcurrentHashMap<String, UploadedFile>()

    fun attachments(ids: List<String>): List<Attachment> = ids.map { id ->
        val file = uploaded[id]
        Attachment(id, file?.url, file?.mime ?: "image/jpeg", file?.name ?: "Attachment")
    }
}
