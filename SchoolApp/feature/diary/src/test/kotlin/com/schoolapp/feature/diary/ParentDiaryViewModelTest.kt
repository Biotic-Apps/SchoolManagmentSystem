package com.schoolapp.feature.diary

import com.schoolapp.core.common.time.AppClock
import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.diary.DiaryStatus
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.diary.parent.ParentDiaryViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test
import java.time.LocalDateTime

class ParentDiaryViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val clock = AppClock { LocalDateTime.of(2026, 10, 6, 9, 0) }
    private val parent = FakeAuthRepository(
        TestSessions.session(RoleKey.PARENT, "diary.view", branchId = null).copy(
            children = listOf(ChildSummary("st1", "Ali Khan"), ChildSummary("st2", "Omar Khan")),
            activeChildId = "st1",
        ),
    )

    @Test
    fun feed_shows_only_published_entries_newest_day_first() {
        val diary = FakeDiaryRepository().apply {
            entries = listOf(
                entry("e1", "2026-10-02"),
                entry("e2", "2026-10-05", DiaryStatus.DRAFT),
                entry("e3", "2026-10-05", subjectId = "eng", subjectName = "English"),
                entry("e4", "2026-10-06", DiaryStatus.SUBMITTED),
                entry("e5", "2026-10-04"),
            )
        }
        val vm = ParentDiaryViewModel(parent, FakeStudentsRepository("s1"), diary, clock)
        val days = vm.uiState.value.days
        assertEquals(listOf("2026-10-05", "2026-10-04", "2026-10-02"), days.map { it.date })
        assertEquals(listOf("e3", "e5", "e1"), days.flatMap { it.entries }.map { it.id })
        assertEquals(Triple("s1", "2026-09-23", "2026-10-06"), diary.entryQueries.last())
    }

    @Test
    fun switching_child_reloads_the_feed() {
        val diary = FakeDiaryRepository().apply { entries = listOf(entry("e1", "2026-10-05")) }
        val vm = ParentDiaryViewModel(parent, FakeStudentsRepository("s1"), diary, clock)
        assertEquals("st1", vm.uiState.value.childId)
        parent.sessionState.value = parent.sessionState.value?.copy(activeChildId = "st2")
        assertEquals("st2", vm.uiState.value.childId)
        assertEquals(2, diary.entryQueries.size)
    }

    @Test
    fun child_without_section_shows_no_section_state() {
        val vm = ParentDiaryViewModel(parent, FakeStudentsRepository(null), FakeDiaryRepository(), clock)
        assertTrue(vm.uiState.value.noSection)
    }
}
