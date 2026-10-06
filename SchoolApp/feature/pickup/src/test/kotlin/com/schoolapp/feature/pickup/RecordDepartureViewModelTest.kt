package com.schoolapp.feature.pickup

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.model.pickup.Departure
import com.schoolapp.core.model.pickup.DepartureInput
import com.schoolapp.core.model.pickup.DepartureOutcome
import com.schoolapp.core.model.pickup.Picker
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.feature.pickup.departure.RecordDepartureViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNotNull
import org.junit.Assert.assertNull
import org.junit.Rule
import org.junit.Test

class RecordDepartureViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakePickupRepository().apply {
        pickers = listOf(
            Picker("p2", "Driver Aslam", "Driver", isGuardian = false, verified = false, photoUrl = null),
            Picker("g1", "Imran Khan", "Father", isGuardian = true, verified = true, photoUrl = null),
        )
    }

    private fun viewModel() = RecordDepartureViewModel(
        SavedStateHandle(mapOf("studentId" to "s1", "studentName" to "Ayesha", "earlyLeaveId" to "l1", "leaveTime" to "11:00")),
        repository,
    )

    @Test
    fun blocked_outcome_shows_blocked_state_and_allows_choosing_another_picker() {
        repository.outcomes += DepartureOutcome.Blocked("PICKUP_NOT_AUTHORIZED")
        repository.outcomes += DepartureOutcome.Recorded(Departure("d1", "s1", "Ayesha", "2026-10-06T06:00:00Z", "Imran Khan"))
        val vm = viewModel()
        assertEquals(listOf("g1", "p2"), vm.uiState.value.pickers.map { it.id })

        vm.onPickerSelected("p2")
        vm.confirm()
        val blocked = vm.uiState.value.blocked
        assertNotNull(blocked)
        assertEquals("Driver Aslam", blocked!!.pickerName)
        assertEquals(DepartureInput("s1", "l1", pickupPersonId = "p2", guardianId = null), repository.departureInputs.single())

        vm.onPickerSelected("g1")
        assertEquals("p2", vm.uiState.value.selectedPickerId)

        vm.chooseAnother()
        assertNull(vm.uiState.value.blocked)
        assertNull(vm.uiState.value.selectedPickerId)

        vm.onPickerSelected("g1")
        vm.confirm()
        assertEquals(DepartureInput("s1", "l1", pickupPersonId = null, guardianId = "g1"), repository.departureInputs.last())
        assertEquals("d1", vm.uiState.value.recorded?.id)
        assertNull(vm.uiState.value.blocked)
    }
}
