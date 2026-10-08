package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.data.academics.AcademicsEvents
import com.schoolapp.core.designsystem.component.SaveStatus
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.academics.AllocationCell
import com.schoolapp.core.model.academics.CatalogueSubject
import com.schoolapp.core.model.academics.NamedRef
import com.schoolapp.core.model.academics.SectionChange
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.setup.ClassLevel
import com.schoolapp.feature.organisation.setup.ClassSetupViewModel
import com.schoolapp.feature.organisation.setup.SectionNames
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ClassSetupViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val structure = FakeClassStructureRepository()
    private val allocation = FakeTeacherAllocationRepository()
    private val catalogue = FakeCatalogueRepository()
    private val principal = FakeAuthRepository(
        TestSessions.session(RoleKey.PRINCIPAL, "classes.view", "classes.add", "classes.edit", "classes.delete", "timetable.edit"),
    )

    private fun viewModel(auth: FakeAuthRepository = principal) = ClassSetupViewModel(
        SavedStateHandle(mapOf("classId" to "c1", "branchId" to "b1", "sessionId" to "se1", "schoolId" to "s1")),
        structure, allocation, catalogue, FakeBellRepository(), auth, AcademicsEvents(),
    )

    private fun settle() = mainDispatcherRule.dispatcher.scheduler.advanceUntilIdle()

    @Test
    fun loads_setup_rights_and_weekly_periods() {
        val state = viewModel().uiState.value
        assertEquals("Class 1", state.setup!!.className)
        assertTrue(state.rights.addSection)
        assertTrue(state.rights.removeSection)
        assertTrue(state.rights.createRoom)
        assertEquals("5 days × 5 teaching rows", 25, state.weeklyPeriods)
        assertEquals(listOf(null to 12), state.plannedByGroup)
        assertEquals(listOf("isl"), state.addableSubjects.map { it.id })
    }

    @Test
    fun role_without_add_or_delete_gets_no_section_buttons() {
        val editor = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "classes.view", "classes.edit"))
        val rights = viewModel(editor).uiState.value.rights
        assertFalse(rights.addSection)
        assertFalse(rights.removeSection)
        assertFalse(rights.createSubject)
        structure.setup = classSetup(canEdit = false, canAllocate = false)
        val viewer = viewModel(editor).uiState.value.rights
        assertFalse(viewer.editStructure)
        assertFalse(viewer.allocate)
    }

    @Test
    fun subject_edits_are_debounced_into_one_ordered_save() {
        val vm = viewModel()
        vm.curriculum.setPeriods("eng", 7)
        vm.curriculum.move(1, 0)
        vm.curriculum.setOptional("eng", true)
        assertEquals("shown at once", 7, vm.uiState.value.subjects.first { it.subjectId == "eng" }.periodsPerWeek)
        assertTrue(structure.subjectSaves.isEmpty())
        settle()
        assertEquals(1, structure.subjectSaves.size)
        assertEquals(listOf("urd", "eng"), structure.subjectSaves.single().map { it.subjectId })
        assertTrue(structure.subjectSaves.single().last().isOptional)
        assertEquals(SaveStatus.SAVED, vm.uiState.value.saveStatus)
    }

    @Test
    fun removing_a_subject_in_use_brings_it_back_with_the_server_reason() {
        val vm = viewModel()
        structure.failWith = conflict("SUBJECT_IN_USE", "Subject is still taught", """["English: 2 teacher assignments, 11 lessons"]""")
        vm.curriculum.remove("eng")
        assertEquals(listOf("urd"), vm.uiState.value.subjects.map { it.subjectId })
        settle()
        val state = vm.uiState.value
        assertEquals(listOf("eng", "urd"), state.subjects.map { it.subjectId })
        val error = state.subjectErrors.getValue("eng")
        assertEquals(listOf("English: 2 teacher assignments, 11 lessons"), error.details)
        assertNull(state.banner)
        assertEquals(SaveStatus.FAILED, state.saveStatus)
    }

    @Test
    fun other_subject_save_failures_go_to_the_banner() {
        val vm = viewModel()
        structure.failWith = AppError.Network
        vm.curriculum.setPeriods("urd", 3)
        settle()
        assertEquals(AppError.Network, vm.uiState.value.banner!!.error)
        assertEquals(6, vm.uiState.value.subjects.first { it.subjectId == "urd" }.periodsPerWeek)
    }

    @Test
    fun add_existing_and_create_new_subject() {
        val vm = viewModel()
        vm.curriculum.add(CatalogueSubject("isl", "ISL", "Islamiat"))
        settle()
        assertEquals(listOf("eng", "urd", "isl"), structure.subjectSaves.last().map { it.subjectId })
        vm.curriculum.createNew("Pak Studies")
        assertEquals(listOf("Pak Studies" to listOf("c1")), catalogue.createdSubjects)
    }

    @Test
    fun preset_adds_only_missing_subjects_creating_unknown_ones() {
        structure.nameOf = { id -> catalogue.subjects.first { it.id == id }.name }
        val vm = viewModel()
        vm.curriculum.applyPreset(ClassLevel.EARLY)
        settle()
        val names = vm.uiState.value.subjects.map { it.name }
        assertEquals(listOf("English", "Urdu", "Mathematics", "Nazra Quran", "General Knowledge", "Art & Drawing"), names)
        assertEquals(listOf("Mathematics", "Nazra Quran", "General Knowledge", "Art & Drawing"), catalogue.createdSubjects.map { it.first })
        assertEquals(4, vm.uiState.value.subjects.first { it.name == "Nazra Quran" }.periodsPerWeek)
        assertFalse(vm.uiState.value.applyingPreset)
    }

    @Test
    fun sections_add_next_letter_and_save_room_group_seats() {
        val vm = viewModel()
        vm.sections.add()
        settle()
        assertEquals("B", structure.addedSections.single().name)
        assertEquals(40, structure.addedSections.single().capacity)
        vm.sections.setGroup("sA", "Science")
        vm.sections.setRoom("sA", null)
        vm.sections.setSeats("sA", 41)
        vm.sections.setSeats("sA", 42)
        settle()
        assertEquals(
            listOf("sA" to SectionChange.Group("Science"), "sA" to SectionChange.Room(null), "sA" to SectionChange.Capacity(42)),
            structure.sectionChanges,
        )
    }

    @Test
    fun new_room_from_a_section_is_created_and_assigned() {
        val vm = viewModel()
        vm.sections.createRoom("sA", "Lab 1")
        settle()
        assertEquals(listOf("Lab 1"), catalogue.createdRooms)
        assertEquals("sA" to SectionChange.Room("room-Lab 1"), structure.sectionChanges.single())
    }

    @Test
    fun section_in_use_shows_the_reason_in_the_dialog() {
        val vm = viewModel()
        vm.sections.askRemove(vm.uiState.value.sections.first())
        structure.failWith = conflict("SECTION_IN_USE", "Section has students", """["30 students enrolled"]""")
        vm.sections.confirmRemove()
        settle()
        val state = vm.uiState.value
        assertEquals("A", state.removeSection?.name)
        assertEquals(listOf("30 students enrolled"), state.removeError!!.details)
        assertFalse(state.removing)
    }

    @Test
    fun teachers_same_for_all_copies_the_first_chosen_teacher() {
        structure.setup = classSetup(sections = listOf(section("sA", "A"), section("sB", "B"), section("sC", "C"))).let {
            it.copy(allocation = listOf(AllocationCell("sB", "eng", NamedRef("t1", "Ms Sana"), 0)))
        }
        val vm = viewModel()
        assertEquals(5, vm.uiState.value.setup!!.unallocated)
        vm.teachers.sameForAll("eng")
        settle()
        assertEquals(listOf(Triple("sA", "eng", "t1"), Triple("sC", "eng", "t1")), allocation.subjectTeachers)
        assertNull(vm.uiState.value.fillingSubjectId)
    }

    @Test
    fun own_assignment_error_is_shown_as_sent() {
        val vm = viewModel()
        allocation.failWith = AppError.Forbidden("OWN_ASSIGNMENT", "Ask the principal to change your own assignments")
        vm.teachers.setTeacher("sA", "eng", "t1")
        settle()
        assertEquals("OWN_ASSIGNMENT", (vm.uiState.value.banner!!.error as AppError.Forbidden).code)
    }

    @Test
    fun section_names_continue_the_alphabet() {
        assertEquals("A", SectionNames.next(emptyList()))
        assertEquals("C", SectionNames.next(listOf("A", "b")))
    }
}
