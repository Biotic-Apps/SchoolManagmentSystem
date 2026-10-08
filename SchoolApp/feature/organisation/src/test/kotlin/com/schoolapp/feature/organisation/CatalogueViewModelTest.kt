package com.schoolapp.feature.organisation

import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.catalogue.CatalogueKind
import com.schoolapp.feature.organisation.catalogue.CatalogueProblem
import com.schoolapp.feature.organisation.catalogue.CatalogueViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class CatalogueViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeCatalogueRepository()

    private fun viewModel(vararg permissions: String) =
        CatalogueViewModel(repository, FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, *permissions)), AcademicsEvents())
            .apply { bind("b1", "s1") }

    @Test
    fun permissions_match_the_web() {
        val principal = viewModel("classes.add", "classes.edit").uiState.value
        assertTrue(principal.canAddSubject)
        assertTrue(principal.canAddRoom)
        assertTrue(principal.canRename)
        val coordinator = viewModel("timetable.edit").uiState.value
        assertFalse(coordinator.canAddSubject)
        assertTrue("rooms: classes.add or timetable.edit", coordinator.canAddRoom)
        assertFalse(coordinator.canRename)
    }

    @Test
    fun lists_subjects_and_rooms() {
        val state = viewModel().uiState.value
        assertEquals(3, state.subjects.size)
        assertEquals(listOf("Room 101"), state.rooms.map { it.name })
    }

    @Test
    fun new_subject_is_validated_then_created() {
        val vm = viewModel("classes.add", "classes.edit")
        vm.openNew(CatalogueKind.SUBJECT)
        vm.onNameChange("E")
        vm.save()
        assertEquals(CatalogueProblem.TOO_SHORT, vm.uiState.value.editor!!.nameError)
        vm.onNameChange("english")
        vm.save()
        assertEquals(CatalogueProblem.DUPLICATE, vm.uiState.value.editor!!.nameError)
        vm.onNameChange("Geography")
        vm.save()
        assertEquals(listOf("Geography" to emptyList<String>()), repository.createdSubjects)
        assertNull(vm.uiState.value.editor)
    }

    @Test
    fun room_rename_keeps_its_own_name_and_checks_capacity() {
        val vm = viewModel("classes.edit")
        vm.openEdit(CatalogueKind.ROOM, "r1")
        vm.onCapacityChange("0")
        vm.save()
        assertTrue(vm.uiState.value.editor!!.capacityError)
        vm.onCapacityChange("40")
        vm.save()
        assertEquals(listOf("r1" to "Room 101"), repository.renamed)
    }

    @Test
    fun room_name_taken_from_server_stays_in_sheet() {
        val vm = viewModel("classes.add", "classes.edit")
        vm.openNew(CatalogueKind.ROOM)
        vm.onNameChange("Lab")
        repository.failWith = conflict("ROOM_NAME_TAKEN", "A room with this name already exists")
        vm.save()
        assertEquals("ROOM_NAME_TAKEN", (vm.uiState.value.editor!!.error!!.error as com.schoolapp.core.common.result.AppError.Server).code)
    }

    @Test
    fun rename_needs_classes_edit() {
        val vm = viewModel("classes.add")
        vm.openEdit(CatalogueKind.SUBJECT, "eng")
        assertNull(vm.uiState.value.editor)
    }
}
