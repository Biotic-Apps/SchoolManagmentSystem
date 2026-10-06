package com.schoolapp.core.model.files

/** A stored file linked to a record; [url] is short-lived and signed. */
data class Attachment(val id: String, val url: String?, val mime: String?, val name: String?) {
    val isImage: Boolean get() = mime?.startsWith("image/") == true
}
