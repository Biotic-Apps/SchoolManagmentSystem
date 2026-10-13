package com.schoolapp.feature.auth.components

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.heading
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.brand.BrandMark
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.designsystem.theme.SchoolTheme
import com.schoolapp.feature.auth.R
import com.schoolapp.feature.auth.branding.LoginBrandUiState

@Composable
internal fun LoginHeader(brand: LoginBrandUiState, modifier: Modifier = Modifier) {
    Column(modifier, verticalArrangement = Arrangement.spacedBy(16.dp)) {
        BrandMark(logoUrl = brand.logoUrl, color = brand.color)
        Text(
            text = brand.name ?: stringResource(R.string.auth_title),
            style = MaterialTheme.typography.headlineMedium,
            color = AppColors.TextPrimary,
            modifier = Modifier.semantics { heading() },
        )
        Text(
            text = stringResource(R.string.auth_subtitle),
            style = MaterialTheme.typography.bodyLarge,
            color = AppColors.TextSecondary,
        )
    }
}

@Preview(showBackground = true)
@Composable
private fun LoginHeaderPreview() = SchoolTheme { LoginHeader(LoginBrandUiState()) }
