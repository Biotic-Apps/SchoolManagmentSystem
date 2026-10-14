package com.schoolapp.feature.students.detail.pickup

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.GppBad
import androidx.compose.material.icons.outlined.VerifiedUser
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.PersonAvatar
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

/** One authorised person; [onAction] is null without `pickup.edit`. Verified persons can be revoked and vice versa. */
@Composable
internal fun PickupPersonCard(
    person: PickupPerson,
    onCall: (String) -> Unit,
    onAction: ((PickupAction) -> Unit)?,
    modifier: Modifier = Modifier,
) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PersonAvatar(person.name, person.photoUrl, size = 48.dp)
            Column(Modifier.weight(1f)) {
                Text(person.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val supporting = listOfNotNull(person.relation?.let(::humanizeKey), person.phone).joinToString(" · ")
                if (supporting.isNotEmpty()) Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                person.cnic?.takeIf { it.isNotBlank() }?.let {
                    Text(stringResource(R.string.sd_pickup_cnic, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
            person.phone?.takeIf { it.isNotBlank() }?.let { phone ->
                IconButton(onClick = { onCall(phone) }) {
                    Icon(Icons.Outlined.Call, stringResource(R.string.sd_call, person.name), tint = AppColors.Primary)
                }
            }
        }
        StatusChip(stringResource(person.status.label()), person.status.tone())
        if (onAction != null) {
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (person.status != PickupPersonStatus.VERIFIED) {
                    AppTextButton(stringResource(R.string.sd_pickup_verify), { onAction(PickupAction.VERIFY) }, leadingIcon = Icons.Outlined.VerifiedUser)
                }
                if (person.status != PickupPersonStatus.REVOKED) {
                    AppTextButton(
                        stringResource(R.string.sd_pickup_revoke),
                        { onAction(PickupAction.REVOKE) },
                        leadingIcon = Icons.Outlined.GppBad,
                        contentColor = AppColors.Error,
                    )
                }
            }
        }
    }
}

private fun PickupPersonStatus.label(): Int = when (this) {
    PickupPersonStatus.PENDING_VERIFICATION -> R.string.sd_pickup_status_pending
    PickupPersonStatus.VERIFIED -> R.string.sd_pickup_status_verified
    PickupPersonStatus.REVOKED -> R.string.sd_pickup_status_revoked
}

private fun PickupPersonStatus.tone(): StatusTone = when (this) {
    PickupPersonStatus.PENDING_VERIFICATION -> StatusTone.Warning
    PickupPersonStatus.VERIFIED -> StatusTone.Success
    PickupPersonStatus.REVOKED -> StatusTone.Error
}
