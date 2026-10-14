package com.schoolapp.core.data.staff.idcard

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.staff.idcard.StaffIdCard

interface StaffIdCardRepository {
    /** Latest card, or null when none has been generated yet. */
    suspend fun card(staffId: String): AppResult<StaffIdCard?>

    /** Queues a new card version (`staff.edit`); poll [card] until it leaves PENDING. */
    suspend fun generate(staffId: String): AppResult<Unit>
}
