package com.schoolapp.feature.fees.record

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.fees.R

@Composable
internal fun RecordPaymentRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: RecordPaymentViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.fees_record_payment), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        RecordPaymentScreen(
            state = state,
            actions = RecordPaymentActions(
                onSearchChange = viewModel::onSearchChange,
                onStudentSelected = viewModel::onStudentSelected,
                onClearStudent = viewModel::onClearStudent,
                onAmountChange = viewModel::onAmountChange,
                onMethodChange = viewModel::onMethodChange,
                onReferenceChange = viewModel::onReferenceChange,
                onReceivedOnChange = viewModel::onReceivedOnChange,
                onSubmit = viewModel::submit,
                onRecordAnother = viewModel::recordAnother,
                onDone = onBack,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}
