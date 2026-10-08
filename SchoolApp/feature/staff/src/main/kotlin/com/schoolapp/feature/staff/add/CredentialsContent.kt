package com.schoolapp.feature.staff.add

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.feature.staff.R
import com.schoolapp.feature.staff.common.TemporaryPasswordCard
import com.schoolapp.feature.staff.form.FormMaxWidth

/** After `POST /staff`: the one-time temporary password (or a note that an existing login was linked). */
@Composable
internal fun CredentialsContent(
    created: CreatedStaff,
    continueLabel: String,
    onContinue: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val staff = created.staff
    val password = created.temporaryPassword
    ScreenColumn(modifier, maxWidth = FormMaxWidth) {
        item(key = "done") { InlineMessage(stringResource(R.string.staff_added, staff.summary.name), StatusTone.Success) }
        if (password == null) {
            item(key = "linked") { InlineMessage(stringResource(R.string.staff_account_linked), StatusTone.Info) }
        } else {
            item(key = "password") { TemporaryPasswordCard(staff.summary.name, staff.email ?: staff.phone, password) }
        }
        item(key = "continue") { PrimaryButton(continueLabel, onContinue) }
    }
}
