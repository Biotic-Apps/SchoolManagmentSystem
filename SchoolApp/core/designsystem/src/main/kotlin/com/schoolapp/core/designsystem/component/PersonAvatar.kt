package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.tooling.preview.Preview
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import coil3.compose.AsyncImage
import com.schoolapp.core.designsystem.R
import com.schoolapp.core.designsystem.theme.AppColors

/** Round photo with the person's initials underneath (shown while loading or when there is no photo). */
@Composable
fun PersonAvatar(
    name: String,
    photoUrl: String?,
    modifier: Modifier = Modifier,
    size: Dp = 40.dp,
) {
    Box(
        modifier = modifier.size(size).border(width = 1.5.dp, color = AppColors.Border, shape = CircleShape).clip(CircleShape).background(AppColors.Selected),
        contentAlignment = Alignment.Center,
    ) {
        Text(
            text = initialsOf(name),
            style = if (size >= LargeAvatar) MaterialTheme.typography.titleLarge else MaterialTheme.typography.labelLarge,
            color = AppColors.Primary,
        )
        if (!photoUrl.isNullOrBlank()) {
            AsyncImage(
                model = photoUrl,
                contentDescription = stringResource(R.string.ds_photo_of, name),
                contentScale = ContentScale.Crop,
                modifier = Modifier.size(size),
            )
        }
    }
}

internal fun initialsOf(name: String): String =
    name.trim().split(' ').filter { it.isNotEmpty() }.take(2).joinToString("") { it.first().uppercase() }

private val LargeAvatar = 56.dp

@Preview
@Composable
private fun PersonAvatarPreview() = PreviewContainer { PersonAvatar(name = "Ayesha Khan", photoUrl = null) }
