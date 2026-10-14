package com.schoolapp.core.data.idcards

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.idcards.IdCardPrintTarget
import com.schoolapp.core.model.idcards.IdCardSheets
import com.schoolapp.core.model.idcards.StudentIdCard

interface StudentIdCardRepository {
    /** Latest card, or null when none has been generated yet. */
    suspend fun card(studentId: String): AppResult<StudentIdCard?>

    /** Queues a new card version (`students.edit`); poll [card] until it leaves PENDING. */
    suspend fun generate(studentId: String): AppResult<Unit>

    /** Queues A4 sheets (`students.edit`) and waits for the PDF job; returns the signed link. */
    suspend fun printSheets(target: IdCardPrintTarget): AppResult<IdCardSheets>
}
