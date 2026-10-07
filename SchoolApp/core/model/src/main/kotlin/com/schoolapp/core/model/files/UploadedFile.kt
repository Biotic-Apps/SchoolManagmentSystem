package com.schoolapp.core.model.files

data class UploadedFile(val id: String, val url: String?, val mime: String?, val size: Long?, val name: String?) {
    fun toAttachment() = Attachment(id, url, mime, name)
}
