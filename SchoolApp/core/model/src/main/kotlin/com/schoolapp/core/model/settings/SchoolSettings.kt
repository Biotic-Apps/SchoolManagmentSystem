package com.schoolapp.core.model.settings

/** Branding and printed footers of one school (`/settings/school/:schoolId`). */
data class SchoolSettings(
    val schoolId: String,
    val displayName: String,
    val logoFileId: String?,
    val logoUrl: String?,
    val primaryColor: String,
    val receiptFooter: String?,
    val reportCardFooter: String?,
    val timezone: String?,
    val currency: String?,
    val locale: String?,
)

data class SchoolSettingsInput(
    val displayName: String,
    val logoFileId: String?,
    val primaryColor: String,
    val receiptFooter: String?,
    val reportCardFooter: String?,
)

/** `{ id, name }` option (school or branch picker). */
data class NamedOption(val id: String, val name: String)

/** Android phone SMS relay status (`/sms-gateway/status`). */
data class SmsGatewayStatus(
    val enabled: Boolean,
    val deviceId: String?,
    val pending: Int,
    val lastSentAt: String?,
)

/** One page of a server-paged list. */
data class PagedList<T>(val items: List<T>, val page: Int, val pageSize: Int, val total: Int) {
    val hasNext: Boolean get() = page * pageSize < total
    val hasPrevious: Boolean get() = page > 1
}
