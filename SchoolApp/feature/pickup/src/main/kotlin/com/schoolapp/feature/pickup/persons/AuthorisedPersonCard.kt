package com.schoolapp.feature.pickup.persons

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.ExperimentalLayoutApi
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.GppBad
import androidx.compose.material.icons.outlined.VerifiedUser
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
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.pickup.PickupPerson
import com.schoolapp.core.model.pickup.PickupPersonStatus
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.pickup.R
import com.schoolapp.feature.pickup.components.personStatusLabel
import com.schoolapp.feature.pickup.components.tone

/** One authorised person with status; [onAction] is null without `pickup.edit`. */
@OptIn(ExperimentalLayoutApi::class)
@Composable
internal fun AuthorisedPersonCard(person: PickupPerson, onAction: ((PersonAction) -> Unit)?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth(), verticalSpacing = 8.dp) {
        Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            PersonAvatar(person.name, person.photoUrl, size = 48.dp)
            Column(Modifier.weight(1f)) {
                Text(person.name, style = MaterialTheme.typography.titleSmall, color = AppColors.TextPrimary)
                val supporting = listOfNotNull(person.relation?.let(::humanizeKey), person.phone).joinToString(" · ")
                if (supporting.isNotEmpty()) Text(supporting, style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                person.cnic?.takeIf { it.isNotBlank() }?.let {
                    Text(stringResource(R.string.pickup_person_cnic_value, it), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                }
            }
        }
        StatusChip(personStatusLabel(person.status), person.status.tone())
        if (onAction != null) {
            FlowRow(Modifier.padding(top = 4.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                if (person.status != PickupPersonStatus.VERIFIED) {
                    AppTextButton(stringResource(R.string.pickup_verify), { onAction(PersonAction.VERIFY) }, leadingIcon = Icons.Outlined.VerifiedUser)
                }
                if (person.status != PickupPersonStatus.REVOKED) {
                    AppTextButton(
                        stringResource(R.string.pickup_revoke),
                        { onAction(PersonAction.REVOKE) },
                        leadingIcon = Icons.Outlined.GppBad,
                        contentColor = AppColors.Error,
                    )
                }
            }
        }
    }
}
