package com.schoolapp.feature.attendance.leave

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.WindowInsets
import androidx.compose.foundation.layout.ime
import androidx.compose.foundation.layout.navigationBars
import androidx.compose.foundation.layout.union
import androidx.compose.foundation.layout.windowInsetsPadding
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.widthIn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Close
import androidx.compose.material.icons.automirrored.outlined.Send
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.Immutable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.ContentMaxWidth
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.leave.LeaveType
import com.schoolapp.feature.attendance.R

@Immutable
internal class LeaveFormCallbacks(
    val onTypeChange: (LeaveType) -> Unit,
    val onFromChange: (String) -> Unit,
    val onToChange: (String) -> Unit,
    val onReasonChange: (String) -> Unit,
    val onAttach: (String) -> Unit,
    val onRemoveAttachment: (String) -> Unit,
    val onSubmit: () -> Unit,
    val onDismiss: () -> Unit,
)

internal fun MyLeavesController.formCallbacks() = LeaveFormCallbacks(
    onTypeChange = this::onTypeChange,
    onFromChange = this::onFromChange,
    onToChange = this::onToChange,
    onReasonChange = this::onReasonChange,
    onAttach = this::onAttach,
    onRemoveAttachment = this::onRemoveAttachment,
    onSubmit = this::submit,
    onDismiss = this::dismissForm,
)

/**
 * Full-screen "Request leave" form with the send button pinned to the bottom (above the keyboard).
 * [childName] is set for a parent's request; staff pick a leave type.
 */
@Composable
internal fun LeaveRequestScreen(form: LeaveForm, childName: String?, today: String, callbacks: LeaveFormCallbacks) {
    Dialog(
        onDismissRequest = callbacks.onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false, decorFitsSystemWindows = false),
    ) {
        AppScaffold(
            topBar = {
                AppTopBar(
                    title = stringResource(R.string.attendance_leave_request_title),
                    subtitle = childName?.let { stringResource(R.string.leave_for_child, it) },
                    navigationIcon = {
                        IconButton(onClick = callbacks.onDismiss, enabled = !form.isSaving) {
                            Icon(Icons.Outlined.Close, contentDescription = stringResource(R.string.leave_form_close))
                        }
                    },
                )
            },
            bottomBar = { SendBar(form, callbacks.onSubmit) },
        ) { padding ->
            LeaveRequestForm(form, isChild = childName != null, today = today, callbacks = callbacks, modifier = Modifier.padding(padding))
        }
    }
}

@Composable
private fun SendBar(form: LeaveForm, onSubmit: () -> Unit) {
    Box(Modifier.fillMaxWidth().background(AppColors.Surface).windowInsetsPadding(WindowInsets.navigationBars.union(WindowInsets.ime)), contentAlignment = Alignment.Center) {
        HorizontalDivider(Modifier.align(Alignment.TopCenter), color = AppColors.Border)
        PrimaryButton(
            text = stringResource(R.string.attendance_leave_send),
            onClick = onSubmit,
            loading = form.isSaving,
            enabled = !form.attachments.isUploading,
            leadingIcon = Icons.AutoMirrored.Outlined.Send,
            modifier = Modifier.widthIn(max = ContentMaxWidth).fillMaxWidth().padding(16.dp),
        )
    }
}
