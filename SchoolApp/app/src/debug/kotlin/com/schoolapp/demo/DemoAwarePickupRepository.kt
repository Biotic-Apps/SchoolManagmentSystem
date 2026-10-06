package com.schoolapp.demo

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.pickup.DefaultPickupRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.DepartureInput
import com.schoolapp.core.model.pickup.DepartureOutcome
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveInput
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.model.pickup.Picker
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonInput
import com.schoolapp.core.model.pickup.PickupPersonStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwarePickupRepository @Inject constructor(
    private val real: DefaultPickupRepository,
    private val auth: DemoAwareAuthRepository,
) : PickupRepository {

    override suspend fun pickupPersons(studentId: String): AppResult<List<PickupPerson>> =
        if (auth.isDemoActive) AppResult.Success(DemoPickupData.persons.value[studentId].orEmpty()) else real.pickupPersons(studentId)

    override suspend fun addPickupPerson(studentId: String, input: PickupPersonInput): AppResult<PickupPerson> {
        if (!auth.isDemoActive) return real.addPickupPerson(studentId, input)
        val person = PickupPerson(
            "demo-pp-${System.currentTimeMillis()}", input.name, input.relation, input.cnic, input.phone,
            input.photoFileId?.let { DemoFiles.uploaded[it]?.url }, PickupPersonStatus.PENDING_VERIFICATION,
        )
        DemoPickupData.persons.update { all -> all + (studentId to all[studentId].orEmpty() + person) }
        return AppResult.Success(person)
    }

    override suspend fun requestEarlyLeave(input: EarlyLeaveInput): AppResult<EarlyLeave> {
        if (!auth.isDemoActive) return real.requestEarlyLeave(input)
        val student = DemoPeopleData.students.firstOrNull { it.id == input.studentId }
        val leave = EarlyLeave(
            id = "demo-el-${System.currentTimeMillis()}",
            studentId = input.studentId,
            studentName = student?.name,
            className = student?.className,
            sectionName = student?.sectionName,
            date = input.date,
            time = input.time,
            reason = input.reason,
            status = EarlyLeaveStatus.REQUESTED,
            pickupPersonName = DemoPickupData.persons.value[input.studentId].orEmpty().firstOrNull { it.id == input.pickupPersonId }?.name,
            requestedByName = DemoActors.forRole(auth.demoSession.value?.activeRole).name,
        )
        DemoPickupData.earlyLeaves.update { listOf(leave) + it }
        return AppResult.Success(leave)
    }

    override suspend fun earlyLeaves(branchId: String?, date: String?, status: EarlyLeaveStatus?): AppResult<List<EarlyLeave>> {
        if (!auth.isDemoActive) return real.earlyLeaves(branchId, date, status)
        return AppResult.Success(
            DemoPickupData.earlyLeaves.value.filter { (date == null || it.date == date) && (status == null || it.status == status) }
                .sortedBy { it.date + it.time },
        )
    }

    override suspend fun approveEarlyLeave(id: String): AppResult<EarlyLeave> =
        if (auth.isDemoActive) setLeaveStatus(id, EarlyLeaveStatus.APPROVED) else real.approveEarlyLeave(id)

    override suspend fun rejectEarlyLeave(id: String): AppResult<EarlyLeave> =
        if (auth.isDemoActive) setLeaveStatus(id, EarlyLeaveStatus.REJECTED) else real.rejectEarlyLeave(id)

    override suspend fun pickers(studentId: String): AppResult<List<Picker>> {
        if (!auth.isDemoActive) return real.pickers(studentId)
        val guardians = DemoPeopleData.detail(studentId)?.guardians.orEmpty().map {
            Picker(it.guardian.id, it.guardian.name, it.relation, isGuardian = true, verified = true, photoUrl = null)
        }
        val persons = DemoPickupData.persons.value[studentId].orEmpty()
            .filter { it.status != PickupPersonStatus.REVOKED }
            .map { Picker(it.id, it.name, it.relation, isGuardian = false, verified = it.status == PickupPersonStatus.VERIFIED, photoUrl = it.photoUrl) }
        return AppResult.Success((guardians + persons).sortedByDescending { it.verified })
    }

    override suspend fun recordDeparture(input: DepartureInput): AppResult<DepartureOutcome> {
        if (!auth.isDemoActive) return real.recordDeparture(input)
        val person = input.pickupPersonId?.let { id -> DemoPickupData.persons.value[input.studentId].orEmpty().firstOrNull { it.id == id } }
        if (input.pickupPersonId != null && person?.status != PickupPersonStatus.VERIFIED) {
            return AppResult.Success(
                DepartureOutcome.Blocked("${person?.name ?: "This person"} is not verified to collect this student. The principal has been alerted."),
            )
        }
        val pickedUpBy = person?.name
            ?: DemoPeopleData.detail(input.studentId)?.guardians?.firstOrNull { it.guardian.id == input.guardianId }?.guardian?.name
        val departure = Departure(
            "demo-dep-${System.currentTimeMillis()}", input.studentId,
            DemoPeopleData.students.firstOrNull { it.id == input.studentId }?.name, DemoDates.isoNow(), pickedUpBy,
        )
        DemoPickupData.departures.update { it + (DemoDates.todayKey() to departure) }
        input.earlyLeaveId?.let { setLeaveStatus(it, EarlyLeaveStatus.DEPARTED) }
        return AppResult.Success(DepartureOutcome.Recorded(departure))
    }

    override suspend fun departures(branchId: String?, date: String): AppResult<List<Departure>> =
        if (auth.isDemoActive) {
            AppResult.Success(DemoPickupData.departures.value.filter { it.first == date }.map { it.second }.sortedByDescending { it.at })
        } else {
            real.departures(branchId, date)
        }

    private fun setLeaveStatus(id: String, status: EarlyLeaveStatus): AppResult<EarlyLeave> {
        DemoPickupData.earlyLeaves.update { list -> list.map { if (it.id == id) it.copy(status = status) else it } }
        return DemoPickupData.earlyLeaves.value.firstOrNull { it.id == id }?.let { AppResult.Success(it) }
            ?: AppResult.Failure(AppError.Server(404, "NOT_FOUND", null))
    }
}
