package com.schoolapp.core.model.files

/** Files picked for a form that is not submitted yet: uploaded [items] plus uploads still running. */
data class AttachmentDraft(val items: List<Attachment> = emptyList(), val uploading: Int = 0) {
    val isUploading: Boolean get() = uploading > 0
    val fileIds: List<String> get() = items.map(Attachment::id)

    fun canAdd(max: Int): Boolean = items.size + uploading < max

    fun started(): AttachmentDraft = copy(uploading = uploading + 1)

    fun added(attachment: Attachment): AttachmentDraft = copy(items = items + attachment, uploading = (uploading - 1).coerceAtLeast(0))

    fun failed(): AttachmentDraft = copy(uploading = (uploading - 1).coerceAtLeast(0))

    fun removed(id: String): AttachmentDraft = copy(items = items.filterNot { it.id == id })

    companion object {
        /** Web form default; the API accepts up to 10. */
        const val DEFAULT_MAX = 5
    }
}
