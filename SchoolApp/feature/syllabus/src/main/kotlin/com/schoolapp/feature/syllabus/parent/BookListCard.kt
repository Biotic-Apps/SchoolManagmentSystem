package com.schoolapp.feature.syllabus.parent

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.MenuBook
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.ListItemRow
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusChip
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.syllabus.BookList
import com.schoolapp.core.ui.formatDate
import com.schoolapp.feature.syllabus.R

@Composable
internal fun BookListCard(bookList: BookList?, modifier: Modifier = Modifier) {
    AppCard(modifier.fillMaxWidth()) {
        SectionHeader(
            title = stringResource(R.string.syllabus_books),
            subtitle = bookList?.let { list ->
                listOfNotNull(
                    list.className,
                    list.revision?.let { stringResource(R.string.syllabus_revision, it) },
                    formatDate(list.approvedAt),
                ).joinToString(" · ")
            },
        )
        if (bookList == null || bookList.items.isEmpty()) {
            Text(stringResource(R.string.syllabus_books_empty), style = MaterialTheme.typography.bodyMedium, color = AppColors.TextSecondary)
            return@AppCard
        }
        bookList.items.forEach { book ->
            ListItemRow(
                title = book.title,
                supporting = listOfNotNull(book.subjectName, book.author, book.publisher).joinToString(" · "),
                leadingIcon = Icons.AutoMirrored.Outlined.MenuBook,
                trailing = if (book.isMandatory) null else { { StatusChip(stringResource(R.string.syllabus_optional), StatusTone.Neutral) } },
            )
        }
    }
}
