package com.schoolapp.core.data.people

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.people.ChildLinkChallenge
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.ContactChange
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.people.GuardianRelation

interface GuardiansRepository {
    suspend fun guardians(search: String?): AppResult<List<Guardian>>
    suspend fun pendingChildLinks(): AppResult<List<ChildLinkRequest>>

    /** Parent: starts linking a child; the OTP goes to the phone on the school record. */
    suspend fun startChildLink(admissionNo: String, dob: String, relation: GuardianRelation): AppResult<ChildLinkChallenge>
    suspend fun confirmChildLink(requestId: String, code: String): AppResult<Unit>

    /** Parent: sends a contact change for approval. */
    suspend fun requestContactChange(change: ContactChange): AppResult<Unit>
}
