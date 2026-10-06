package com.schoolapp.core.designsystem.brand

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Icon
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.component.PreviewContainer
import com.schoolapp.core.designsystem.theme.AppColors

/** School logo when available, otherwise the graduation-cap mark on [color]. Decorative: the school name is shown next to it. */
@Composable
fun BrandMark(
    logoUrl: String?,
    modifier: Modifier = Modifier,
    color: Color = AppColors.Primary,
    size: Dp = 48.dp,
) {
    val hasLogo = !logoUrl.isNullOrBlank()
    Box(
        modifier = modifier.size(size).clip(RoundedCornerShape(size / 4)).background(if (hasLogo) AppColors.Selected else color),
        contentAlignment = Alignment.Center,
    ) {
        if (hasLogo) {
            AsyncImage(
                model = logoUrl,
                contentDescription = null,
                contentScale = ContentScale.Fit,
                modifier = Modifier.fillMaxSize(),
            )
        } else {
            Icon(
                painter = painterResource(R.drawable.ic_brand_mark),
                contentDescription = null,
                tint = AppColors.OnPrimary,
                modifier = Modifier.padding(size / 5).fillMaxSize(),
            )
        }
    }
}

@Preview
@Composable
private fun BrandMarkPreview() = PreviewContainer { BrandMark(logoUrl = null) }
