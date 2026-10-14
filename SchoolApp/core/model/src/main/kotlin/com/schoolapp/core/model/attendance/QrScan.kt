package com.schoolapp.core.model.attendance

/** Check-in or check-out by ID-card QR (`POST /attendance/qr-scan`). */
enum class QrScanDirection { IN, OUT }

enum class QrScanOutcome { MARKED, ALREADY_MARKED, NOT_FOUND, OUTSIDE_HOURS }

enum class QrPersonType { STUDENT, STAFF }

data class QrScanResult(
    val outcome: QrScanOutcome,
    val personType: QrPersonType?,
    val name: String?,
    val photoUrl: String?,
    val classLabel: String?,
    val designation: String?,
    val admissionNo: String?,
    val employeeNo: String?,
    /** ISO timestamp of the scan. */
    val timestamp: String,
)

/** One line of today's scan log. */
data class QrScanLog(
    val id: String,
    val personType: QrPersonType?,
    val name: String?,
    val outcome: QrScanOutcome,
    val scannedAt: String,
)
