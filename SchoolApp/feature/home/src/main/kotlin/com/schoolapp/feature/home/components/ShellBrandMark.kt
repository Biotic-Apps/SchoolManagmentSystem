package com.schoolapp.feature.home.components

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.brand.BrandMark
import com.schoolapp.feature.home.R
import com.schoolapp.feature.home.ShellBrand

/** Leading top-bar mark; start padding lines it up with the 16dp content keyline. */
@Composable
internal fun ShellBrandMark(brand: ShellBrand, modifier: Modifier = Modifier) {
    val label = brand.name ?: stringResource(R.string.home_title)
    BrandMark(
        logoUrl = brand.logoUrl,
        color = brand.color,
        size = 32.dp,
        modifier = modifier
            .padding(start = 12.dp, end = 8.dp)
            .semantics { contentDescription = label },
    )
}
