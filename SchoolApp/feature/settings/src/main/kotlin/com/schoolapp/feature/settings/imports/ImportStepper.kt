package com.schoolapp.feature.settings.imports

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Check
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material3.Icon
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.settings.ImportDetail
import com.schoolapp.feature.settings.R

/** Upload → Validate → Review → Commit → Done, with the current step and a failure / revert mark. */
@Composable
internal fun ImportStepper(status: String?, committing: Boolean) {
    val (current, failedLabel) = stepOf(status, committing)
    val labels = listOf(
        R.string.settings_imports_step_upload,
        R.string.settings_imports_step_validate,
        R.string.settings_imports_step_review,
        R.string.settings_imports_step_commit,
        R.string.settings_imports_step_done,
    )
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.SpaceBetween) {
        labels.forEachIndexed { index, label ->
            val failedHere = failedLabel != null && index == current
            val done = index < current || (index == current && index == labels.lastIndex && failedLabel == null)
            val active = index == current
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Box(
                    Modifier.size(DOT).background(
                        when {
                            failedHere -> AppColors.Error
                            done || active -> AppColors.Primary
                            else -> AppColors.Border
                        },
                        CircleShape,
                    ),
                    contentAlignment = Alignment.Center,
                ) {
                    when {
                        failedHere -> Icon(Icons.Outlined.Close, contentDescription = null, tint = AppColors.OnPrimary, modifier = Modifier.size(ICON))
                        done -> Icon(Icons.Outlined.Check, contentDescription = null, tint = AppColors.OnPrimary, modifier = Modifier.size(ICON))
                        else -> Text((index + 1).toString(), style = MaterialTheme.typography.labelSmall, color = AppColors.OnPrimary)
                    }
                }
                Text(
                    text = if (failedHere) stringResource(failedLabel!!) else stringResource(label),
                    style = MaterialTheme.typography.labelSmall,
                    color = if (active) AppColors.TextPrimary else AppColors.TextSecondary,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}

/** Index of the current step plus the label shown on it when the import failed or was reverted. */
private fun stepOf(status: String?, committing: Boolean): Pair<Int, Int?> = when (status) {
    null -> 0 to null
    ImportDetail.FAILED -> (if (committing) COMMIT else VALIDATE) to R.string.settings_imports_step_failed
    ImportDetail.REVERTED -> DONE to R.string.settings_imports_step_reverted
    ImportDetail.VALIDATING -> VALIDATE to null
    ImportDetail.READY, ImportDetail.INVALID -> REVIEW to null
    ImportDetail.COMMITTING -> COMMIT to null
    ImportDetail.COMMITTED -> DONE to null
    else -> 0 to null
}

private const val VALIDATE = 1
private const val REVIEW = 2
private const val COMMIT = 3
private const val DONE = 4
private val DOT = 24.dp
private val ICON = 16.dp
