package com.schoolapp.core.model.pickup

data class Departure(val id: String, val studentId: String?, val studentName: String?, val at: String?, val pickedUpByName: String?)

/** Exactly one of [pickupPersonId] / [guardianId] names who collected the student. */
data class DepartureInput(val studentId: String, val earlyLeaveId: String?, val pickupPersonId: String?, val guardianId: String?)

sealed interface DepartureOutcome {
    data class Recorded(val departure: Departure) : DepartureOutcome

    /** `403 PICKUP_NOT_AUTHORIZED`: picker not verified; the principal was alerted. */
    data class Blocked(val message: String?) : DepartureOutcome
}

/** Someone who may collect a student: a verified pickup person or a guardian. */
data class Picker(val id: String, val name: String, val relation: String?, val isGuardian: Boolean, val verified: Boolean, val photoUrl: String?)
