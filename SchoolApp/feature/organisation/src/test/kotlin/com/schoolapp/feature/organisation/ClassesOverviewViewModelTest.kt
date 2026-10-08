package com.schoolapp.feature.organisation

import androidx.lifecycle.SavedStateHandle
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.testing.FakeAuthRepository
import com.schoolapp.core.testing.MainDispatcherRule
import com.schoolapp.core.testing.TestSessions
import com.schoolapp.feature.organisation.classes.ClassesTab
import com.schoolapp.feature.organisation.classes.ClassesViewModel
import com.schoolapp.feature.organisation.scope.BranchOptionsLoader
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Rule
import org.junit.Test

class ClassesOverviewViewModelTest {

    @get:Rule
    val mainDispatcherRule = MainDispatcherRule()

    private val repository = FakeOrganisationRepository()
    private val overview = FakeClassesOverviewRepository(repository)
    private val loader = BranchOptionsLoader(FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view")), repository)

    @Test
    fun loads_one_card_per_class_for_the_active_session() {
        val vm = ClassesViewModel(loader, repository, overview, FakeClassStructureRepository(), FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view")), com.schoolapp.core.data.academics.AcademicsEvents(), SavedStateHandle())
        val state = vm.uiState.value
        assertEquals(ClassesTab.CLASSES, state.tab)
        assertEquals(listOf(Triple("b1", "s1", "se1")), overview.requests)
        assertEquals(listOf("Class 5"), state.classes.map { it.name })
        assertEquals(listOf("A"), state.classes.single().sections.map { it.name })
        assertEquals("2026-27", state.sessionName)
        assertFalse(state.isLoading)
    }

    @Test
    fun saved_tab_from_older_version_falls_back_to_classes() {
        val vm = ClassesViewModel(loader, repository, overview, FakeClassStructureRepository(), FakeAuthRepository(TestSessions.session(RoleKey.PRINCIPAL, "branches.view")), com.schoolapp.core.data.academics.AcademicsEvents(), SavedStateHandle(mapOf("tab" to "SECTIONS")))
        assertEquals(ClassesTab.CLASSES, vm.uiState.value.tab)
        vm.onTabSelected(ClassesTab.SUBJECTS)
        assertEquals(ClassesTab.SUBJECTS, vm.uiState.value.tab)
    }
}
