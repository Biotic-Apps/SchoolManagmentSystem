package com.schoolapp.feature.progress

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.data.organisation.ScopedSections
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.model.progress.HomeworkStatus
import com.schoolapp.core.model.progress.HomeworkTick
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.progress.homework.HomeworkMessage
import com.schoolapp.feature.progress.homework.HomeworkViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class HomeworkViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val auth = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "progress.edit"))
    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val roster = listOf(student("a", "Ayesha Khan", 1), student("b", "Bilal Ahmed", 2), student("c", "Fatima Noor", 3))
    private val diary = FakeDiaryRepository(
        listOf(
            diaryEntry("d1", "2026-10-06", "Exercise 4.2"),
            diaryEntry("d2", "2026-10-06", null),
            diaryEntry("d3", "2026-10-06", "Draft only", DiaryStatus.DRAFT),
            diaryEntry("d4", "2026-10-05", "Read chapter 3"),
        ),
    )
    private val progress = FakeProgressRepository()

    private fun viewModel() = HomeworkViewModel(
        ScopedSections(auth, FakeOrganisationRepository()),
        diary,
        FakeStudentsRepository(roster),
        progress,
        clock,
    )

    @Test
    fun lists_only_entries_with_homework_for_the_date() {
        val vm = viewModel()
        assertEquals("s1", vm.uiState.value.selectedSectionId)
        assertEquals("2026-10-06", vm.uiState.value.date)
        assertEquals(listOf("d1"), vm.uiState.value.entries.map { it.id })
        vm.onDateChange("2026-10-05")
        assertEquals(listOf("d4"), vm.uiState.value.entries.map { it.id })
        vm.onDateChange("2026-10-09")
        assertEquals("2026-10-06", vm.uiState.value.date)
    }

    @Test
    fun save_requires_at_least_one_tick_and_sends_only_ticked() {
        val vm = viewModel()
        vm.onEntrySelected(vm.uiState.value.entries.first())
        assertEquals(3, vm.uiState.value.roster.size)
        assertTrue(vm.uiState.value.ticks.isEmpty())

        vm.save()
        assertEquals(HomeworkMessage.NeedTick, vm.uiState.value.message)
        assertTrue(progress.homeworkCalls.isEmpty())

        vm.onTick("b", HomeworkStatus.PARTIAL)
        vm.save()
        assertEquals("d1" to listOf(HomeworkTick("b", HomeworkStatus.PARTIAL)), progress.homeworkCalls.single())
        assertEquals(HomeworkMessage.Saved, vm.uiState.value.message)
    }

    @Test
    fun mark_all_done_ticks_every_student() {
        val vm = viewModel()
        vm.onEntrySelected(vm.uiState.value.entries.first())
        vm.markAllDone()
        vm.onTick("c", HomeworkStatus.NOT_DONE)
        vm.save()
        assertEquals(
            listOf(HomeworkTick("a", HomeworkStatus.DONE), HomeworkTick("b", HomeworkStatus.DONE), HomeworkTick("c", HomeworkStatus.NOT_DONE)),
            progress.homeworkCalls.single().second,
        )
    }

    @Test
    fun failed_save_is_reported() {
        progress.homeworkError = AppError.Network
        val vm = viewModel()
        vm.onEntrySelected(vm.uiState.value.entries.first())
        vm.onTick("a", HomeworkStatus.DONE)
        vm.save()
        assertEquals(HomeworkMessage.Failed(AppError.Network), vm.uiState.value.message)
    }
}
