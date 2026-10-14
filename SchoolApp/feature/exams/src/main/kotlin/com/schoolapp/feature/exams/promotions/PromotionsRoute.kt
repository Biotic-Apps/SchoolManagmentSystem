package com.schoolapp.feature.exams.promotions

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material.icons.outlined.EventAvailable
import androidx.compose.material.icons.outlined.Send
import androidx.compose.material.icons.outlined.TrendingUp
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.EmptyState
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.RefreshBox
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.promotions.components.ApplySheet
import com.schoolapp.feature.exams.promotions.components.ConfirmSheet
import com.schoolapp.feature.exams.promotions.components.OverrideSheet
import com.schoolapp.feature.exams.promotions.components.PromotionRowCard
import com.schoolapp.feature.exams.promotions.components.SuggestSheet
import com.schoolapp.feature.exams.promotions.components.decisionLabel

/** Promotions tab (`exams.approve`): session and filters, decisions, and suggest / confirm / apply actions. */
@Composable
internal fun PromotionsRoute(modifier: Modifier = Modifier, viewModel: PromotionsViewModel = hiltViewModel()) {
    val state by viewModel.state.collectAsStateWithLifecycle()
    val actions = viewModel.actions
    RefreshBox(state.isRefreshing, viewModel::refresh, modifier) {
        ScreenColumn {
            if (state.sessions.size > 1) {
                item(key = "sessions") { FilterChipRow(state.sessions.map { SwitcherOption(it.id, it.name) }, state.fromSessionId, viewModel::onFromSession) }
            }
            item(key = "toolbar") { Toolbar(state, actions) }
            state.message?.let { item(key = "message") { MessageLine(it) } }
            when {
                state.isLoading -> item(key = "loading") { LoadingState() }
                state.error != null -> item(key = "error") { ErrorState(state.error?.let { appErrorMessage(it) }.orEmpty(), onRetry = viewModel::retry) }
                state.rows.isEmpty() -> item(key = "empty") {
                    EmptyState(stringResource(R.string.exams_promo_empty), message = stringResource(R.string.exams_promo_empty_message), icon = Icons.Outlined.TrendingUp)
                }
                else -> {
                    item(key = "filters") { Filters(state, viewModel) }
                    items(state.visible, key = { it.id }) { row ->
                        PromotionRowCard(row, onChange = if (state.canSuggest) ({ actions.openOverride(row) }) else null)
                    }
                }
            }
        }
    }
    SuggestSheet(state, actions)
    OverrideSheet(state, actions)
    ConfirmSheet(state, actions)
    ApplySheet(state, actions)
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun Toolbar(state: PromotionsState, actions: PromotionActions) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.rows.isNotEmpty()) {
            Text(
                stringResource(
                    R.string.exams_promo_summary,
                    state.count(PromotionDecision.PROMOTE), state.count(PromotionDecision.CONDITIONAL),
                    state.count(PromotionDecision.REPEAT), state.count(PromotionDecision.GRADUATE),
                ),
                style = MaterialTheme.typography.bodyMedium,
                color = AppColors.TextSecondary,
            )
            Text(
                stringResource(R.string.exams_promo_status_counts, state.suggestedCount, state.confirmedCount),
                style = MaterialTheme.typography.bodySmall,
                color = AppColors.TextSecondary,
            )
        }
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
            if (state.canSuggest) SecondaryButton(stringResource(R.string.exams_promo_suggest), actions::openSuggest, leadingIcon = Icons.Outlined.AutoAwesome)
            if (state.isManager) {
                SecondaryButton(stringResource(R.string.exams_promo_confirm), actions::openConfirm, enabled = state.suggestedCount > 0, leadingIcon = Icons.Outlined.Send)
                PrimaryButton(stringResource(R.string.exams_promo_apply), actions::openApply, enabled = state.confirmedCount > 0, leadingIcon = Icons.Outlined.EventAvailable)
            }
        }
    }
}

@Composable
private fun Filters(state: PromotionsState, viewModel: PromotionsViewModel) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (state.classes.size > 1) {
            FilterChipRow(
                listOf(SwitcherOption(ALL, stringResource(R.string.exams_promo_all_classes))) + state.classes.mapNotNull { c -> c.id?.let { SwitcherOption(it, c.name) } },
                state.classFilter ?: ALL,
                { viewModel.onClassFilter(it.takeIf { id -> id != ALL }) },
            )
        }
        FilterChipRow(
            listOf(SwitcherOption(ALL, stringResource(R.string.exams_promo_all_decisions))) + PromotionDecision.entries.map { SwitcherOption(it.name, decisionLabel(it)) },
            state.decisionFilter?.name ?: ALL,
            { id -> viewModel.onDecisionFilter(PromotionDecision.entries.firstOrNull { it.name == id }) },
        )
    }
}

@Composable
private fun MessageLine(message: PromotionMessage) {
    val text = when (message) {
        PromotionMessage.Suggested -> stringResource(R.string.exams_promo_suggested)
        PromotionMessage.StillRunning -> stringResource(R.string.exams_promo_still_running)
        PromotionMessage.Updated -> stringResource(R.string.exams_promo_updated)
        is PromotionMessage.Confirmed -> stringResource(R.string.exams_promo_confirmed, message.count)
        is PromotionMessage.Applied -> stringResource(R.string.exams_promo_applied, message.applied, message.skipped)
    }
    InlineMessage(text, if (message == PromotionMessage.StillRunning) StatusTone.Info else StatusTone.Success)
}

private const val ALL = "all"
