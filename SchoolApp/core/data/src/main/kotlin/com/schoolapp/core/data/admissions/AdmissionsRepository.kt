package com.schoolapp.core.data.admissions

import com.schoolapp.core.common.result.AppResult
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
import com.schoolapp.core.model.people.ApplicationInput

/** The full admissions workflow, same as the web panel: enquiries, applications, tests, decisions, confirmation. */
interface AdmissionsRepository {
    suspend fun applications(): AppResult<List<AdmissionApplication>>
    suspend fun application(id: String): AppResult<AdmissionApplication>
    suspend fun decide(id: String, decision: AdmissionDecision, reason: String?): AppResult<Unit>

    suspend fun enquiries(branchId: String?): AppResult<List<Enquiry>>
    suspend fun createEnquiry(input: EnquiryInput): AppResult<Enquiry>
    suspend fun updateEnquiry(id: String, update: EnquiryUpdate): AppResult<Enquiry>

    /** Returns the new application id; [dob] only when the enquiry has none. */
    suspend fun convertEnquiry(id: String, gender: String, dob: String?): AppResult<String>

    /** Returns the new application id. */
    suspend fun createApplication(input: ApplicationInput, medical: MedicalInfo?): AppResult<String>
    suspend fun updateApplication(id: String, form: ApplicationFormInput): AppResult<AdmissionApplication>
    suspend fun scheduleTest(id: String, schedule: TestSchedule): AppResult<AdmissionApplication>
    suspend fun recordTestResult(id: String, result: TestResult): AppResult<AdmissionApplication>
    suspend fun withdraw(id: String, reason: String): AppResult<AdmissionApplication>
    suspend fun confirm(id: String, input: ConfirmAdmissionInput): AppResult<ConfirmedAdmission>

    /** Uploads the picked file (purpose DOCUMENT) and attaches it to the application. */
    suspend fun attachDocument(id: String, docType: String, fileUri: String, note: String?): AppResult<ApplicationDocument>
    suspend fun verifyDocument(documentId: String, note: String?): AppResult<Unit>
    suspend fun rejectDocument(documentId: String, reason: String): AppResult<Unit>

    /** WAITLISTED applications in queue order. */
    suspend fun waitingList(): AppResult<List<AdmissionApplication>>
    suspend fun offerFromWaitingList(id: String): AppResult<Unit>
}
