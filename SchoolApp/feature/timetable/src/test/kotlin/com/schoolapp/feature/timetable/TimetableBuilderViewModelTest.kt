package com.schoolapp.feature.timetable

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.designsystem.component.SaveStatus
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.timetable.TimetableState
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.timetable.builder.BuilderNotice
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class TimetableBuilderViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val principal = FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "timetable.view", "timetable.edit", "timetable.publish"))
    private val coordinator = FakeAuthRepository(TestSessions.session(RoleKey.COORDINATOR, "timetable.view", "timetable.edit"))
    private val repository = FakeBuilderRepository()

    @Test
    fun loads_section_choices_and_the_first_section() {
        val state = builderViewModel(principal, repository).uiState.value
        assertEquals(listOf("Class 1 · A", "Class 1 · B (Arts)"), state.choices.map { it.label })
        assertEquals("sA", state.sectionId)
        assertEquals(listOf(1, 2, 3, 4, 5), state.days)
        assertEquals(listOf("t1", "t2"), state.staff.map { it.id })
    }

    @Test
    fun publish_only_for_timetable_publish_and_reason_from_server() {
        val asPrincipal = builderViewModel(principal, repository).uiState.value
        assertTrue(asPrincipal.mayPublish)
        assertEquals("Add at least one lesson first", asPrincipal.publishBlockedReason)
        assertFalse(builderViewModel(coordinator, repository).uiState.value.mayPublish)
    }

    @Test
    fun opening_a_period_needs_edit_rights() {
        repository.current = builder(canEdit = false)
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 1)
        assertNull(vm.uiState.value.editor)
    }

    @Test
    fun picking_a_subject_prefills_its_teacher_and_allocate_only_without_one() {
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 1)
        vm.lessons.setSubject("eng")
        assertEquals("t1", vm.uiState.value.editor!!.staffId)
        assertFalse(vm.lessons.canAllocate(vm.uiState.value))
        vm.lessons.setSubject("urd")
        assertEquals("teacher kept when the new subject has none", "t1", vm.uiState.value.editor!!.staffId)
        assertTrue(vm.lessons.canAllocate(vm.uiState.value))
    }

    @Test
    fun save_requires_subject_and_teacher() {
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 2)
        vm.saveLesson()
        assertTrue(vm.uiState.value.editor!!.showErrors)
        assertTrue(repository.saved.isEmpty())
    }

    @Test
    fun saving_a_lesson_autosaves_and_applies_the_server_answer() {
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 2)
        vm.lessons.setSubject("eng")
        vm.lessons.setRoom("r1")
        vm.saveLesson()
        val (day, index, input) = repository.saved.single()
        assertEquals(1 to 2, day to index)
        assertEquals("eng", input.subjectId)
        assertEquals("t1", input.staffId)
        assertFalse("English already has a teacher", input.allocate)
        val state = vm.uiState.value
        assertNull(state.editor)
        assertEquals("English", state.builder!!.draft.slotAt(1, 2)!!.subject.name)
        assertEquals(TimetableState.DRAFT, state.builder!!.draft.state)
        assertTrue(state.builder!!.draft.canPublish)
        assertEquals(1, state.builder!!.lessons.first().placed)
        assertEquals(listOf("WEEKLY_PERIODS_SHORT"), state.builder!!.conflicts.map { it.type })
        assertEquals(SaveStatus.SAVED, state.saveStatus)
    }

    @Test
    fun refused_lesson_goes_back_with_the_server_reason() {
        val vm = builderViewModel(principal, repository)
        repository.failWith = AppError.Server(400, "BREAK_PERIOD", "Period 3 is a break on Monday")
        vm.lessons.open(1, 1)
        vm.lessons.setSubject("eng")
        vm.saveLesson()
        val state = vm.uiState.value
        assertNull(state.builder!!.draft.slotAt(1, 1))
        assertEquals(0, state.builder!!.lessons.first().placed)
        assertEquals("BREAK_PERIOD", (state.actionError!!.error as AppError.Server).code)
        assertEquals(SaveStatus.FAILED, state.saveStatus)
    }

    @Test
    fun remove_lesson_clears_the_cell() {
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 1)
        vm.lessons.setSubject("eng")
        vm.saveLesson()
        vm.lessons.open(1, 1)
        assertTrue(vm.uiState.value.editor!!.existing)
        vm.removeLesson()
        assertEquals(listOf(1 to 1), repository.removed)
        assertNull(vm.uiState.value.builder!!.draft.slotAt(1, 1))
        assertEquals(TimetableState.EMPTY, vm.uiState.value.builder!!.draft.state)
    }

    @Test
    fun new_room_from_the_sheet_is_selected() {
        val vm = builderViewModel(principal, repository)
        vm.lessons.open(1, 1)
        vm.createRoom("Lab")
        assertEquals("new-room", vm.uiState.value.editor!!.roomId)
        assertTrue(vm.uiState.value.builder!!.rooms.any { it.name == "Lab" })
    }

    @Test
    fun publish_reports_success_or_the_server_error() {
        val vm = builderViewModel(principal, repository)
        vm.publish()
        assertEquals(BuilderNotice.PUBLISHED, vm.uiState.value.notice)
        repository.failWith = AppError.Server(409, "TIMETABLE_CONFLICTS", "Fix 2 conflicts first", """[{"message":"Mon P1: Ms Sana busy"}]""")
        vm.publish()
        assertEquals(listOf("Mon P1: Ms Sana busy"), vm.uiState.value.actionError!!.details)
        assertFalse(vm.uiState.value.publishing)
    }

    @Test
    fun discard_offered_only_with_unpublished_changes_and_publish_right() {
        repository.current = builder(state = TimetableState.PUBLISHED_WITH_CHANGES)
        assertTrue(builderViewModel(principal, repository).uiState.value.showDiscard)
        assertFalse(builderViewModel(coordinator, repository).uiState.value.showDiscard)
    }

    @Test
    fun teacher_builder_opens_the_given_section() {
        val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "timetable.view", "timetable.edit"))
        val state = builderViewModel(teacher, repository, sectionId = "sB").uiState.value
        assertEquals("sB", state.sectionId)
        assertFalse(state.mayPublish)
    }
}
