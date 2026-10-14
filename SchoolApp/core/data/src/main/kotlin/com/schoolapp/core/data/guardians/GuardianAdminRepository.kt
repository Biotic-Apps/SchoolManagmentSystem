package com.schoolapp.core.data.guardians

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.guardians.GuardianDetail
import com.schoolapp.core.model.guardians.LoginSlipPreview
import com.schoolapp.core.model.guardians.LoginSlipTarget
import com.schoolapp.core.model.guardians.ParentCredentials
import com.schoolapp.core.model.people.ChildLinkRequest
import com.schoolapp.core.model.people.Guardian
import com.schoolapp.core.model.settings.PagedList

/**
 * Parents & Guardians admin, like the web's features/guardians: paged directory and link requests,
 * guardian detail, parent sign-in (create / reset / send), unlinking a child and bulk login slips.
 */
interface GuardianAdminRepository {
    suspend fun guardians(search: String?, page: Int): AppResult<PagedList<Guardian>>
    suspend fun linkRequests(page: Int): AppResult<PagedList<ChildLinkRequest>>
    suspend fun approveLink(requestId: String): AppResult<Unit>
    suspend fun rejectLink(requestId: String, reason: String?): AppResult<Unit>

    suspend fun detail(guardianId: String): AppResult<GuardianDetail>
    suspend fun createAccount(guardianId: String): AppResult<ParentCredentials>
    suspend fun resetPassword(guardianId: String): AppResult<ParentCredentials>

    /** Returns the channels used (EMAIL, SMS). */
    suspend fun sendSignIn(guardianId: String): AppResult<List<String>>
    suspend fun unlink(studentId: String, linkId: String, reason: String): AppResult<Unit>

    suspend fun previewLoginSlips(target: LoginSlipTarget): AppResult<LoginSlipPreview>

    /** Queues the slips PDF and waits for it; returns the signed file url. */
    suspend fun printLoginSlips(target: LoginSlipTarget): AppResult<String>
}
