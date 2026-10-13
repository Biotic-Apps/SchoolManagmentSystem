package com.schoolapp.feature.pickup

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.data.pickup.PickupRepository
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.files.UploadedFile
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

internal class FakePickupRepository : PickupRepository {
    var pickers: List<Picker> = emptyList()
    val outcomes = ArrayDeque<DepartureOutcome>()
    val departureInputs = mutableListOf<DepartureInput>()
    val added = mutableListOf<Pair<String, PickupPersonInput>>()
    val leaveInputs = mutableListOf<EarlyLeaveInput>()
    val personCalls = mutableListOf<String>()

    override suspend fun pickupPersons(studentId: String): AppResult<List<PickupPerson>> {
        personCalls += studentId
        return AppResult.Success(emptyList())
    }

    override suspend fun addPickupPerson(studentId: String, input: PickupPersonInput): AppResult<PickupPerson> {
        added += studentId to input
        return AppResult.Success(PickupPerson("p9", input.name, input.relation, input.cnic, input.phone, null, PickupPersonStatus.PENDING_VERIFICATION))
    }

    override suspend fun requestEarlyLeave(input: EarlyLeaveInput): AppResult<EarlyLeave> {
        leaveInputs += input
        return AppResult.Success(
            EarlyLeave("l1", input.studentId, null, null, null, input.date, input.time, input.reason, EarlyLeaveStatus.REQUESTED, null, null),
        )
    }

    override suspend fun earlyLeaves(branchId: String?, date: String?, status: EarlyLeaveStatus?, studentId: String?): AppResult<List<EarlyLeave>> =
        AppResult.Success(emptyList())

    override suspend fun approveEarlyLeave(id: String): AppResult<EarlyLeave> = error("unused")
    override suspend fun rejectEarlyLeave(id: String): AppResult<EarlyLeave> = error("unused")

    override suspend fun pickers(studentId: String): AppResult<List<Picker>> = AppResult.Success(pickers)

    override suspend fun recordDeparture(input: DepartureInput): AppResult<DepartureOutcome> {
        departureInputs += input
        return AppResult.Success(outcomes.removeFirst())
    }

    override suspend fun departures(branchId: String?, date: String): AppResult<List<Departure>> = AppResult.Success(emptyList())
}

internal class FakeFilesRepository : FilesRepository {
    override suspend fun upload(uri: String, purpose: FilePurpose): AppResult<UploadedFile> =
        AppResult.Success(UploadedFile("f1", "https://files/f1.jpg", "image/jpeg", 10, "photo.jpg"))
}
