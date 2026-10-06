package com.schoolapp.feature.fees.proof

import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.fees.R

@Composable
internal fun ProofUploadRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ProofUploadViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val resolver = LocalContext.current.contentResolver
    val picker = rememberLauncherForActivityResult(ActivityResultContracts.OpenDocument()) { uri: Uri? ->
        uri?.let { viewModel.onFilePicked(PickedFile(it.toString(), resolver.getType(it), it.lastPathSegment?.substringAfterLast('/'))) }
    }
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.fees_upload_proof),
                subtitle = state.invoice?.invoiceNo,
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        ProofUploadScreen(
            state = state,
            actions = ProofUploadActions(
                onRetry = viewModel::load,
                onPickFile = { picker.launch(arrayOf("image/*", ProofValidator.PDF)) },
                onRemoveFile = viewModel::onRemoveFile,
                onAmountChange = viewModel::onAmountChange,
                onPaidOnChange = viewModel::onPaidOnChange,
                onMethodChange = viewModel::onMethodChange,
                onReferenceChange = viewModel::onReferenceChange,
                onSubmit = viewModel::submit,
                onDone = onBack,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}
