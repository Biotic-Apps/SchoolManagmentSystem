package com.schoolapp.core.data.pickup

import com.schoolapp.core.data.common.clean
import com.schoolapp.core.model.common.enumOrDefault
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.DepartureInput
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveInput
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.model.pickup.Picker
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonInput
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.core.network.dto.people.GuardianLinkDto
import com.schoolapp.core.network.dto.pickup.DepartureBodyDto
import com.schoolapp.core.network.dto.pickup.DepartureDto
import com.schoolapp.core.network.dto.pickup.EarlyLeaveBodyDto
import com.schoolapp.core.network.dto.pickup.EarlyLeaveDto
import com.schoolapp.core.network.dto.pickup.PickedUpByBodyDto
import com.schoolapp.core.network.dto.pickup.PickupPersonBodyDto
import com.schoolapp.core.network.dto.pickup.PickupPersonDto

private const val VERIFIED = "VERIFIED"

internal fun PickupPersonDto.toModel() = PickupPerson(
    id = id,
    name = name,
    relation = relation,
    cnic = cnic,
    phone = phone,
    photoUrl = photoUrl ?: photo?.url,
    status = enumOrDefault(status, PickupPersonStatus.PENDING_VERIFICATION),
)

internal fun PickupPersonInput.toBody() = PickupPersonBodyDto(
    name = name.trim(),
    relation = relation.trim(),
    cnic = cnic.clean(),
    phone = phone.trim(),
    photoFileId = photoFileId,
)

internal fun EarlyLeaveDto.toModel() = EarlyLeave(
    id = id,
    studentId = student?.id ?: studentId.orEmpty(),
    studentName = student?.name,
    className = student?.className,
    sectionName = student?.sectionName,
    date = date,
    time = time,
    reason = reason.orEmpty(),
    status = enumOrDefault(status, EarlyLeaveStatus.REQUESTED),
    pickupPersonName = pickupPerson?.name,
    requestedByName = requestedBy?.name,
)

internal fun EarlyLeaveInput.toBody() = EarlyLeaveBodyDto(studentId, date, time, reason.trim(), pickupPersonId)

internal fun DepartureDto.toModel() = Departure(
    id = id,
    studentId = student?.id ?: studentId,
    studentName = student?.name,
    at = at,
    pickedUpByName = pickedUpBy?.name ?: pickedUpByName,
)

internal fun DepartureInput.toBody() = DepartureBodyDto(
    studentId = studentId,
    earlyLeaveId = earlyLeaveId,
    pickedUpBy = PickedUpByBodyDto(pickupPersonId = pickupPersonId, guardianId = guardianId.takeIf { pickupPersonId == null }),
)

/** Active guardian links (verified, or with no status) are trusted pickers; other links are skipped. */
internal fun GuardianLinkDto.toPicker(): Picker? {
    if (status != null && status != VERIFIED) return null
    return Picker(guardian.id, guardian.name, relation ?: guardian.relation, isGuardian = true, verified = true, photoUrl = null)
}

internal fun PickupPerson.toPicker() =
    Picker(id, name, relation, isGuardian = false, verified = status == PickupPersonStatus.VERIFIED, photoUrl = photoUrl)

/** Guardians plus pickup persons, verified ones first (stable within each group). */
internal fun pickers(guardians: List<GuardianLinkDto>, persons: List<PickupPerson>): List<Picker> =
    (guardians.mapNotNull { it.toPicker() } + persons.map { it.toPicker() })
        .distinctBy { it.isGuardian to it.id }
        .sortedByDescending { it.verified }
