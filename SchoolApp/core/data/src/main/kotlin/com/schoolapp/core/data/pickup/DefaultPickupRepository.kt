package com.schoolapp.core.data.pickup

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.DepartureInput
import com.schoolapp.core.model.pickup.DepartureOutcome
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveInput
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.model.pickup.Picker
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.PickupApi
import com.schoolapp.core.network.api.StudentsApi
import com.schoolapp.core.network.model.ApiErrorCodes
import kotlinx.coroutines.async
import kotlinx.coroutines.coroutineScope
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultPickupRepository @Inject constructor(
    private val api: PickupApi,
    private val studentsApi: StudentsApi,
    private val apiCaller: ApiCaller,
) : PickupRepository {

    override suspend fun pickupPersons(studentId: String): AppResult<List<PickupPerson>> =
        apiCaller.call { api.pickupPersons(studentId).data.map { it.toModel() } }

    override suspend fun addPickupPerson(studentId: String, input: PickupPersonInput): AppResult<PickupPerson> =
        apiCaller.call { api.addPickupPerson(studentId, input.toBody()).data.toModel() }

    override suspend fun requestEarlyLeave(input: EarlyLeaveInput): AppResult<EarlyLeave> =
        apiCaller.call { api.requestEarlyLeave(input.toBody()).data.toModel() }

    override suspend fun earlyLeaves(branchId: String?, date: String?, status: EarlyLeaveStatus?, studentId: String?): AppResult<List<EarlyLeave>> =
        apiCaller.call {
            api.earlyLeaves(branchId, date, status?.name, studentId).data.map { it.toModel() }
                .sortedWith(compareBy({ it.date }, { it.time }))
        }

    override suspend fun approveEarlyLeave(id: String): AppResult<EarlyLeave> =
        apiCaller.call { api.approveEarlyLeave(id).data.toModel() }

    override suspend fun rejectEarlyLeave(id: String): AppResult<EarlyLeave> =
        apiCaller.call { api.rejectEarlyLeave(id).data.toModel() }

    override suspend fun pickers(studentId: String): AppResult<List<Picker>> = coroutineScope {
        val student = async { apiCaller.call { studentsApi.student(studentId).data.guardians } }
        val persons = async { pickupPersons(studentId) }
        when (val guardians = student.await()) {
            is AppResult.Failure -> guardians
            is AppResult.Success -> when (val people = persons.await()) {
                is AppResult.Failure -> people
                is AppResult.Success -> AppResult.Success(pickers(guardians.data, people.data))
            }
        }
    }

    override suspend fun recordDeparture(input: DepartureInput): AppResult<DepartureOutcome> =
        when (val result = apiCaller.call { api.recordDeparture(input.toBody()).data.toModel() }) {
            is AppResult.Success -> AppResult.Success(DepartureOutcome.Recorded(result.data))
            is AppResult.Failure -> {
                val error = result.error
                if (error is AppError.Forbidden && error.code == ApiErrorCodes.PICKUP_NOT_AUTHORIZED) {
                    AppResult.Success(DepartureOutcome.Blocked(null))
                } else {
                    result
                }
            }
        }

    override suspend fun departures(branchId: String?, date: String): AppResult<List<Departure>> =
        apiCaller.call { api.departures(branchId, date).data.map { it.toModel() }.sortedByDescending { it.at.orEmpty() } }
}
