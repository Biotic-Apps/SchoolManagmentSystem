package com.schoolapp.feature.health.card

import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EditNote
import androidx.compose.material.icons.outlined.FamilyRestroom
import androidx.compose.material.icons.outlined.HealthAndSafety
import androidx.compose.material.icons.outlined.MedicalServices
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.components.BodyText
import com.schoolapp.feature.health.components.IncidentCard
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
internal fun HealthCardRoute(
    onBack: () -> Unit,
    onReport: (String) -> Unit,
    modifier: Modifier = Modifier,
    viewModel: HealthCardViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    SecureWindowEffect()
    AppScaffold(
        modifier = modifier,
        topBar = {
            AppTopBar(
                title = stringResource(R.string.health_card_title),
                subtitle = state.studentName,
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        HealthCardContent(
            state = state,
            onRetry = viewModel::retry,
            onReport = onReport,
            onRequestChange = viewModel::openChangeRequest,
            modifier = Modifier.padding(padding),
        )
    }
    state.editor?.let { editor ->
        ChangeRequestSheet(
            editor = editor,
            onInstructionsChange = viewModel::onInstructionsChange,
            onAllergyChange = viewModel::onAllergyChange,
            onAddAllergy = viewModel::addAllergy,
            onRemoveAllergy = viewModel::removeAllergy,
            onContactChange = viewModel::onContactChange,
            onAddContact = viewModel::addContact,
            onRemoveContact = viewModel::removeContact,
            onSubmit = viewModel::submitChangeRequest,
            onDismiss = viewModel::dismissChangeRequest,
        )
    }
}

@Composable
internal fun HealthCardContent(
    state: HealthCardUiState,
    onRetry: () -> Unit,
    onReport: (String) -> Unit,
    onRequestChange: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val actions = rememberExternalActions()
    val profile = state.profile
    when {
        state.isLoading -> LoadingState(modifier)
        state.noChild -> EmptyState(
            title = stringResource(R.string.health_no_child),
            message = stringResource(R.string.health_no_child_message),
            modifier = modifier,
            icon = Icons.Outlined.FamilyRestroom,
        )
        state.error != null -> ErrorState(appErrorMessage(state.error), modifier, onRetry = onRetry)
        else -> ScreenColumn(modifier) {
            if (state.requestSent) {
                item(key = "sent") { InlineMessage(stringResource(R.string.health_request_sent), StatusTone.Success) }
            }
            if (state.canReport && state.studentId != null) {
                item(key = "report") {
                    PrimaryButton(
                        text = stringResource(R.string.health_report_incident),
                        onClick = { onReport(state.studentId) },
                        leadingIcon = Icons.Outlined.MedicalServices,
                    )
                }
            }
            if (profile != null) {
                healthProfileItems(profile, actions)
            } else if (state.notFound) {
                item(key = "not_found") {
                    EmptyState(
                        title = stringResource(R.string.health_not_found),
                        message = stringResource(R.string.health_not_found_message),
                        icon = Icons.Outlined.HealthAndSafety,
                    )
                }
            }
            if (state.isParent) {
                item(key = "request_change") {
                    SecondaryButton(stringResource(R.string.health_request_change), onRequestChange, leadingIcon = Icons.Outlined.EditNote)
                }
                item(key = "incidents_header") { SectionHeader(stringResource(R.string.health_child_incidents)) }
                if (state.incidents.isEmpty()) {
                    item(key = "incidents_empty") { BodyText(stringResource(R.string.health_child_incidents_empty), color = AppColors.TextSecondary) }
                }
                items(state.incidents.size, key = { "incident_" + state.incidents[it].id }) { index ->
                    IncidentCard(state.incidents[index], showStudent = false)
                }
            }
        }
    }
}
