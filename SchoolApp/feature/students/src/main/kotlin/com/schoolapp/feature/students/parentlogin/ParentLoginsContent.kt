package com.schoolapp.feature.students.parentlogin

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.InlineMessage
import com.schoolapp.core.designsystem.component.KeyValueRow
import com.schoolapp.core.designsystem.component.PrimaryButton
import com.schoolapp.core.designsystem.component.ScreenColumn
import com.schoolapp.core.designsystem.component.SectionHeader
import com.schoolapp.core.designsystem.component.StatusTone
import com.schoolapp.core.model.admissions.ParentLogin
import com.schoolapp.core.ui.SecureWindowEffect
import com.schoolapp.feature.students.R

/**
 * "Student registered": admission number and each guardian's parent sign-in (like the web's
 * ParentSignInDialog after RegisterStudentDialog). Temporary passwords show once; screenshots are blocked.
 */
@Composable
internal fun ParentLoginsContent(
    studentName: String,
    admissionNo: String?,
    logins: List<ParentLogin>,
    onDone: () -> Unit,
    modifier: Modifier = Modifier,
) {
    val fresh = logins.any { it.temporaryPassword != null }
    if (fresh) SecureWindowEffect()
    ScreenColumn(modifier) {
        item { InlineMessage(stringResource(R.string.students_registered_message, studentName), StatusTone.Success) }
        item {
            AppCard(Modifier.fillMaxWidth()) {
                SectionHeader(title = studentName)
                KeyValueRow(stringResource(R.string.students_admission_no), admissionNo)
            }
        }
        item { SectionHeader(title = stringResource(R.string.students_parent_logins)) }
        item { InlineMessage(stringResource(R.string.students_parent_logins_hint), StatusTone.Info) }
        logins.forEachIndexed { index, login -> item(key = "login$index") { ParentLoginCard(login, admissionNo) } }
        if (fresh) item { InlineMessage(stringResource(R.string.students_temp_password_once), StatusTone.Warning) }
        item { PrimaryButton(stringResource(R.string.students_open_profile), onDone, Modifier.fillMaxWidth()) }
    }
}
