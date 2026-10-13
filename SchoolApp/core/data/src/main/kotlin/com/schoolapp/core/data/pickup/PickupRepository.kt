package com.schoolapp.core.data.pickup

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

interface PickupRepository {
    suspend fun pickupPersons(studentId: String): AppResult<List<PickupPerson>>
    suspend fun addPickupPerson(studentId: String, input: PickupPersonInput): AppResult<PickupPerson>
    suspend fun requestEarlyLeave(input: EarlyLeaveInput): AppResult<EarlyLeave>
    suspend fun earlyLeaves(branchId: String? = null, date: String? = null, status: EarlyLeaveStatus? = null, studentId: String? = null): AppResult<List<EarlyLeave>>
    suspend fun approveEarlyLeave(id: String): AppResult<EarlyLeave>
    suspend fun rejectEarlyLeave(id: String): AppResult<EarlyLeave>

    /** Guardians plus pickup persons of the student, verified ones first. */
    suspend fun pickers(studentId: String): AppResult<List<Picker>>

    /** `403 PICKUP_NOT_AUTHORIZED` -> [DepartureOutcome.Blocked]. */
    suspend fun recordDeparture(input: DepartureInput): AppResult<DepartureOutcome>

    suspend fun departures(branchId: String? = null, date: String): AppResult<List<Departure>>
}
