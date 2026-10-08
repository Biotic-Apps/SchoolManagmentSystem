package com.schoolapp.feature.exams

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.exams.board.CompletenessRoute
import com.schoolapp.feature.exams.results.ParentResultsRoute
import com.schoolapp.feature.exams.sheets.MySheetsRoute

/**
 * Menu `exams`: teachers enter marks; principal/coordinator review completeness and accept/return sheets.
 * Staff with `exams.view` also get a "Class results" tab.
 */
@Composable
fun ExamsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, onOpenApprovals: (() -> Unit)?, modifier: Modifier = Modifier) {
    val key = "exams_${role.key}"
    when (role) {
        RoleKey.PARENT -> ParentResultsRoute(modifier, hiltViewModel(key = key))
        RoleKey.TEACHER, RoleKey.HELPER ->
            StaffExamsTabs(key, stringResource(R.string.exams_tab_mark_sheets), modifier) { tabModifier ->
                MySheetsRoute(onOpen, tabModifier, hiltViewModel(key = key))
            }
        else -> StaffExamsTabs(key, stringResource(R.string.exams_tab_completeness), modifier) { tabModifier ->
            CompletenessRoute(onOpen, onOpenApprovals, tabModifier, hiltViewModel(key = key))
        }
    }
}

/** Parent menu `progress` ("Progress & Results"): published results of the active child. */
@Composable
@Suppress("UnusedParameter")
fun ParentResultsScreen(onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    ParentResultsRoute(modifier, hiltViewModel(key = "exams_parent_results"))
}
