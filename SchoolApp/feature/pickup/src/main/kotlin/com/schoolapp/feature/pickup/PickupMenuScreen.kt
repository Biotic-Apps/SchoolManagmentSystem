package com.schoolapp.feature.pickup

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppTabs
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.pickup.gate.GateRoute
import com.schoolapp.feature.pickup.persons.AuthorisedPersonsTab

/** Menu `pickup`: gate desk (early leaves + departures for a picked day) and the branch authorised-persons tab. */
@Composable
fun PickupMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    var tab by rememberSaveable { mutableIntStateOf(0) }
    Column(modifier.fillMaxSize()) {
        AppTabs(
            titles = listOf(stringResource(R.string.pickup_tab_gate), stringResource(R.string.pickup_tab_persons)),
            selectedIndex = tab,
            onSelect = { tab = it },
        )
        when (tab) {
            0 -> GateRoute(onOpen = onOpen)
            else -> AuthorisedPersonsTab()
        }
    }
}
