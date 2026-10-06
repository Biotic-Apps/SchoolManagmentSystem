package com.schoolapp.feature.students

import com.schoolapp.core.model.ChildSummary
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.students.child.ChildProfileViewModel
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Rule
import org.junit.Test

class ChildProfileViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val children = listOf(ChildSummary("c1", "Ayesha"), ChildSummary("c2", "Omar"))
    private val repository = FakeStudentsRepository()

    @Test
    fun profile_is_scoped_to_the_selected_child_and_follows_the_switcher() = runTest {
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PARENT).copy(children = children, activeChildId = "c1"))
        val vm = ChildProfileViewModel(auth, repository)
        assertEquals("c1", vm.uiState.value.detail?.summary?.id)

        auth.selectChild("c2")
        assertEquals("c2", vm.uiState.value.detail?.summary?.id)
        assertEquals(listOf("c1", "c2"), repository.requested)

        auth.selectChild("c2")
        assertEquals(listOf("c1", "c2"), repository.requested)
    }

    @Test
    fun parent_without_linked_children_sees_the_link_prompt() {
        val auth = FakeAuthRepository(TestSessions.session(RoleKey.PARENT))
        val vm = ChildProfileViewModel(auth, repository)
        assertTrue(vm.uiState.value.hasNoChildren)
        assertTrue(repository.requested.isEmpty())
    }
}
