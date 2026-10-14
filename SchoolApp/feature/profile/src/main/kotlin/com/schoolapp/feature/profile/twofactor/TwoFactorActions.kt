package com.schoolapp.feature.profile.twofactor

import android.app.Activity
import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PersistableBundle
import com.schoolapp.feature.profile.R

/** Clipboard, share sheet and authenticator hand-off. Copies are marked sensitive so previews hide them. */
internal object TwoFactorActions {
    fun copy(context: Context, label: String, text: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
        val clip = ClipData.newPlainText(label, text)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            clip.description.extras = PersistableBundle().apply { putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true) }
        }
        clipboard.setPrimaryClip(clip)
    }

    fun share(context: Context, text: String) {
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        val chooser = Intent.createChooser(send, context.getString(R.string.two_factor_share_title)).apply {
            if (context !is Activity) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(chooser)
    }

    /** Returns false when no app handles `otpauth://` links. */
    fun openAuthenticator(context: Context, otpauthUrl: String): Boolean = try {
        context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(otpauthUrl)))
        true
    } catch (e: ActivityNotFoundException) {
        false
    }

    fun recoveryCodesText(context: Context, account: String, codes: List<String>): String =
        buildString {
            appendLine(context.getString(R.string.two_factor_codes_share_heading, account).trim())
            appendLine(context.getString(R.string.two_factor_codes_share_note))
            appendLine()
            codes.forEach(::appendLine)
        }

    /** Groups a base32 secret in fours for typing by hand. */
    fun groupSecret(secret: String): String = secret.filterNot(Char::isWhitespace).chunked(GROUP).joinToString(" ")

    private const val GROUP = 4
}
