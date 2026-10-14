package com.schoolapp.feature.fees.staff.structure

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.Archive
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.TaskAlt
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.MoneyRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.money.MoneyFormat
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.fees.structure.FeeHead
import com.schoolapp.core.model.fees.structure.FeePlan
import com.schoolapp.core.model.fees.structure.FeePlanStatus
import com.schoolapp.core.model.fees.structure.SiblingDiscount
import com.schoolapp.feature.fees.R

@Composable
internal fun FeeHeadsCard(heads: List<FeeHead>, canAdd: Boolean, onAdd: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(stringResource(R.string.fees_st_heads), subtitle = stringResource(R.string.fees_st_heads_help))
        if (heads.isEmpty()) Muted(stringResource(R.string.fees_st_heads_empty))
        heads.forEach { head ->
            KeyValueRow(
                label = "${head.name} (${head.code})",
                value = listOfNotNull(
                    headKindLabel(head.kind),
                    stringResource(R.string.fees_st_refundable).takeIf { head.refundable },
                    stringResource(R.string.fees_st_system).takeIf { head.system },
                ).joinToString(" · "),
            )
        }
        if (canAdd) AppTextButton(stringResource(R.string.fees_st_add_head), onAdd, leadingIcon = Icons.Outlined.Add)
    }
}

/** What a plan's actions may do for the signed-in role. */
internal data class PlanRights(val canEdit: Boolean, val canApprove: Boolean)

@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun FeePlanCard(
    plan: FeePlan,
    rights: PlanRights,
    busy: Boolean,
    onEdit: () -> Unit,
    onApprove: () -> Unit,
    onArchive: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 6.dp) {
        SectionHeader(
            title = plan.className,
            subtitle = plan.name,
            action = { StatusChip(planStatusLabel(plan.status), planStatusTone(plan.status)) },
        )
        plan.items.forEach { item ->
            MoneyRow(item.feeHeadName, item.amountMinor, supporting = frequencyLabel(item.frequency))
        }
        if (plan.monthlyMinor > 0) {
            Text(stringResource(R.string.fees_st_monthly, MoneyFormat.format(plan.monthlyMinor)), style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
        }
        plan.lateFee?.let { Muted(stringResource(R.string.fees_st_late_fee_value, MoneyFormat.format(it.amountMinor), it.afterDays)) }
        val active = plan.status != FeePlanStatus.ARCHIVED
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            if (rights.canEdit && active) AppTextButton(stringResource(R.string.fees_st_edit), onEdit, enabled = !busy, leadingIcon = Icons.Outlined.Edit)
            if (rights.canApprove && plan.status == FeePlanStatus.DRAFT) {
                AppTextButton(stringResource(R.string.fees_st_approve), onApprove, enabled = !busy, leadingIcon = Icons.Outlined.TaskAlt)
            }
            if ((rights.canEdit || rights.canApprove) && active) {
                AppTextButton(
                    stringResource(R.string.fees_st_archive), onArchive,
                    enabled = !busy, leadingIcon = Icons.Outlined.Archive, contentColor = AppColors.Error,
                )
            }
        }
    }
}

@Composable
internal fun SiblingDiscountsCard(
    discounts: List<SiblingDiscount>,
    canAdd: Boolean,
    canEdit: Boolean,
    onAdd: () -> Unit,
    onEdit: (SiblingDiscount) -> Unit,
    onDelete: (SiblingDiscount) -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        SectionHeader(stringResource(R.string.fees_st_siblings), subtitle = stringResource(R.string.fees_st_siblings_help))
        if (discounts.isEmpty()) Muted(stringResource(R.string.fees_st_siblings_empty))
        discounts.forEach { rule ->
            SectionHeader(
                title = stringResource(R.string.fees_st_sibling_rule, rule.childIndex, rule.percentOff),
                action = if (canEdit) {
                    {
                        FlowRow {
                            AppTextButton(stringResource(R.string.fees_st_edit), { onEdit(rule) }, leadingIcon = Icons.Outlined.Edit)
                            AppTextButton(stringResource(R.string.fees_st_delete), { onDelete(rule) }, leadingIcon = Icons.Outlined.Delete, contentColor = AppColors.Error)
                        }
                    }
                } else {
                    { StatusChip("${rule.percentOff}%", StatusTone.Info) }
                },
            )
        }
        if (canAdd) AppTextButton(stringResource(R.string.fees_st_add_sibling), onAdd, leadingIcon = Icons.Outlined.Add)
    }
}

@Composable
internal fun Muted(text: String) = Text(text, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
