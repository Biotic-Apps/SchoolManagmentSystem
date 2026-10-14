package com.schoolapp.feature.admin

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.hilt.lifecycle.viewmodel.compose.hiltViewModel
import com.schoolapp.core.model.RoleRef
import com.schoolapp.feature.admin.schools.SchoolDetailDestination
import com.schoolapp.feature.admin.schools.list.SchoolsListRoute
import com.schoolapp.feature.admin.schools.setup.SchoolSetupDestination

/** Menu `schools` (Schools): list, details, edit, archive/restore, permanent delete and the one-form setup. */
@Composable
fun SchoolsMenuScreen(role: RoleRef, onOpen: (Any) -> Unit, modifier: Modifier = Modifier) {
    SchoolsListRoute(
        onOpenSchool = { onOpen(SchoolDetailDestination(it)) },
        onNewSchool = { onOpen(SchoolSetupDestination) },
        modifier = modifier,
        viewModel = hiltViewModel(key = "schools_${role.key}"),
    )
}
