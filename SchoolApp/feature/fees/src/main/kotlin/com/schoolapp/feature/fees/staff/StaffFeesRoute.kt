package com.schoolapp.feature.fees.staff

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Payments
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import androidx.lifecycle.compose.LifecycleResumeEffect
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.schoolapp.core.designsystem.component.AppFloatingButton
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.ui.rememberExternalActions
import com.schoolapp.feature.fees.R
import com.schoolapp.feature.fees.RecordPaymentDestination
import com.schoolapp.feature.fees.staff.dues.DuesTab
import com.schoolapp.feature.fees.staff.dues.DuesViewModel
import com.schoolapp.feature.fees.staff.proofs.ProofsActions
import com.schoolapp.feature.fees.staff.proofs.ProofsTab
import com.schoolapp.feature.fees.staff.proofs.ProofsViewModel
import com.schoolapp.feature.fees.staff.today.TodayTab
import com.schoolapp.feature.fees.staff.today.TodayViewModel

/** Accountant / principal / super admin: Today (collection), Dues and Proofs tabs plus "Record payment". */
@Composable
internal fun StaffFeesRoute(
    roleKey: String,
    onOpen: (Any) -> Unit,
    onOpenApprovals: (() -> Unit)?,
    modifier: Modifier = Modifier,
    todayViewModel: TodayViewModel = hiltViewModel(key = "fees_today_$roleKey"),
    duesViewModel: DuesViewModel = hiltViewModel(key = "fees_dues_$roleKey"),
    proofsViewModel: ProofsViewModel = hiltViewModel(key = "fees_proofs_$roleKey"),
) {
    val today by todayViewModel.uiState.collectAsStateWithLifecycle()
    val dues by duesViewModel.uiState.collectAsStateWithLifecycle()
    val proofs by proofsViewModel.uiState.collectAsStateWithLifecycle()
    val external = rememberExternalActions()
    var tab by rememberSaveable { mutableIntStateOf(0) }
    var resumedOnce by remember { mutableStateOf(false) }
    LifecycleResumeEffect(todayViewModel) {
        if (resumedOnce) todayViewModel.refresh()
        resumedOnce = true
        onPauseOrDispose { }
    }
    Box(modifier.fillMaxSize()) {
        Column(Modifier.fillMaxSize()) {
            AppTabs(
                titles = listOf(
                    stringResource(R.string.fees_tab_today),
                    stringResource(R.string.fees_tab_dues),
                    stringResource(R.string.fees_tab_proofs),
                ),
                selectedIndex = tab,
                onSelect = { tab = it },
            )
            when (tab) {
                0 -> TodayTab(today, todayViewModel::retry, todayViewModel::refresh, onOpenApprovals)
                1 -> DuesTab(dues, duesViewModel::onSearchChange, duesViewModel::retry, duesViewModel::refresh)
                else -> ProofsTab(
                    state = proofs,
                    actions = ProofsActions(
                        onRetry = proofsViewModel::retry,
                        onRefresh = proofsViewModel::refresh,
                        onOpen = proofsViewModel::open,
                        onOpenFile = external::open,
                        onChoose = proofsViewModel::choose,
                        onTextChange = proofsViewModel::onTextChange,
                        onConfirm = proofsViewModel::confirm,
                        onDismiss = proofsViewModel::dismiss,
                    ),
                )
            }
        }
        if (today.canRecord) {
            AppFloatingButton(
                text = stringResource(R.string.fees_record_payment),
                icon = Icons.Outlined.Payments,
                onClick = { onOpen(RecordPaymentDestination) },
                modifier = Modifier.align(Alignment.BottomEnd).padding(16.dp),
            )
        }
    }
}
