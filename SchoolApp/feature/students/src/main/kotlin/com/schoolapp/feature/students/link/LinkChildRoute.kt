package com.schoolapp.feature.students.link

import androidx.activity.compose.BackHandler
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
import com.schoolapp.feature.students.R

@Composable
fun LinkChildRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: LinkChildViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val back = if (state.step == LinkStep.CODE) viewModel::backToDetails else onBack
    BackHandler(enabled = state.step == LinkStep.CODE, onBack = viewModel::backToDetails)
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.students_link_title), navigationIcon = { BackButton(back) }) },
    ) { padding ->
        LinkChildContent(
            state = state,
            callbacks = LinkChildCallbacks(
                onAdmissionNoChange = viewModel::onAdmissionNoChange,
                onDobChange = viewModel::onDobChange,
                onRelationChange = viewModel::onRelationChange,
                onCodeChange = viewModel::onCodeChange,
                onSendCode = viewModel::sendCode,
                onVerify = viewModel::verify,
                onDone = onBack,
            ),
            modifier = Modifier.padding(padding),
        )
    }
}
