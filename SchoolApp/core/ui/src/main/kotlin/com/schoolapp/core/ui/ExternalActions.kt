package com.schoolapp.core.ui

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Stable
import androidx.compose.runtime.remember
import androidx.compose.ui.platform.LocalContext

/** Hand-offs to other apps (dialer, SMS, browser/viewer); only user taps call these. */
@Stable
class ExternalActions internal constructor(private val context: Context) {
    fun dial(phone: String) = launch(Intent(Intent.ACTION_DIAL, Uri.fromParts("tel", phone, null)))

    fun sms(phone: String) = launch(Intent(Intent.ACTION_SENDTO, Uri.fromParts("smsto", phone, null)))

    fun open(url: String) = launch(Intent(Intent.ACTION_VIEW, Uri.parse(url)))

    private fun launch(intent: Intent) {
        try {
            context.startActivity(intent)
        } catch (e: ActivityNotFoundException) {
            Toast.makeText(context, R.string.ui_no_app, Toast.LENGTH_SHORT).show()
        }
    }
}

@Composable
fun rememberExternalActions(): ExternalActions {
    val context = LocalContext.current
    return remember(context) { ExternalActions(context) }
}
