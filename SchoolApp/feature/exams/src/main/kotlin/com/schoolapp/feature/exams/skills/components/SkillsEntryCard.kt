package com.schoolapp.feature.exams.skills.components

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.EmojiPeople
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.feature.exams.R

/** Opens behaviour & skills ratings for one of the teacher's sections. */
@Composable
internal fun SkillsEntryCard(sectionLabel: String, onClick: () -> Unit, modifier: Modifier = Modifier) {
    AppCard(modifier = modifier, onClick = onClick, contentPadding = 0.dp) {
        ListItemRow(
            title = stringResource(R.string.exams_skills_card_title, sectionLabel),
            supporting = stringResource(R.string.exams_skills_card_supporting),
            leadingIcon = Icons.Outlined.EmojiPeople,
        )
    }
}
