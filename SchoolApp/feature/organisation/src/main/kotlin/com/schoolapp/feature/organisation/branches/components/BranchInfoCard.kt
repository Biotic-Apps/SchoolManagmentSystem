package com.schoolapp.feature.organisation.branches.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.organisation.R
import com.schoolapp.feature.organisation.components.recordStatusTone

@Composable
internal fun BranchInfoCard(branch: Branch, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = branch.name,
            subtitle = branch.schoolName,
            action = { branch.status?.let { StatusChip(humanizeKey(it), recordStatusTone(it)) } },
        )
        KeyValueRow(stringResource(R.string.org_branch_code), branch.code)
        KeyValueRow(stringResource(R.string.org_branch_principal), branch.principalName)
        KeyValueRow(stringResource(R.string.org_branch_address), branch.address)
        KeyValueRow(stringResource(R.string.org_branch_phone), branch.phone)
        KeyValueRow(stringResource(R.string.org_branch_email), branch.email)
    }
}
