package com.schoolapp.core.network.dto.pickup

import com.schoolapp.core.network.dto.common.IdNameDto
import com.schoolapp.core.network.dto.files.AttachmentDto
import kotlinx.serialization.Serializable

@Serializable
data class PickupPersonDto(
    val id: String,
    val name: String = "",
    val relation: String? = null,
    val cnic: String? = null,
    val phone: String? = null,
    val photoUrl: String? = null,
    val photo: AttachmentDto? = null,
    val status: String? = null,
)

@Serializable
data class PickupPersonBodyDto(
    val name: String,
    val relation: String,
    val cnic: String? = null,
    val phone: String,
    val photoFileId: String? = null,
)

@Serializable
data class EarlyLeaveDto(
    val id: String,
    val student: EarlyLeaveStudentDto? = null,
    val studentId: String? = null,
    val date: String = "",
    val time: String = "",
    val reason: String? = null,
    val status: String? = null,
    val pickupPerson: IdNameDto? = null,
    val requestedBy: IdNameDto? = null,
)

@Serializable
data class EarlyLeaveStudentDto(
    val id: String? = null,
    val name: String? = null,
    val className: String? = null,
    val sectionName: String? = null,
)

@Serializable
data class EarlyLeaveBodyDto(
    val studentId: String,
    val date: String,
    val time: String,
    val reason: String,
    val pickupPersonId: String? = null,
)

@Serializable
data class DepartureDto(
    val id: String,
    val student: IdNameDto? = null,
    val studentId: String? = null,
    val at: String? = null,
    val pickedUpBy: PickedUpByDto? = null,
    val pickedUpByName: String? = null,
)

@Serializable
data class PickedUpByDto(
    val pickupPersonId: String? = null,
    val guardianId: String? = null,
    val name: String? = null,
)

@Serializable
data class DepartureBodyDto(
    val studentId: String,
    val earlyLeaveId: String? = null,
    val pickedUpBy: PickedUpByBodyDto,
)

@Serializable
data class PickedUpByBodyDto(val pickupPersonId: String? = null, val guardianId: String? = null)
