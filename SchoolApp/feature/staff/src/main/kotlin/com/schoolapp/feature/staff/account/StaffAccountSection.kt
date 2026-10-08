package com.schoolapp.feature.staff.account

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Key
import androidx.compose.material.icons.outlined.PersonAddAlt
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.ui.appErrorMessage
import com.schoolapp.feature.staff.R

/** Sign-in card on the staff profile; null when the role can do nothing here. */
@Composable
internal fun StaffAccountCard(
    detail: StaffDetail,
    state: StaffAccountUiState,
    isSelf: Boolean,
    onCreate: () -> Unit,
    onReset: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val hasLogin = detail.summary.userId != null
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(title = stringResource(R.string.staff_account_section))
        Text(
            stringResource(if (hasLogin) R.string.staff_account_has_login else R.string.staff_account_none),
            style = MaterialTheme.typography.bodyMedium,
            color = AppColors.TextSecondary,
        )
        state.resetError?.let { InlineMessage(appErrorMessage(it), StatusTone.Error) }
        when {
            !hasLogin && state.canCreate ->
                SecondaryButton(stringResource(R.string.staff_account_create), onCreate, leadingIcon = Icons.Outlined.PersonAddAlt)
            hasLogin && state.canReset && !isSelf ->
                SecondaryButton(stringResource(R.string.staff_account_reset), onReset, leadingIcon = Icons.Outlined.Key, loading = state.isResetting)
        }
    }
}

/** Whether [StaffAccountCard] has anything to show for this role and record. */
internal fun StaffAccountUiState.showsCardFor(detail: StaffDetail): Boolean = canCreate || canReset || detail.summary.userId != null
