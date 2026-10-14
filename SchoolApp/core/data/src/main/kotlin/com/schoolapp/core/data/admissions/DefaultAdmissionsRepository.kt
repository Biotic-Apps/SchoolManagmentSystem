package com.schoolapp.core.data.admissions

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.common.result.map
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.files.FilesRepository
import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionDecision
import com.schoolapp.core.model.admissions.ApplicationDocument
import com.schoolapp.core.model.admissions.ApplicationFormInput
import com.schoolapp.core.model.admissions.ConfirmAdmissionInput
import com.schoolapp.core.model.admissions.ConfirmedAdmission
import com.schoolapp.core.model.admissions.Enquiry
import com.schoolapp.core.model.admissions.EnquiryInput
import com.schoolapp.core.model.admissions.EnquiryUpdate
import com.schoolapp.core.model.admissions.MedicalInfo
import com.schoolapp.core.model.admissions.TestResult
import com.schoolapp.core.model.admissions.TestSchedule
import com.schoolapp.core.model.files.FilePurpose
import com.schoolapp.core.model.people.ApplicationInput
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AdmissionsApi
import com.schoolapp.core.network.dto.admissions.AttachDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.ConvertEnquiryBodyDto
import com.schoolapp.core.network.dto.admissions.DecideBodyDto
import com.schoolapp.core.network.dto.admissions.RejectDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.VerifyDocumentBodyDto
import com.schoolapp.core.network.dto.admissions.WithdrawBodyDto
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAdmissionsRepository @Inject constructor(
    private val api: AdmissionsApi,
    private val apiCaller: ApiCaller,
    private val files: FilesRepository,
) : AdmissionsRepository {

    override suspend fun applications(): AppResult<List<AdmissionApplication>> =
        apiCaller.call { api.applications().data.map { it.toModel() }.sortedByDescending { it.createdAt } }

    override suspend fun application(id: String): AppResult<AdmissionApplication> =
        apiCaller.call { api.application(id).data.toModel() }

    override suspend fun decide(id: String, decision: AdmissionDecision, reason: String?): AppResult<Unit> =
        apiCaller.call { api.decide(id, DecideBodyDto(decision.name, reason.clean())) }

    override suspend fun enquiries(branchId: String?): AppResult<List<Enquiry>> =
        apiCaller.call { api.enquiries(branchId).data.map { it.toModel() }.sortedByDescending { it.createdAt } }

    override suspend fun createEnquiry(input: EnquiryInput): AppResult<Enquiry> =
        apiCaller.call { api.createEnquiry(input.toBody()).data.toModel() }

    override suspend fun updateEnquiry(id: String, update: EnquiryUpdate): AppResult<Enquiry> =
        apiCaller.call { api.updateEnquiry(id, update.toBody()).data.toModel() }

    override suspend fun convertEnquiry(id: String, gender: String, dob: String?): AppResult<String> =
        apiCaller.call { api.convertEnquiry(id, ConvertEnquiryBodyDto(gender, dob.clean())).data.id }

    override suspend fun createApplication(input: ApplicationInput, medical: MedicalInfo?): AppResult<String> =
        apiCaller.call { api.createApplication(createBody(input, medical)).data.id }

    override suspend fun updateApplication(id: String, form: ApplicationFormInput): AppResult<AdmissionApplication> =
        apiCaller.call { api.updateApplication(id, form.toUpdateBody()).data.toModel() }

    override suspend fun scheduleTest(id: String, schedule: TestSchedule): AppResult<AdmissionApplication> =
        apiCaller.call { api.scheduleTest(id, schedule.toBody()).data.toModel() }

    override suspend fun recordTestResult(id: String, result: TestResult): AppResult<AdmissionApplication> =
        apiCaller.call { api.testResult(id, result.toBody()).data.toModel() }

    override suspend fun withdraw(id: String, reason: String): AppResult<AdmissionApplication> =
        apiCaller.call { api.withdraw(id, WithdrawBodyDto(reason.trim())).data.toModel() }

    override suspend fun confirm(id: String, input: ConfirmAdmissionInput): AppResult<ConfirmedAdmission> =
        apiCaller.call { api.confirm(id, input.toBody()).data.toModel() }

    override suspend fun attachDocument(id: String, docType: String, fileUri: String, note: String?): AppResult<ApplicationDocument> =
        when (val uploaded = files.upload(fileUri, FilePurpose.DOCUMENT)) {
            is AppResult.Failure -> uploaded
            is AppResult.Success -> apiCaller.call {
                api.attachDocument(id, AttachDocumentBodyDto(docType, uploaded.data.id, note.clean())).data.toApplicationDocument()
            }
        }

    override suspend fun verifyDocument(documentId: String, note: String?): AppResult<Unit> =
        apiCaller.call { api.verifyDocument(documentId, VerifyDocumentBodyDto(note.clean())) }.map { }

    override suspend fun rejectDocument(documentId: String, reason: String): AppResult<Unit> =
        apiCaller.call { api.rejectDocument(documentId, RejectDocumentBodyDto(reason.trim())) }.map { }

    override suspend fun waitingList(): AppResult<List<AdmissionApplication>> =
        apiCaller.call { api.waitingList().data.map { it.toModel() }.sortedBy { it.waitlistPosition ?: Int.MAX_VALUE } }

    override suspend fun offerFromWaitingList(id: String): AppResult<Unit> =
        apiCaller.call { api.offerFromWaitingList(id) }.map { }
}
