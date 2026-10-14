package com.schoolapp.core.model.idcards

import com.schoolapp.core.model.staff.idcard.IdCardStatus

/** Latest printable ID card version of a student; [fileUrl] is signed and set once [status] is READY. */
data class StudentIdCard(
    val status: IdCardStatus,
    val fileUrl: String?,
    val version: Int,
    val generatedAt: String?,
)

/** What to print on A4 ID card sheets: one section, or a whole branch (optionally one class of it). */
sealed interface IdCardPrintTarget {
    data class Section(val sectionId: String) : IdCardPrintTarget
    data class Branch(val branchId: String, val classId: String? = null) : IdCardPrintTarget
}

/** Finished bulk print: signed PDF link and how many students are on it. */
data class IdCardSheets(val fileUrl: String, val count: Int)
