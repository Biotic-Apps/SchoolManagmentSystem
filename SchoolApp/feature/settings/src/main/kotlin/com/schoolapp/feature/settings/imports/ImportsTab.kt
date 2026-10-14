package com.schoolapp.feature.settings.imports

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.lazy.rememberLazyListState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.settings.R
import kotlinx.coroutines.launch

/** Settings › Data import: choose → template → upload, the open import's result, and the branch's history. */
@Composable
internal fun ImportsTab(schoolId: String, modifier: Modifier = Modifier) {
    val flowVm: ImportFlowViewModel = hiltViewModel(key = "imports_$schoolId")
    val historyVm: ImportHistoryViewModel = hiltViewModel(key = "imports_history_$schoolId")
    LaunchedEffect(schoolId) { flowVm.bind(schoolId) }
    val flow by flowVm.uiState.collectAsStateWithLifecycle()
    val history by historyVm.uiState.collectAsStateWithLifecycle()
    LaunchedEffect(flow.branchId, flow.historyVersion) { flow.branchId?.let(historyVm::load) }
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri ->
        uri?.let { flowVm.upload(it.toString()) }
    }
    val pickFile = { picker.launch(UPLOAD_TYPES) }
    val listState = rememberLazyListState()
    val scope = rememberCoroutineScope()
    val openImport: (String) -> Unit = { id ->
        flowVm.open(id)
        scope.launch { listState.animateScrollToItem(RESULT_INDEX) }
    }

    RefreshBox(isRefreshing = false, onRefresh = { historyVm.retry(); flowVm.retryDetail() }, modifier = modifier) {
        ScreenColumn(state = listState) {
            item(key = "steps") {
                AppCard(verticalSpacing = 16.dp, animateSize = false) {
                    StepTitle(1, R.string.settings_imports_step1)
                    ImportContextStep(flow, flowVm)
                    StepTitle(2, R.string.settings_imports_step2)
                    TemplateStep(flow, flowVm::saveTemplate)
                    StepTitle(3, R.string.settings_imports_step3)
                    UploadStep(flow, pickFile)
                }
            }
            val detail = flow.detail
            if (flow.importId != null) {
                when {
                    flow.detailLoading && detail == null -> item(key = "result_loading") { LoadingState(rows = 2) }
                    detail == null -> item(key = "result_error") {
                        ErrorState(flow.detailError?.let { loadErrorMessage(it) }.orEmpty(), onRetry = { flowVm.retryDetail() })
                    }
                    else -> {
                        item(key = "result") { ImportStatusCard(flow, detail, flowVm, pickFile) }
                        if (detail.status == ImportDetail.COMMITTED) item(key = "reconciliation") { ReconciliationCard(detail) }
                        if (detail.status != ImportDetail.VALIDATING) problemsAndPreviewItems(detail.errors, detail.preview)
                    }
                }
            }
            if (flow.branchId != null) importHistoryItems(history, openImport, historyVm)
        }
    }
    RevertDialog(history, historyVm)
}

@Composable
private fun StepTitle(number: Int, title: Int) {
    Text(
        text = stringResource(R.string.settings_imports_step_title, number, stringResource(title)),
        style = MaterialTheme.typography.titleMedium,
        color = AppColors.TextPrimary,
    )
}

private const val RESULT_INDEX = 1
