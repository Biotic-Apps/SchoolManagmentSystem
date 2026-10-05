package com.schoolapp.feature.organisation.classes

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.organisation.BranchOption
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.Subject

@Immutable
data class ClassesUiState(
    val tab: ClassesTab = ClassesTab.SECTIONS,
    val isLoading: Boolean = true,
    val branches: List<BranchOption> = emptyList(),
    val selectedBranchId: String? = null,
    val sessionName: String? = null,
    val sections: List<Section> = emptyList(),
    val classes: List<SchoolClass> = emptyList(),
    val subjects: List<Subject> = emptyList(),
    val error: AppError? = null,
)
