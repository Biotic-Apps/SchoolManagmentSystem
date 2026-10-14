package com.schoolapp.feature.certificates.review

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.certificates.CertificatesRepository
import com.schoolapp.core.model.certificates.Certificate
import com.schoolapp.core.model.certificates.CertificateDecision
import com.schoolapp.core.model.certificates.CertificateStatus
import com.schoolapp.feature.certificates.components.CertificatePdf
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.time.LocalDate

/**
 * Issue (APPROVED -> ISSUED), reissue (duplicate of an issued original) and the PDF that follows: the job is polled
 * until the file is ready, then the card offers Open / Share. Owned by [CertificateReviewViewModel].
 */
internal class IssueActions(
    private val scope: CoroutineScope,
    private val state: MutableStateFlow<CertificateReviewUiState>,
    private val repository: CertificatesRepository,
) {
    fun openIssue(id: String) {
        val current = state.value
        val certificate = current.certificates.firstOrNull { it.id == id } ?: return
        if (!current.canIssue || certificate.status != CertificateStatus.APPROVED) return
        state.update { it.copy(issueForm = IssueForm(id, certificate.type, LocalDate.now().toString()), message = null) }
    }

    fun onEffectiveDate(date: String) = updateIssue { it.copy(effectiveDate = date, error = null) }

    fun dismissIssue() = state.update { if (it.issueForm?.isSaving == true) it else it.copy(issueForm = null) }

    fun submitIssue() {
        val form = state.value.issueForm ?: return
        if (form.isSaving) return
        updateIssue { it.copy(isSaving = true, error = null) }
        scope.launch {
            val result = repository.issue(form.certificateId, form.effectiveDate.takeIf { form.isLeaving })
            when (result) {
                is AppResult.Failure -> updateIssue { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> when (val decision = result.data) {
                    is CertificateDecision.Blocked -> state.update {
                        it.copy(issueForm = null, blocked = it.blocked + (form.certificateId to decision.clearance))
                    }
                    is CertificateDecision.Done -> {
                        state.update {
                            it.replace(decision.certificate).copy(
                                issueForm = null,
                                blocked = it.blocked - form.certificateId,
                                message = ReviewMessage.ISSUED,
                            )
                        }
                        watchPdf(decision.certificate)
                    }
                }
            }
        }
    }

    fun openReissue(id: String) {
        if (state.value.canIssue) state.update { it.copy(reissueForm = ReissueForm(id), message = null) }
    }

    fun onReissueReason(reason: String) = updateReissue { it.copy(reason = reason, reasonMissing = false) }

    fun dismissReissue() = state.update { if (it.reissueForm?.isSaving == true) it else it.copy(reissueForm = null) }

    fun submitReissue() {
        val form = state.value.reissueForm ?: return
        if (form.isSaving) return
        if (form.reason.isBlank()) {
            updateReissue { it.copy(reasonMissing = true) }
            return
        }
        updateReissue { it.copy(isSaving = true, error = null) }
        scope.launch {
            when (val result = repository.reissue(form.certificateId, form.reason)) {
                is AppResult.Failure -> updateReissue { it.copy(isSaving = false, error = result.error) }
                is AppResult.Success -> {
                    val duplicate = result.data
                    state.update { current ->
                        val list = listOf(duplicate) + current.certificates.filterNot { it.id == duplicate.id }
                        current.copy(certificates = list, reissueForm = null, message = ReviewMessage.REISSUED)
                    }
                    watchPdf(duplicate)
                }
            }
        }
    }

    /** Re-reads one issued certificate: its fileUrl is set once the PDF is ready. */
    fun checkPdf(id: String) {
        setPdf(id, CertificatePdf.Preparing)
        scope.launch {
            when (val result = repository.certificate(id)) {
                is AppResult.Failure -> setPdf(id, CertificatePdf.Failed)
                is AppResult.Success -> {
                    val certificate = result.data
                    state.update { it.replace(certificate) }
                    val url = certificate.fileUrl
                    when {
                        !url.isNullOrBlank() -> setPdf(id, CertificatePdf.Ready(url))
                        certificate.jobId != null -> watchPdf(certificate)
                        else -> setPdf(id, CertificatePdf.Pending)
                    }
                }
            }
        }
    }

    private fun watchPdf(certificate: Certificate) {
        val url = certificate.fileUrl
        if (!url.isNullOrBlank()) {
            setPdf(certificate.id, CertificatePdf.Ready(url))
            return
        }
        val jobId = certificate.jobId ?: return setPdf(certificate.id, CertificatePdf.Pending)
        setPdf(certificate.id, CertificatePdf.Preparing)
        scope.launch {
            when (val result = repository.pdfUrl(jobId)) {
                is AppResult.Success -> {
                    setPdf(certificate.id, CertificatePdf.Ready(result.data))
                    state.update { current ->
                        current.copy(certificates = current.certificates.map { if (it.id == certificate.id) it.copy(fileUrl = result.data) else it })
                    }
                }
                is AppResult.Failure -> setPdf(certificate.id, CertificatePdf.Pending)
            }
        }
    }

    private fun setPdf(id: String, pdf: CertificatePdf) = state.update { it.copy(pdf = it.pdf + (id to pdf)) }

    private fun updateIssue(transform: (IssueForm) -> IssueForm) =
        state.update { current -> current.issueForm?.let { current.copy(issueForm = transform(it)) } ?: current }

    private fun updateReissue(transform: (ReissueForm) -> ReissueForm) =
        state.update { current -> current.reissueForm?.let { current.copy(reissueForm = transform(it)) } ?: current }
}

internal fun CertificateReviewUiState.replace(updated: Certificate) =
    copy(certificates = certificates.map { if (it.id == updated.id) updated else it })
