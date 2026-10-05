package com.schoolapp.core.model.approval

enum class ApprovalStatus {
    PENDING,
    APPROVED,
    REJECTED,
    RETURNED,
    CANCELLED,
    UNKNOWN,
    ;

    companion object {
        fun fromKey(key: String?): ApprovalStatus = entries.firstOrNull { it.name == key } ?: UNKNOWN
    }
}
