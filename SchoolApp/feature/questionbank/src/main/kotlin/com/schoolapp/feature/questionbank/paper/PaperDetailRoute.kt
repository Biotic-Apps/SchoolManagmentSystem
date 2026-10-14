package com.schoolapp.feature.questionbank.paper

import android.content.ActivityNotFoundException
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Download
import androidx.compose.material.icons.outlined.Publish
import androidx.compose.material.icons.outlined.Unpublished
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.data.fees.pdf.PdfFileStore
import com.schoolapp.core.designsystem.component.AppScaffold
import com.schoolapp.core.designsystem.component.AppTopBar
import com.schoolapp.core.designsystem.component.BackButton
import com.schoolapp.core.designsystem.component.ErrorState
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.LoadingState
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SecondaryButton
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.questions.PaperStatus
import com.schoolapp.core.ui.actionErrorMessage
import com.schoolapp.core.ui.loadErrorMessage
import com.schoolapp.feature.questionbank.R
import com.schoolapp.feature.questionbank.components.PaperCard

/** Paper detail: summary, PDF download (opened in a viewer), publish / draft and every section's questions. */
@Composable
internal fun PaperDetailRoute(
    onBack: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: PaperDetailViewModel = hiltViewModel(),
) {
    val state by viewModel.uiState.collectAsStateWithLifecycle()
    val snackbar = remember { SnackbarHostState() }
    val context = LocalContext.current
    val noViewer = stringResource(R.string.qb_no_pdf_app)
    LaunchedEffect(state.openUri) {
        val uri = state.openUri ?: return@LaunchedEffect
        viewModel.onPdfOpened()
        try {
            context.startActivity(PdfFileStore.viewIntent(uri))
        } catch (e: ActivityNotFoundException) {
            snackbar.showSnackbar(noViewer)
        }
    }
    val notice = state.notice?.let { noticeText(it) }
    LaunchedEffect(notice) {
        if (notice != null) {
            viewModel.onNoticeShown()
            snackbar.showSnackbar(notice)
        }
    }
    AppScaffold(
        modifier = modifier,
        snackbarHostState = snackbar,
        topBar = {
            AppTopBar(
                title = state.paper?.title ?: stringResource(R.string.qb_paper),
                navigationIcon = { BackButton(onBack) },
            )
        },
    ) { padding ->
        PaperDetailContent(state, viewModel, Modifier.padding(padding))
    }
}

@Composable
private fun PaperDetailContent(state: PaperDetailUiState, viewModel: PaperDetailViewModel, modifier: Modifier) {
    val paper = state.paper
    when {
        state.isLoading && paper == null -> LoadingState(modifier)
        paper == null -> ErrorState(state.error?.let { loadErrorMessage(it) }.orEmpty(), modifier, onRetry = viewModel::load)
        else -> ScreenColumn(modifier) {
            item(key = "summary") { PaperCard(paper) }
            state.actionError?.let { error -> item(key = "error") { InlineMessage(actionErrorMessage(error), StatusTone.Error) } }
            item(key = "actions") {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    PrimaryButton(
                        text = stringResource(R.string.qb_download_pdf),
                        onClick = viewModel::downloadPdf,
                        loading = state.isDownloading,
                        leadingIcon = Icons.Outlined.Download,
                    )
                    if (state.canPublish) {
                        val published = paper.status == PaperStatus.PUBLISHED
                        SecondaryButton(
                            text = stringResource(if (published) R.string.qb_move_to_draft else R.string.qb_publish),
                            onClick = viewModel::toggleStatus,
                            loading = state.isUpdatingStatus,
                            leadingIcon = if (published) Icons.Outlined.Unpublished else Icons.Outlined.Publish,
                        )
                    }
                }
            }
            itemsIndexed(paper.sections, key = { index, _ -> "section_$index" }) { _, section ->
                PaperSectionBlock(section, state.questions, state.questionsLoading)
            }
        }
    }
}

@Composable
private fun noticeText(notice: PaperNotice): String = stringResource(
    when (notice) {
        PaperNotice.GENERATED -> R.string.qb_paper_generated
        PaperNotice.PUBLISHED -> R.string.qb_paper_published
        PaperNotice.MOVED_TO_DRAFT -> R.string.qb_paper_drafted
    },
)
