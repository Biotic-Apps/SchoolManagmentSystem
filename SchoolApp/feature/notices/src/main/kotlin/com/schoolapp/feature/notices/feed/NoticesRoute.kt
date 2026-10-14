package com.schoolapp.feature.notices.feed

import androidx.compose.foundation.layout.padding
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.feature.notices.NoticesHome
import com.schoolapp.feature.notices.R

/** Full-screen notices for roles without a notices menu entry (parents, teachers). */
@Composable
internal fun NoticesRoute(
    onBack: () -> Unit,
    onOpenNotice: (String) -> Unit,
    onCompose: () -> Unit,
    modifier: Modifier = Modifier,
) {
    AppScaffold(
        modifier = modifier,
        topBar = { AppTopBar(title = stringResource(R.string.notices_title), navigationIcon = { BackButton(onBack) }) },
    ) { padding ->
        NoticesHome(onOpenNotice = onOpenNotice, onCompose = onCompose, modifier = Modifier.padding(padding))
    }
}
