package com.schoolapp.feature.notices

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.RoleRef

/** Menu `notices`: the feed, plus Manage + "New notice" for roles holding `notices.add`. The VMs follow the session, so [role] only scopes state. */
@Composable
fun NoticesMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    NoticesHome(
        onOpenNotice = { onOpen(NoticeDetailDestination(it)) },
        onCompose = { onOpen(NoticeComposeDestination()) },
        modifier = modifier,
        key = "notices_$role",
    )
}
