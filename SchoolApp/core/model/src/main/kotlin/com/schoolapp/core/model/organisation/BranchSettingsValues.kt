package com.schoolapp.core.model.organisation

/** Editable branch settings (same fields as the web "Branch settings" dialog); times are 24-hour `HH:mm`. */
data class BranchSettingsValues(
    val attendanceLockTime: String = "11:00",
    val diaryModeration: Boolean = false,
    val diaryClosingTime: String = "15:00",
    val officeFrom: String = "08:00",
    val officeTo: String = "16:00",
    val bankName: String = "",
    val bankAccountTitle: String = "",
    val bankAccountNumber: String = "",
    val bankBranchCode: String = "",
    val challanNote: String = "",
)
