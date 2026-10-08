package com.schoolapp.feature.students

import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.students.sections.MyClassesViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class MyClassesViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val students = FakeStudentsRepository().apply {
        searchResults = listOf(studentDetail("2", "Zara Khan").summary, studentDetail("1", "Ali Raza").summary)
    }

    private fun viewModel(role: RoleRef): MyClassesViewModel {
        val auth = FakeAuthRepository(TestSessions.session(role, "students.view"))
        return MyClassesViewModel(ScopedSections(auth, FakeOrganisationRepository()), students, auth)
    }

    private fun advance(millis: Long) {
        mainDispatcherRule.dispatcher.scheduler.advanceTimeBy(millis)
        mainDispatcherRule.dispatcher.scheduler.runCurrent()
    }

    @Test
    fun principal_search_debounces_and_replaces_sections_until_cleared() {
        val vm = viewModel(RoleKey.PRINCIPAL)
        assertTrue(vm.uiState.value.canSearch)
        assertEquals(1, vm.uiState.value.sections.size)

        vm.onQueryChange("A")
        advance(500)
        assertFalse(vm.uiState.value.showsSearch)
        assertTrue(students.searches.isEmpty())

        vm.onQueryChange("Al")
        vm.onQueryChange(" Ali ")
        advance(100)
        assertTrue(students.searches.isEmpty())
        advance(300)
        assertEquals(listOf<String?>("Ali"), students.searches)
        val state = vm.uiState.value
        assertTrue(state.showsSearch)
        assertFalse(state.isSearching)
        assertEquals(listOf("Ali Raza", "Zara Khan"), state.results.map { it.name })

        vm.onQueryChange("")
        advance(400)
        assertFalse(vm.uiState.value.showsSearch)
        assertTrue(vm.uiState.value.results.isEmpty())
        assertEquals(1, vm.uiState.value.sections.size)
    }

    @Test
    fun accountant_can_search_the_branch() {
        assertTrue(viewModel(RoleKey.ACCOUNTANT).uiState.value.canSearch)
    }

    @Test
    fun teacher_browses_own_sections_without_search() {
        val vm = viewModel(RoleKey.TEACHER)
        assertFalse(vm.uiState.value.canSearch)

        vm.onQueryChange("Ali")
        advance(1_000)
        assertFalse(vm.uiState.value.showsSearch)
        assertTrue(students.searches.isEmpty())
    }
}
