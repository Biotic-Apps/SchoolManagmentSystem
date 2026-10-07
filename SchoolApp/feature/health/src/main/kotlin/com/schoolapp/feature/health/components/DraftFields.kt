package com.schoolapp.feature.health.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.health.R
import com.schoolapp.feature.health.card.AllergyDraft
import com.schoolapp.feature.health.card.ContactDraft

@Composable
internal fun AllergyDraftFields(
    draft: AllergyDraft,
    showErrors: Boolean,
    enabled: Boolean,
    onChange: (AllergyDraft) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            AppTextField(
                value = draft.name,
                onValueChange = { onChange(draft.copy(name = it)) },
                label = stringResource(R.string.health_allergy_name),
                enabled = enabled,
                errorText = stringResource(R.string.health_required).takeIf { showErrors && draft.name.isBlank() },
            )
            FilterChipRow(
                options = AllergySeverities.map { SwitcherOption(it, allergySeverityLabel(it)) },
                selectedId = draft.severity.uppercase().takeIf { it in AllergySeverities },
                onSelect = { onChange(draft.copy(severity = if (draft.severity.equals(it, ignoreCase = true)) "" else it)) },
            )
            AppTextField(
                value = draft.reaction,
                onValueChange = { onChange(draft.copy(reaction = it)) },
                label = stringResource(R.string.health_allergy_reaction_label),
                enabled = enabled,
            )
            RemoveButton(enabled, onRemove)
        }
    }
}

@Composable
internal fun ContactDraftFields(
    number: Int,
    draft: ContactDraft,
    showErrors: Boolean,
    enabled: Boolean,
    onChange: (ContactDraft) -> Unit,
    onRemove: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val required = stringResource(R.string.health_required)
    AppCard(modifier, contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Text(
                stringResource(R.string.health_contact_number, number),
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = AppColors.TextSecondary,
            )
            AppTextField(
                value = draft.name,
                onValueChange = { onChange(draft.copy(name = it)) },
                label = stringResource(R.string.health_contact_name),
                kind = FieldKind.Name,
                enabled = enabled,
                errorText = required.takeIf { showErrors && draft.name.isBlank() },
            )
            AppTextField(
                value = draft.relation,
                onValueChange = { onChange(draft.copy(relation = it)) },
                label = stringResource(R.string.health_contact_relation),
                kind = FieldKind.Title,
                enabled = enabled,
            )
            AppTextField(
                value = draft.phone,
                onValueChange = { onChange(draft.copy(phone = it)) },
                label = stringResource(R.string.health_contact_phone),
                enabled = enabled,
                kind = FieldKind.Phone,
                errorText = required.takeIf { showErrors && draft.phone.isBlank() },
            )
            RemoveButton(enabled, onRemove)
        }
    }
}

@Composable
private fun RemoveButton(enabled: Boolean, onRemove: () -> Unit) {
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
        AppTextButton(
            text = stringResource(R.string.health_remove),
            onClick = onRemove,
            enabled = enabled,
            leadingIcon = Icons.Outlined.Delete,
            contentColor = AppColors.Error,
        )
    }
}
