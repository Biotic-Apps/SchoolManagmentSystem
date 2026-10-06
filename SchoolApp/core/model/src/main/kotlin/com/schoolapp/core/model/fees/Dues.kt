package com.schoolapp.core.model.fees

/** Aging buckets 0–30 / 31–60 / 61–90 / 90+ days. */
data class DuesAging(val upTo30Minor: Long, val upTo60Minor: Long, val upTo90Minor: Long, val over90Minor: Long)

data class DuesRow(
    val studentId: String,
    val studentName: String,
    val admissionNo: String?,
    val className: String?,
    val sectionName: String?,
    val balanceMinor: Long,
    val oldestDueDays: Int?,
    val aging: DuesAging?,
)
