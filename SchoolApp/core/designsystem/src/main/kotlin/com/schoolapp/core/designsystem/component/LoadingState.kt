package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

@Composable
fun LoadingState(
    modifier: Modifier = Modifier,
    message: String? = null,
) {
    val description = message ?: stringResource(R.string.ds_loading)
    Column(
        modifier = modifier.fillMaxWidth().padding(24.dp).semantics { contentDescription = description },
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        CircularProgressIndicator(color = AppColors.Primary, trackColor = AppColors.Selected)
        if (message != null) {
            Text(message, style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
        }
    }
}

@Preview
@Composable
private fun LoadingStatePreview() = PreviewContainer {
    LoadingState(message = "Loading students")
}
