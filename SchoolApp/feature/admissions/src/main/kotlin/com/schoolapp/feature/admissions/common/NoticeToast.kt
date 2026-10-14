package com.schoolapp.feature.admissions.common

import android.widget.Toast
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.platform.LocalContext

/** Shows a one-off success message (string resource) as a toast, then clears it. */
@Composable
fun NoticeToast(notice: Int?, onShown: () -> Unit) {
    val context = LocalContext.current
    LaunchedEffect(notice) {
        if (notice != null) {
            Toast.makeText(context, notice, Toast.LENGTH_SHORT).show()
            onShown()
        }
    }
}
