package com.schoolapp.demo

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.notices.DefaultNoticesRepository
import com.schoolapp.core.data.notices.NoticesRepository
import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.notice.Notice
import com.schoolapp.core.model.notice.NoticeInput
import com.schoolapp.core.model.notice.NoticeStatus
import kotlinx.coroutines.flow.update
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DemoAwareNoticesRepository @Inject constructor(
    private val real: DefaultNoticesRepository,
    private val auth: DemoAwareAuthRepository,
) : NoticesRepository {

    override suspend fun notices(branchId: String?): AppResult<List<Notice>> {
        if (!auth.isDemoActive) return real.notices(branchId)
        val me = DemoActors.forRole(auth.demoSession.value?.activeRole).name
        return AppResult.Success(demoVisible().plus(DemoNoticesData.notices.value.filter { it.status != NoticeStatus.PUBLISHED && it.authorName == me }))
    }

    override suspend fun createAndPublish(input: NoticeInput): AppResult<Notice> {
        if (!auth.isDemoActive) return real.createAndPublish(input)
        val role = auth.demoSession.value?.activeRole
        val toReview = role == RoleKey.TEACHER
        val notice = Notice(
            id = "demo-nt-${System.currentTimeMillis()}",
            title = input.title,
            body = input.body,
            status = if (toReview) NoticeStatus.PENDING_REVIEW else NoticeStatus.PUBLISHED,
            pinned = input.pinned,
            publishedAt = if (toReview) null else DemoDates.isoNow(),
            expiresOn = input.expiresOn,
            authorName = DemoActors.forRole(role).name,
            audienceLabel = if (input.wholeBranch) "Whole branch" else input.sectionIds.mapNotNull(DemoActors::sectionLabel).joinToString().ifEmpty { "Selected classes" },
            isRead = true,
        )
        DemoNoticesData.notices.update { listOf(notice) + it }
        return AppResult.Success(notice)
    }

    override suspend fun markRead(id: String): AppResult<Unit> {
        if (!auth.isDemoActive) return real.markRead(id)
        DemoNoticesData.notices.update { list -> list.map { if (it.id == id) it.copy(isRead = true) else it } }
        return AppResult.Success(Unit)
    }

    internal companion object {
        /** Published notices, pinned first then newest. */
        fun demoVisible(): List<Notice> = DemoNoticesData.notices.value
            .filter { it.status == NoticeStatus.PUBLISHED }
            .sortedWith(compareByDescending<Notice> { it.pinned }.thenByDescending { it.publishedAt })
    }
}
