package com.schoolapp.feature.settings.policies

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.BoxWithConstraints
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.width
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.SwitchRow
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.ui.roleLabel
import com.schoolapp.feature.settings.R

/** Password length, inactivity sign-out, digit rule and roles that must use two-step sign-in. */
@Composable
internal fun SecuritySection(form: PolicyForm, canEdit: Boolean, errors: PolicyErrors, onEdit: ((PolicyForm) -> PolicyForm) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        SectionHeader(
            title = stringResource(R.string.settings_policies_security),
            subtitle = stringResource(R.string.settings_policies_security_hint),
        )
        TwoColumns(
            first = { modifier ->
                AppTextField(
                    value = form.passwordMinLength,
                    onValueChange = { value -> onEdit { it.copy(passwordMinLength = value.digits()) } },
                    label = stringResource(R.string.settings_policies_password_min),
                    supportingText = stringResource(R.string.settings_policies_password_min_hint),
                    errorText = errors.text(PolicyForm.PASSWORD_MIN_LENGTH),
                    enabled = canEdit,
                    kind = FieldKind.Number,
                    modifier = modifier,
                )
            },
            second = { modifier ->
                AppTextField(
                    value = form.sessionTimeoutMinutes,
                    onValueChange = { value -> onEdit { it.copy(sessionTimeoutMinutes = value.digits()) } },
                    label = stringResource(R.string.settings_policies_timeout),
                    supportingText = stringResource(R.string.settings_policies_timeout_hint),
                    errorText = errors.text(PolicyForm.SESSION_TIMEOUT),
                    enabled = canEdit,
                    kind = FieldKind.Number,
                    modifier = modifier,
                )
            },
        )
        SwitchRow(
            title = stringResource(R.string.settings_policies_require_digit),
            checked = form.requireDigit,
            onCheckedChange = { on -> onEdit { it.copy(requireDigit = on) } },
            enabled = canEdit,
        )
        TwoFactorRoles(form, canEdit, onEdit)
    }
}

@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun TwoFactorRoles(form: PolicyForm, canEdit: Boolean, onEdit: ((PolicyForm) -> PolicyForm) -> Unit) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(stringResource(R.string.settings_policies_two_factor), style = MaterialTheme.typography.labelLarge, color = AppColors.TextPrimary)
        Text(stringResource(R.string.settings_policies_two_factor_hint), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        FlowRow(Modifier.fillMaxWidth()) {
            RoleKey.entries.forEach { role ->
                val checked = role.key in form.twoFactorRequiredFor
                Row(Modifier.width(ROLE_WIDTH), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = checked,
                        onCheckedChange = { on ->
                            onEdit { it.copy(twoFactorRequiredFor = if (on) it.twoFactorRequiredFor + role.key else it.twoFactorRequiredFor - role.key) }
                        },
                        enabled = canEdit,
                        colors = CheckboxDefaults.colors(checkedColor = AppColors.Primary),
                    )
                    Text(roleLabel(role), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextPrimary)
                }
            }
        }
    }
}

/** Side by side when there is room, stacked on phones. */
@Composable
internal fun TwoColumns(first: @Composable (Modifier) -> Unit, second: @Composable (Modifier) -> Unit) {
    BoxWithConstraints(Modifier.fillMaxWidth()) {
        if (maxWidth >= WIDE) {
            Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                first(Modifier.weight(1f))
                second(Modifier.weight(1f))
            }
        } else {
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                first(Modifier.fillMaxWidth())
                second(Modifier.fillMaxWidth())
            }
        }
    }
}

internal fun String.digits(): String = filter(Char::isDigit).take(MAX_DIGITS)

private const val MAX_DIGITS = 4
private val ROLE_WIDTH = 170.dp
private val WIDE = 560.dp
