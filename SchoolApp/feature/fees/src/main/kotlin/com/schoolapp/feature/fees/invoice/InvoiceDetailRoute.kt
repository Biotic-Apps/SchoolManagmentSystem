package com.schoolapp.feature.fees.invoice

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.fees.R

@Composable
internal fun InvoiceDetailRoute(
    onBack: () -> Unit,
    onUploadProof: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: InvoiceDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    LaunchedEffect(state.urlToOpen) {
        state.urlToOpen?.let {
            viewModel.onUrlOpened()
            external.open(it)
        }
    }
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(viewModel) {
        if (resumedOnce) viewModel.load()
        resumedOnce = true
        onPauseOrDispose { }
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.fees_invoice_title),
                subtitle = state.invoice?.invoiceNo,
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        InvoiceDetailScreen(
            state = state,
            onRetry = viewModel::load,
            onReceipt = viewModel::openReceipt,
            onUploadProof = { state.invoice?.let { onUploadProof(it.id) } },
            onPayOnline = viewModel::payOnline,
            onDownloadChallan = viewModel::downloadChallan,
            modifier = Modifier.padding(padding),
        )
    }
}
