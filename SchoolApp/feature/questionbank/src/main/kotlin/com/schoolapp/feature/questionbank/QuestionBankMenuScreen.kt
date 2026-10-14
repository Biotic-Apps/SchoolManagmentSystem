package com.schoolapp.feature.questionbank

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.AutoAwesome
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.questionbank.bank.QuestionsTab
import com.schoolapp.feature.questionbank.bank.QuestionsViewModel
import com.schoolapp.feature.questionbank.common.changeMessage
import com.schoolapp.feature.questionbank.papers.PapersTab
import com.schoolapp.feature.questionbank.papers.PapersViewModel

/** Menu `question_bank` (Question Bank & Papers): the bank with add / edit / delete, and the paper generator. */
@Composable
fun QuestionBankMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    val questions: QuestionsViewModel = hiltViewModel(key = "qb_questions_${role.key}")
    val papers: PapersViewModel = hiltViewModel(key = "qb_papers_${role.key}")
    val host: QuestionBankHostViewModel = hiltViewModel(key = "qb_host_${role.key}")
    val questionsState by questions.uiState.collectAsStateWithLifecycle()
    val papersState by papers.uiState.collectAsStateWithLifecycle()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    val snackbar = remember { SnackbarHostState() }
    val pending by host.pending.collectAsStateWithLifecycle()
    val message = pending?.let { changeMessage(it) }
    LaunchedEffect(message) {
        if (message != null) {
            host.onShown()
            snackbar.showSnackbar(message)
        }
    }
    val questionsSchool = questionsState.schoolId
    val papersSchool = papersState.schoolId
    val showAdd = tab == 0 && questionsState.permissions.canAdd && questionsSchool != null
    val showGenerate = tab == 1 && papersState.permissions.canAdd && papersSchool != null
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            AppTabs(
                titles = listOf(stringResource(R.string.qb_tab_questions), stringResource(R.string.qb_tab_papers)),
                selectedIndex = tab,
                onSelect = { tab = it },
            )
            when (tab) {
                0 -> QuestionsTab(
                    viewModel = questions,
                    onEdit = { schoolId, id -> onOpen(QuestionFormDestination(schoolId, id)) },
                    bottomPadding = showAdd,
                    modifier = Modifier.weight(1f),
                )
                else -> PapersTab(
                    viewModel = papers,
                    onOpenPaper = { onOpen(PaperDetailDestination(it)) },
                    bottomPadding = showGenerate,
                    modifier = Modifier.weight(1f),
                )
            }
        }
        if (showAdd) {
            AppFloatingButton(
                text = stringResource(R.string.qb_add_question),
                icon = Icons.Outlined.Add,
                onClick = { onOpen(QuestionFormDestination(questionsSchool)) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
        if (showGenerate) {
            AppFloatingButton(
                text = stringResource(R.string.qb_generate_paper),
                icon = Icons.Outlined.AutoAwesome,
                onClick = { onOpen(GeneratePaperDestination(papersSchool)) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
        SnackbarHost(snackbar, Modifier.align(Alignment.BottomCenter).padding(16.dp))
    }
}
