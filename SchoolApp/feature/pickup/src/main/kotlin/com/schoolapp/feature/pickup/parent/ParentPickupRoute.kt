package com.schoolapp.feature.pickup.parent

import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
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
import com.schoolapp.feature.pickup.R

@Composable
internal fun ParentPickupRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: ParentPickupViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val photoPicker = rememberLauncherForActivityResult(ActivityResultContracts.GetContent()) { uri ->
        uri?.let { viewModel.onPhotoPicked(it.toString()) }
    }
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.pickup_parent_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        ParentPickupContent(
            state = state,
            onRetry = viewModel::retry,
            onAddPerson = viewModel::openAddPerson,
            onRequestEarlyLeave = viewModel::openEarlyLeave,
            modifier = Modifier.padding(padding),
        )
    }
    state.personEditor?.let { editor ->
        AddPersonSheet(
            editor = editor,
            onChange = viewModel::onPersonChange,
            onPickPhoto = { photoPicker.launch(IMAGE_MIME) },
            onSubmit = viewModel::submitPerson,
            onDismiss = viewModel::dismissAddPerson,
        )
    }
    state.leaveEditor?.let { editor ->
        EarlyLeaveSheet(
            editor = editor,
            verifiedPersons = state.verifiedPersons,
            onChange = viewModel::onLeaveChange,
            onSubmit = viewModel::submitEarlyLeave,
            onDismiss = viewModel::dismissEarlyLeave,
        )
    }
}

private const val IMAGE_MIME = "image/*"
