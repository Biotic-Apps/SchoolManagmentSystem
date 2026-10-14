package com.schoolapp.feature.admin.roles.components

import androidx.annotation.StringRes
import androidx.compose.material3.CheckboxColors
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.runtime.Composable
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.roles.MatrixAction

@StringRes
internal fun MatrixAction.labelRes(): Int = when (this) {
    MatrixAction.VIEW -> R.string.roles_action_col_view
    MatrixAction.ADD -> R.string.roles_action_col_add
    MatrixAction.EDIT -> R.string.roles_action_col_edit
    MatrixAction.SUBMIT -> R.string.roles_action_col_submit
    MatrixAction.APPROVE -> R.string.roles_action_col_approve
    MatrixAction.PUBLISH -> R.string.roles_action_col_publish
    MatrixAction.EXPORT -> R.string.roles_action_col_export
    MatrixAction.DELETE -> R.string.roles_action_col_delete
}

@Composable
internal fun roleCheckboxColors(): CheckboxColors =
    CheckboxDefaults.colors(checkedColor = AppColors.Primary, uncheckedColor = AppColors.TextSecondary, checkmarkColor = AppColors.OnPrimary)
