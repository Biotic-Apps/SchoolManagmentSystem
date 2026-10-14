package com.schoolapp.feature.students.parentlogin

import android.content.ActivityNotFoundException
import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PersistableBundle
import android.widget.Toast
import com.schoolapp.feature.students.R

/** Copy (marked sensitive) and share a parent's one-time sign-in details. */
internal object ParentLoginActions {
    fun copy(context: Context, password: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
        val clip = ClipData.newPlainText(context.getString(R.string.students_temp_password), password)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            clip.description.extras = PersistableBundle().apply { putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true) }
        }
        clipboard.setPrimaryClip(clip)
        // Android 13+ shows its own copied confirmation.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            Toast.makeText(context, R.string.students_copied, Toast.LENGTH_SHORT).show()
        }
    }

    fun share(context: Context, name: String, username: String, password: String?) {
        val text = if (password != null) {
            context.getString(R.string.students_share_login_text, name, username, password)
        } else {
            context.getString(R.string.students_share_login_text_existing, name, username)
        }
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        try {
            context.startActivity(Intent.createChooser(send, context.getString(R.string.students_share_login_title)).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
        } catch (_: ActivityNotFoundException) {
            // Nothing can share text on this device.
        }
    }
}
