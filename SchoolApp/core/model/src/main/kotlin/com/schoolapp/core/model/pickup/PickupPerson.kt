package com.schoolapp.core.model.pickup

enum class PickupPersonStatus { PENDING_VERIFICATION, VERIFIED, REVOKED }

data class PickupPerson(
    val id: String,
    val name: String,
    val relation: String?,
    val cnic: String?,
    val phone: String?,
    val photoUrl: String?,
    val status: PickupPersonStatus,
)

data class PickupPersonInput(val name: String, val relation: String, val cnic: String?, val phone: String, val photoFileId: String?)
