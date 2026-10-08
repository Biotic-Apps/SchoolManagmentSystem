package com.schoolapp.feature.students.profile

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.Message
import androidx.compose.material.icons.outlined.Call
import androidx.compose.material.icons.outlined.Edit
import androidx.compose.material.icons.outlined.PersonAdd
import com.schoolapp.core.designsystem.component.AppTextButton
import androidx.compose.material3.HorizontalDivider
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
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.GuardianLink
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

@Composable
internal fun GuardiansCard(
    guardians: List<GuardianLink>,
    onCall: (String) -> Unit,
    onSms: (String) -> Unit,
    modifier: Modifier = Modifier,
    onEdit: ((guardianId: String) -> Unit)? = null,
    onAdd: (() -> Unit)? = null,
) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.students_guardians),
            action = onAdd?.let { add -> { AppTextButton(stringResource(R.string.students_add_guardian), onClick = add, leadingIcon = Icons.Outlined.PersonAdd) } },
        )
        if (guardians.isEmpty()) {
            Text(stringResource(R.string.students_guardians_empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
        guardians.forEachIndexed { index, link ->
            if (index > 0) HorizontalDivider(color = AppColors.Border)
            GuardianRow(link, onCall, onSms, onEdit)
        }
    }
}

@Composable
private fun GuardianRow(link: GuardianLink, onCall: (String) -> Unit, onSms: (String) -> Unit, onEdit: ((String) -> Unit)?) {
    val guardian = link.guardian
    Row(Modifier.fillMaxWidth().padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(
                    guardian.name,
                    style = MaterialTheme.typography.bodyLarge,
                    color = AppColors.TextPrimary,
                    modifier = Modifier.weight(1f, fill = false),
                )
                if (link.isPrimary) {
                    Spacer(Modifier.width(8.dp))
                    StatusChip(stringResource(R.string.students_primary), StatusTone.Info)
                }
            }
            val supporting = listOfNotNull(link.relation?.let(::humanizeKey), guardian.phone, guardian.email)
            Text(supporting.joinToString(" · "), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        }
        onEdit?.let { edit ->
            IconButton(onClick = { edit(guardian.id) }) {
                Icon(Icons.Outlined.Edit, contentDescription = stringResource(R.string.students_edit_guardian_of, guardian.name), tint = AppColors.TextSecondary)
            }
        }
        guardian.phone?.takeIf { it.isNotBlank() }?.let { phone ->
            IconButton(onClick = { onSms(phone) }) {
                Icon(
                    Icons.AutoMirrored.Outlined.Message,
                    contentDescription = stringResource(R.string.students_sms, guardian.name),
                    tint = AppColors.Primary,
                )
            }
            IconButton(onClick = { onCall(phone) }) {
                Icon(Icons.Outlined.Call, contentDescription = stringResource(R.string.students_call, guardian.name), tint = AppColors.Primary)
            }
        }
    }
}
