package com.schoolapp.feature.exams

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.feature.exams.classresults.ClassResultsRoute
import com.schoolapp.feature.exams.grading.GradingSchemesRoute
import com.schoolapp.feature.exams.manage.ExamsListRoute
import com.schoolapp.feature.exams.promotions.PromotionsRoute
import com.schoolapp.feature.exams.templates.ReportCardTemplatesRoute

private enum class StaffTab { EXAMS, MAIN, RESULTS, GRADING, TEMPLATES, PROMOTIONS }

/**
 * Staff exams menu: the role's main tab ([mainTitle], mark sheets or completeness), plus by permission the exams list
 * (create, schedule, workflow, print), class results, grading schemes and report card templates. A single tab shows
 * without a tab row.
 */
@Composable
internal fun StaffExamsTabs(
    key: String,
    mainTitle: String,
    onOpen: (Any) -> Unit,
    modifier: Modifier = Modifier,
    showExamsList: Boolean = true,
    viewModel: ExamsTabsViewModel = hiltViewModel(key = "${key}_tabs"),
    main: @Composable (Modifier) -> Unit,
) {
    val access by viewModel.access.collectAsStateWithLifecycle()
    val tabs = buildList {
        if (showExamsList && access.canManage) add(StaffTab.EXAMS)
        add(StaffTab.MAIN)
        if (access.canView) add(StaffTab.RESULTS)
        if (access.canManage && access.canView) {
            add(StaffTab.GRADING)
            add(StaffTab.TEMPLATES)
        }
        if (showExamsList && access.canPromote && access.canView) add(StaffTab.PROMOTIONS)
    }
    if (tabs.size == 1) {
        main(modifier)
        return
    }
    var selected by rememberSaveable { mutableIntStateOf(0) }
    val tab = tabs.getOrElse(selected) { StaffTab.MAIN }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = tabs.map { titleRes(it)?.let { id -> stringResource(id) } ?: mainTitle },
            selectedIndex = tabs.indexOf(tab),
            onSelect = { selected = it },
        )
        val content = Modifier.weight(1f)
        when (tab) {
            StaffTab.EXAMS -> ExamsListRoute(
                onOpenExam = { id, name -> onOpen(ExamDetailDestination(id, name)) },
                modifier = content,
                viewModel = hiltViewModel(key = "${key}_exams_list"),
            )
            StaffTab.MAIN -> main(content)
            StaffTab.RESULTS -> ClassResultsRoute(content, hiltViewModel(key = "${key}_class_results"))
            StaffTab.GRADING -> GradingSchemesRoute(content, hiltViewModel(key = "${key}_grading"))
            StaffTab.TEMPLATES -> ReportCardTemplatesRoute(content, hiltViewModel(key = "${key}_templates"))
            StaffTab.PROMOTIONS -> PromotionsRoute(content, hiltViewModel(key = "${key}_promotions"))
        }
    }
}

private fun titleRes(tab: StaffTab): Int? = when (tab) {
    StaffTab.EXAMS -> R.string.exams_tab_exams
    StaffTab.MAIN -> null
    StaffTab.RESULTS -> R.string.exams_tab_class_results
    StaffTab.GRADING -> R.string.exams_tab_grading
    StaffTab.TEMPLATES -> R.string.exams_tab_templates
    StaffTab.PROMOTIONS -> R.string.exams_tab_promotions
}
