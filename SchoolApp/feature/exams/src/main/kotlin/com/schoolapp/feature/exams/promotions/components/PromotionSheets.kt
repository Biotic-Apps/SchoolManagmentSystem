package com.schoolapp.feature.exams.promotions.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.FilterChip
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppBottomSheet
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextArea
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.exams.promotions.PromotionDecision
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.exams.R
import com.schoolapp.feature.exams.components.OptionPickerField
import com.schoolapp.feature.exams.components.examLabel
import com.schoolapp.feature.exams.promotions.PromotionActions
import com.schoolapp.feature.exams.promotions.PromotionsState

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun SuggestSheet(state: PromotionsState, actions: PromotionActions) {
    val form = state.suggest ?: return
    AppBottomSheet(title = stringResource(R.string.exams_promo_suggest_title), onDismiss = actions::dismissSuggest) {
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.exams_promo_to_session),
            options = state.sessions.filter { it.id != state.fromSessionId }.map { SwitcherOption(it.id, it.name) },
            selectedId = state.toSessionId,
            onSelect = actions::onToSession,
            errorText = if (form.toMissing) stringResource(R.string.exams_promo_to_session_required) else null,
        )
        SectionHeader(title = stringResource(R.string.exams_promo_exams))
        when {
            form.examsLoading -> LoadingState(rows = 2)
            form.exams.isEmpty() -> InlineMessage(stringResource(R.string.exams_promo_no_published), StatusTone.Info)
            else -> FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                form.exams.forEach { exam ->
                    FilterChip(selected = exam.id in form.examIds, onClick = { actions.toggleExam(exam.id) }, label = { Text(examLabel(exam)) })
                }
            }
        }
        if (form.examsMissing) Text(stringResource(R.string.exams_promo_exams_required), style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
        if (form.running) InlineMessage(stringResource(R.string.exams_promo_suggesting), StatusTone.Info)
        PrimaryButton(stringResource(R.string.exams_promo_suggest), actions::submitSuggest, Modifier.fillMaxWidth(), loading = form.running)
    }
}

@Composable
internal fun OverrideSheet(state: PromotionsState, actions: PromotionActions) {
    val form = state.override ?: return
    AppBottomSheet(title = stringResource(R.string.exams_promo_override_title), onDismiss = actions::dismissOverride) {
        Text(form.row.student.name, style = MaterialTheme.typography.titleMedium, color = AppColors.TextPrimary)
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.exams_promo_decision),
            options = PromotionDecision.entries.map { SwitcherOption(it.name, decisionLabel(it)) },
            selectedId = form.decision.name,
            onSelect = { actions.onDecision(PromotionDecision.valueOf(it)) },
        )
        if (form.decision != PromotionDecision.GRADUATE) {
            if (state.toSessionId == null) {
                InlineMessage(stringResource(R.string.exams_promo_section_hint), StatusTone.Warning)
            } else {
                OptionPickerField(
                    label = stringResource(R.string.exams_promo_section),
                    options = form.sections.mapNotNull { s -> s.id?.let { SwitcherOption(it, s.name) } },
                    selectedId = form.sectionId,
                    onSelect = actions::onSection,
                )
            }
        }
        AppTextArea(
            value = form.reason,
            onValueChange = actions::onReason,
            label = stringResource(R.string.exams_promo_reason),
            errorText = if (form.reasonMissing) stringResource(R.string.exams_promo_reason_required) else null,
        )
        PrimaryButton(stringResource(R.string.exams_promo_save), actions::submitOverride, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

@Composable
internal fun ConfirmSheet(state: PromotionsState, actions: PromotionActions) {
    val form = state.confirm ?: return
    AppBottomSheet(title = stringResource(R.string.exams_promo_confirm), onDismiss = actions::dismissConfirm) {
        Text(stringResource(R.string.exams_promo_confirm_message), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        OptionPickerField(
            label = stringResource(R.string.exams_promo_class),
            options = listOf(SwitcherOption(ALL, stringResource(R.string.exams_promo_all_classes))) +
                state.classes.mapNotNull { c -> c.id?.let { SwitcherOption(it, c.name) } },
            selectedId = form.classId ?: ALL,
            onSelect = { actions.onConfirmClass(it.takeIf { id -> id != ALL }) },
        )
        PrimaryButton(stringResource(R.string.exams_promo_send), actions::submitConfirm, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
}

@Composable
internal fun ApplySheet(state: PromotionsState, actions: PromotionActions) {
    val form = state.apply ?: return
    var picking by rememberSaveable { mutableStateOf(false) }
    AppBottomSheet(title = stringResource(R.string.exams_promo_apply_title), onDismiss = actions::dismissApply) {
        Text(
            stringResource(R.string.exams_promo_apply_message, state.confirmedCount),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        form.error?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        PickerField(formatDate(form.effectiveDate) ?: form.effectiveDate, stringResource(R.string.exams_promo_effective), { picking = true })
        PrimaryButton(stringResource(R.string.exams_promo_apply), actions::submitApply, Modifier.fillMaxWidth(), loading = form.isSaving)
    }
    if (picking) {
        AppDatePickerDialog(initialDate = form.effectiveDate, onConfirm = { actions.onApplyDate(it); picking = false }, onDismiss = { picking = false })
    }
}

private const val ALL = "all"
