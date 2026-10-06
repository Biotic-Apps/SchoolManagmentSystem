package com.schoolapp.demo

import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.EarlyLeave
import com.schoolapp.core.model.pickup.EarlyLeaveStatus
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonStatus
import kotlinx.coroutines.flow.MutableStateFlow

/** Each of Imran Khan's children has one VERIFIED and one PENDING_VERIFICATION pickup person; Ayesha leaves early today. */
internal object DemoPickupData {

    val persons = MutableStateFlow(
        mapOf(
            DemoPeopleData.CHILD_1 to listOf(
                PickupPerson("demo-pp-1", "Rashid Khan", "Uncle", "35202-1234567-1", "03004561234", null, PickupPersonStatus.VERIFIED),
                PickupPerson("demo-pp-2", "Aslam Masih", "Van driver", "35202-7654321-3", "03111234567", null, PickupPersonStatus.PENDING_VERIFICATION),
            ),
            DemoPeopleData.CHILD_2 to listOf(
                PickupPerson("demo-pp-3", "Rashid Khan", "Uncle", "35202-1234567-1", "03004561234", null, PickupPersonStatus.VERIFIED),
                PickupPerson("demo-pp-4", "Nasreen Bibi", "Grandmother", null, "03224567812", null, PickupPersonStatus.PENDING_VERIFICATION),
            ),
        ),
    )

    val earlyLeaves = MutableStateFlow(
        listOf(
            EarlyLeave(
                "demo-el-1", DemoPeopleData.CHILD_1, "Ayesha Khan", "Class 5", "A", DemoDates.todayKey(), "11:30",
                "Dentist appointment", EarlyLeaveStatus.REQUESTED, "Rashid Khan", DemoActors.parent.name,
            ),
        ),
    )

    /** Departures with the local date they happened on. */
    val departures = MutableStateFlow<List<Pair<String, Departure>>>(emptyList())
}
