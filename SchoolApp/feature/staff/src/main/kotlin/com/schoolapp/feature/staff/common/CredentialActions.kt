package com.schoolapp.feature.staff.common

import android.content.ClipData
import android.content.ClipDescription
import android.content.ClipboardManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.PersistableBundle
import android.widget.Toast
import com.schoolapp.feature.staff.R

/** Copy (marked sensitive so the keyboard / clipboard preview hides it) and share via the Android share sheet. */
internal object CredentialActions {
    fun copy(context: Context, password: String) {
        val clipboard = context.getSystemService(Context.CLIPBOARD_SERVICE) as? ClipboardManager ?: return
        val clip = ClipData.newPlainText(context.getString(R.string.staff_temp_password), password)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            clip.description.extras = PersistableBundle().apply { putBoolean(ClipDescription.EXTRA_IS_SENSITIVE, true) }
        }
        clipboard.setPrimaryClip(clip)
        // Android 13+ shows its own copied confirmation.
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.TIRAMISU) {
            Toast.makeText(context, R.string.staff_temp_password_copied, Toast.LENGTH_SHORT).show()
        }
    }

    fun share(context: Context, name: String, signIn: String?, password: String) {
        val text = if (signIn != null) {
            context.getString(R.string.staff_share_text, name, signIn, password)
        } else {
            context.getString(R.string.staff_share_text_no_id, name, password)
        }
        val send = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
        }
        val chooser = Intent.createChooser(send, context.getString(R.string.staff_share_title)).apply {
            if (context !is android.app.Activity) addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        context.startActivity(chooser)
    }
}
