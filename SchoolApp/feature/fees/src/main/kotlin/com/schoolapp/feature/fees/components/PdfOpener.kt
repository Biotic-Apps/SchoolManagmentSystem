package com.schoolapp.feature.fees.components

import android.content.ActivityNotFoundException
import android.content.Context
import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext
import com.schoolapp.core.data.fees.pdf.PdfFileStore

/** Opens a downloaded PDF (content uri from [PdfFileStore]) in the phone's PDF viewer. */
@Stable
internal class PdfOpener(private val context: Context) {
    fun open(uri: String) {
        try {
            context.startActivity(PdfFileStore.viewIntent(uri))
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, com.schoolapp.core.ui.R.string.ui_no_app, Toast.LENGTH_SHORT).show()
        }
    }
}

@Composable
internal fun rememberPdfOpener(): PdfOpener {
    val context = LocalContext.current
    return remember(context) { PdfOpener(context) }
}
