package com.schoolapp.feature.students.list

import android.content.ActivityNotFoundException
import android.content.Context
import android.content.Intent
import com.schoolapp.feature.students.add.SectionOption

/** Classes that have sections in the session, as (classId, className), in section order. */
internal fun List<SectionOption>.classOptions(): List<Pair<String, String>> =
    mapNotNull { section -> section.classId?.let { it to (section.className ?: it) } }.distinctBy { it.first }

/** Shares a signed file link through the system share sheet. */
internal fun shareLink(context: Context, url: String, title: String) {
    val send = Intent(Intent.ACTION_SEND).apply {
        type = "text/plain"
        putExtra(Intent.EXTRA_SUBJECT, title)
        putExtra(Intent.EXTRA_TEXT, "$title\n$url")
    }
    try {
        context.startActivity(Intent.createChooser(send, title).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK))
    } catch (_: ActivityNotFoundException) {
        // Nothing can share text on this device.
    }
}
