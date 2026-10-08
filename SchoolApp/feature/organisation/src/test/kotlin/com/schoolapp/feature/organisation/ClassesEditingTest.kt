package com.schoolapp.feature.organisation

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.classes.ClassNameProblem
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ClassesEditingTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view", "classes.view", "classes.add", "classes.edit"))
    private val coordinator = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "classes.view"))

    @Test
    fun add_and_reorder_follow_classes_add_and_edit() {
        val asPrincipal = classesViewModel(principal).uiState.value
        assertTrue(asPrincipal.canAdd)
        assertTrue(asPrincipal.canReorder)
        val asCoordinator = classesViewModel(coordinator).uiState.value
        assertFalse(asCoordinator.canAdd)
        assertFalse(asCoordinator.canReorder)
    }

    @Test
    fun add_class_validates_name_then_creates_after_the_last_class_and_opens_it() {
        val structure = FakeClassStructureRepository()
        val vm = classesViewModel(principal, structure = structure)
        vm.openAddClass()
        vm.submitAddClass()
        assertEquals(ClassNameProblem.REQUIRED, vm.uiState.value.addClass?.nameError)
        vm.onClassNameChange("class 5")
        vm.submitAddClass()
        assertEquals("existing name, any case", ClassNameProblem.DUPLICATE, vm.uiState.value.addClass?.nameError)
        vm.onClassNameChange("  Class 6 ")
        vm.submitAddClass()
        assertEquals(listOf(Triple("s1", "  Class 6 ", 6)), structure.created)
        assertNull(vm.uiState.value.addClass)
        assertEquals("new-class", vm.uiState.value.openClassId)
        vm.onClassOpened()
        assertNull(vm.uiState.value.openClassId)
    }

    @Test
    fun add_class_server_conflict_stays_in_the_sheet() {
        val structure = FakeClassStructureRepository().apply { failWith = conflict("CONFLICT", "Class name already used") }
        val vm = classesViewModel(principal, structure = structure)
        vm.openAddClass()
        vm.onClassNameChange("Class 7")
        vm.submitAddClass()
        val form = vm.uiState.value.addClass!!
        assertFalse(form.saving)
        assertEquals("Class name already used", (form.error!!.error as com.schoolapp.core.common.result.AppError.Server).message)
    }

    @Test
    fun reorder_moves_locally_and_saves_every_class_in_order() {
        val repository = FakeOrganisationRepository().apply {
            classes = listOf(SchoolClass("c1", "Class 1", 1, 0), SchoolClass("c2", "Class 2", 2, 0), SchoolClass("c3", "Class 3", 3, 0))
        }
        val structure = FakeClassStructureRepository()
        val vm = classesViewModel(principal, repository, structure)
        vm.startReorder()
        vm.moveClass(2, 0)
        vm.moveClass(0, -1)
        assertEquals(listOf("c3", "c1", "c2"), vm.uiState.value.reorder!!.map { it.id })
        vm.saveOrder()
        assertEquals(listOf(listOf("c3", "c1", "c2")), structure.orders)
        assertNull(vm.uiState.value.reorder)
    }

    @Test
    fun failed_reorder_keeps_the_draft_with_the_error() {
        val repository = FakeOrganisationRepository().apply {
            classes = listOf(SchoolClass("c1", "Class 1", 1, 0), SchoolClass("c2", "Class 2", 2, 0))
        }
        val structure = FakeClassStructureRepository().apply { failWith = com.schoolapp.core.common.result.AppError.Network }
        val vm = classesViewModel(principal, repository, structure)
        vm.startReorder()
        vm.moveClass(1, 0)
        vm.saveOrder()
        assertEquals(listOf("c2", "c1"), vm.uiState.value.reorder!!.map { it.id })
        assertEquals(com.schoolapp.core.common.result.AppError.Network, vm.uiState.value.actionError!!.error)
    }
}
