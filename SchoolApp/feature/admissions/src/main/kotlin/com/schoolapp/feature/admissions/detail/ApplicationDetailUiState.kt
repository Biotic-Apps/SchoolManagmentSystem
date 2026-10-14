package com.schoolapp.feature.admissions.detail

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.model.admissions.ApplicationDocument
import com.schoolapp.core.model.admissions.ApplicationStatus
import com.schoolapp.feature.admissions.common.AdmissionAccess

/** The one action dialog or sheet open over the application. */
sealed interface DetailSheet {
    data object ScheduleTest : DetailSheet
    data object TestResult : DetailSheet
    data object Withdraw : DetailSheet
    data object Upload : DetailSheet
    data class Decide(val decision: AdmissionDecision) : DetailSheet
    data class Verify(val document: ApplicationDocument) : DetailSheet
    data class Reject(val document: ApplicationDocument) : DetailSheet
}

/** Workflow actions allowed now, same rules as the web drawer (permission + status). */
@Immutable
data class ApplicationActionFlags(
    val edit: Boolean = false,
    val scheduleTest: Boolean = false,
    val recordResult: Boolean = false,
    val decide: Boolean = false,
    val confirm: Boolean = false,
    val withdraw: Boolean = false,
    val uploadDocuments: Boolean = false,
    val verifyDocuments: Boolean = false,
) {
    val any: Boolean get() = edit || scheduleTest || recordResult || decide || confirm || withdraw

    companion object {
        fun of(app: AdmissionApplication?, access: AdmissionAccess): ApplicationActionFlags {
            val status = app?.status ?: return ApplicationActionFlags()
            return ApplicationActionFlags(
                edit = access.canEdit && status.isDecidable,
                scheduleTest = access.canEdit && status.canScheduleTest,
                recordResult = access.canEdit && status == ApplicationStatus.TEST_SCHEDULED,
                decide = access.canApprove && status.isDecidable,
                confirm = access.canApprove && status == ApplicationStatus.OFFERED,
                withdraw = access.canEdit && status.isOpen,
                // The API takes new documents only before a decision.
                uploadDocuments = access.canEdit && status.isDecidable,
                verifyDocuments = access.canVerifyDocuments && status.isOpen,
            )
        }
    }
}

@Immutable
data class ApplicationDetailUiState(
    val isLoading: Boolean = true,
    val isRefreshing: Boolean = false,
    val application: AdmissionApplication? = null,
    val loadError: AppError? = null,
    val access: AdmissionAccess = AdmissionAccess(),
    val sheet: DetailSheet? = null,
    val busy: Boolean = false,
    /** Failure of the action in the open sheet. */
    val actionError: AppError? = null,
    /** String resource of a one-off success message. */
    val notice: Int? = null,
) {
    val actions: ApplicationActionFlags get() = ApplicationActionFlags.of(application, access)
}
