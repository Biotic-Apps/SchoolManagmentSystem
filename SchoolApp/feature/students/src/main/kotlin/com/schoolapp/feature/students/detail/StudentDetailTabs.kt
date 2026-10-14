package com.schoolapp.feature.students.detail

import androidx.annotation.StringRes
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.core.model.people.StudentDetail
import com.schoolapp.feature.students.R
import com.schoolapp.feature.students.detail.attendance.StudentAttendanceTab
import com.schoolapp.feature.students.detail.documents.StudentDocumentsTab
import com.schoolapp.feature.students.detail.enrollments.EnrollmentHistoryTab
import com.schoolapp.feature.students.detail.health.StudentHealthTab
import com.schoolapp.feature.students.detail.idcard.StudentIdCardPanel
import com.schoolapp.feature.students.detail.pickup.StudentPickupTab
import com.schoolapp.feature.students.manage.ManageController

/** Same tabs as the web student profile; Attendance, Health and Pickup need their `.view` permission. */
internal enum class StudentDetailTab(@StringRes val title: Int) {
    PROFILE(R.string.sd_tab_profile),
    ATTENDANCE(R.string.sd_tab_attendance),
    HEALTH(R.string.sd_tab_health),
    PICKUP(R.string.sd_tab_pickup),
    DOCUMENTS(R.string.sd_tab_documents),
    ENROLLMENTS(R.string.sd_tab_enrollments),
    ID_CARD(R.string.sd_tab_id_card),
}

internal fun StudentDetailUiState.visibleTabs(): List<StudentDetailTab> = StudentDetailTab.entries.filter { tab ->
    when (tab) {
        StudentDetailTab.ATTENDANCE -> canViewAttendance
        StudentDetailTab.HEALTH -> canViewHealth
        StudentDetailTab.PICKUP -> canViewPickup
        else -> true
    }
}

@Composable
internal fun StudentDetailTabContent(
    tab: StudentDetailTab,
    detail: StudentDetail,
    state: StudentDetailUiState,
    manage: ManageController?,
    onNoticeShown: () -> Unit,
    snackbar: SnackbarHostState,
    modifier: Modifier = Modifier,
) {
    val studentId = detail.summary.id
    when (tab) {
        StudentDetailTab.PROFILE -> StudentProfileTab(detail, state, manage, onNoticeShown, modifier)
        StudentDetailTab.ATTENDANCE -> StudentAttendanceTab(studentId, modifier)
        StudentDetailTab.HEALTH -> StudentHealthTab(studentId, state.canEditHealth, snackbar, modifier)
        StudentDetailTab.PICKUP -> StudentPickupTab(studentId, state.canEditPickup, snackbar, modifier)
        StudentDetailTab.DOCUMENTS -> StudentDocumentsTab(studentId, state.canEditStudent, snackbar, modifier)
        StudentDetailTab.ENROLLMENTS -> EnrollmentHistoryTab(studentId, modifier)
        StudentDetailTab.ID_CARD -> StudentIdCardPanel(studentId, state.canEditStudent, snackbar, modifier)
    }
}
