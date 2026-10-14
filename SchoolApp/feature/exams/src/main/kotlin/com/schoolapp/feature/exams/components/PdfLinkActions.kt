package com.schoolapp.feature.exams.components

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Share
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.exams.R

/** Open (download / view) and Share buttons for a ready PDF [url] (signed link). [title] is the share subject. */
@Composable
internal fun PdfLinkActions(url: String, title: String, modifier: Modifier = Modifier) {
    val external = rememberExternalActions()
    val context = LocalContext.current
    Row(modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
        PrimaryButton(
            text = stringResource(R.string.exams_pdf_open),
            onClick = { external.open(url) },
            leadingIcon = Icons.Outlined.Download,
            modifier = Modifier.weight(1f),
        )
        SecondaryButton(
            text = stringResource(R.string.exams_pdf_share),
            onClick = { sharePdfLink(context, url, title) },
            leadingIcon = Icons.Outlined.Share,
            modifier = Modifier.weight(1f),
        )
    }
}

/** Shares the PDF link through the system share sheet (WhatsApp, email, ...). */
internal fun sharePdfLink(context: Context, url: String, title: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, "$title\n$url")
    }
    try {
        context.startActivity(Intent.createChooser(send, title).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) {
        // No app can share text; nothing else to do.
    }
}
