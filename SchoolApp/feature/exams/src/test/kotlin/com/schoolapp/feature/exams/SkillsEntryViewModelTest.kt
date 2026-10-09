package com.schoolapp.feature.exams

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.exams.skills.SkillsRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.model.exams.SkillGrid
import com.schoolapp.core.model.exams.SkillItem
import com.schoolapp.core.model.exams.SkillLevel
import com.schoolapp.core.model.exams.SkillRating
import com.schoolapp.core.model.exams.SkillStudent
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.exams.skills.SkillsEntryViewModel
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class SkillsEntryViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val items = listOf(SkillItem("i1", SkillDomain.AFFECTIVE, "Punctuality"), SkillItem("i2", SkillDomain.PSYCHOMOTOR, "Sports"))
    private val scale = listOf(SkillLevel(3, "A", "Excellent"), SkillLevel(2, "B", "Good"), SkillLevel(1, "C", "Fair"))
    private fun grid(editable: Boolean = true) = SkillGrid(
        examId = "ex1",
        sectionId = "sec1",
        editable = editable,
        items = items,
        scale = scale,
        students = listOf(SkillStudent("s1", "Ali", 1, mapOf("i1" to 3)), SkillStudent("s2", "Sara", 2, emptyMap())),
        complete = 0,
    )

    private class FakeSkillsRepository(var grid: SkillGrid) : SkillsRepository {
        val saved = mutableListOf<List<SkillRating>>()
        override suspend fun grid(examId: String, sectionId: String): AppResult<SkillGrid> = AppResult.Success(grid)
        override suspend fun save(examId: String, sectionId: String, ratings: List<SkillRating>): AppResult<SkillGrid> {
            saved += ratings
            return AppResult.Success(grid)
        }
    }

    private val teacher = FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "exams.view", "exams.edit"))

    private fun viewModel(repository: SkillsRepository, auth: FakeAuthRepository = teacher) = SkillsEntryViewModel(
        SavedStateHandle(mapOf("examId" to "ex1", "sectionId" to "sec1", "title" to "Final - Class 5-A")),
        repository,
        auth,
    )

    @Test
    fun rating_tracks_only_changed_cells_and_tapping_again_clears() {
        val repository = FakeSkillsRepository(grid())
        val vm = viewModel(repository)
        vm.rate("s2", "i1", 2)
        assertEquals(2, vm.uiState.value.valueOf("s2", "i1"))
        vm.rate("s2", "i2", 1)
        vm.rate("s2", "i2", 1) // tapping the selected level again clears it; back to saved = no change
        assertEquals(1, vm.uiState.value.edits.size)
        vm.rate("s1", "i1", 3) // clearing a saved rating is a change
        assertNull(vm.uiState.value.valueOf("s1", "i1"))
        assertEquals(2, vm.uiState.value.edits.size)

        vm.save()
        assertEquals(setOf(SkillRating("s2", "i1", 2), SkillRating("s1", "i1", null)), repository.saved.single().toSet())
        assertTrue(vm.uiState.value.saved)
        assertTrue(vm.uiState.value.edits.isEmpty())
    }

    @Test
    fun fill_gives_only_empty_items_the_level() {
        val vm = viewModel(FakeSkillsRepository(grid()))
        vm.fillStudent("s1", 1)
        assertEquals(3, vm.uiState.value.valueOf("s1", "i1"))
        assertEquals(1, vm.uiState.value.valueOf("s1", "i2"))
        assertEquals(2, vm.uiState.value.ratedCount("s1"))
    }

    @Test
    fun published_grid_and_read_only_roles_cannot_rate() {
        val locked = viewModel(FakeSkillsRepository(grid(editable = false)))
        locked.rate("s2", "i1", 2)
        assertFalse(locked.uiState.value.editable)
        assertTrue(locked.uiState.value.edits.isEmpty())

        val viewer = viewModel(FakeSkillsRepository(grid()), FakeAuthRepository(TestSessions.session(RoleKey.TEACHER, "exams.view")))
        viewer.rate("s2", "i1", 2)
        assertTrue(viewer.uiState.value.edits.isEmpty())
    }
}
