package com.schoolapp.core.model.settings

/** What a data import creates; [key] is the API value. */
enum class ImportKind(val key: String) {
    STUDENTS("STUDENTS"),
    GUARDIANS("GUARDIANS"),
    STAFF("STAFF"),
    OPENING_BALANCES("OPENING_BALANCES"),
    FEE_PLANS("FEE_PLANS"),
    ;

    companion object {
        fun fromKey(key: String?): ImportKind? = entries.firstOrNull { it.key == key }
    }
}

data class ImportTotals(val rows: Int, val valid: Int, val invalid: Int)

data class ImportRowError(val row: Int, val column: String?, val message: String)

/** A preview or reconciliation value as the server sent it. */
sealed interface ImportValue {
    data class Text(val value: String) : ImportValue
    data class Number(val value: Double) : ImportValue
    data class Bool(val value: Boolean) : ImportValue
    data class Json(val raw: String) : ImportValue
    data object Empty : ImportValue
}

/** History row. */
data class ImportSummary(
    val id: String,
    val kind: String,
    val status: String,
    val fileName: String?,
    val totals: ImportTotals?,
    val startedAt: String?,
    val startedBy: String?,
)

/** One import with its validation result, polled while VALIDATING or COMMITTING. */
data class ImportDetail(
    val id: String,
    val kind: String?,
    val status: String,
    val fileName: String?,
    val totals: ImportTotals,
    val errors: List<ImportRowError>,
    /** Parsed rows, each as ordered key → value. */
    val preview: List<Map<String, ImportValue>>,
    val reconciliation: Map<String, ImportValue>?,
    val error: String?,
) {
    val isBusy: Boolean get() = status in BUSY

    companion object {
        const val VALIDATING = "VALIDATING"
        const val READY = "READY"
        const val INVALID = "INVALID"
        const val COMMITTING = "COMMITTING"
        const val COMMITTED = "COMMITTED"
        const val REVERTED = "REVERTED"
        const val FAILED = "FAILED"
        val BUSY = setOf(VALIDATING, COMMITTING)
    }
}
