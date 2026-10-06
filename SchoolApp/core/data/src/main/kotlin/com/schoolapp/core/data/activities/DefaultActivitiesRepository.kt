package com.schoolapp.core.data.activities

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.common.allArraysAt
import com.schoolapp.core.data.common.arrayAt
import com.schoolapp.core.data.common.clean
import com.schoolapp.core.data.common.decodeEach
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityInput
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ConsentStatus
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.ActivitiesApi
import com.schoolapp.core.network.dto.activity.ActivityDto
import com.schoolapp.core.network.dto.activity.ConsentBodyDto
import com.schoolapp.core.network.dto.activity.ConsentDto
import com.schoolapp.core.network.dto.activity.ParticipantDto
import com.schoolapp.core.network.dto.common.CommentBodyDto
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultActivitiesRepository @Inject constructor(
    private val api: ActivitiesApi,
    private val apiCaller: ApiCaller,
    private val json: Json,
) : ActivitiesRepository {

    override suspend fun activities(branchId: String?, status: ActivityStatus?, from: String?, to: String?): AppResult<List<Activity>> =
        apiCaller.call {
            api.activities(branchId = branchId, status = status?.name, from = from, to = to).data
                .map { it.toModel() }
                .sortedBy { it.startAt }
        }

    override suspend fun forChild(studentId: String): AppResult<List<Activity>> = apiCaller.call {
        val items = api.mine(studentId).data.allArraysAt("activities", "upcoming", "consentPending", "items")
        json.decodeEach(items, ActivityDto.serializer())
            .distinctBy { it.id }
            .map { it.toModel(forStudentId = studentId) }
            .sortedBy { it.startAt }
    }

    override suspend fun activity(id: String): AppResult<Activity> = apiCaller.call { api.activity(id).data.toModel() }

    override suspend fun propose(input: ActivityInput): AppResult<Activity> =
        apiCaller.call { api.propose(input.toBody()).data.toModel() }

    override suspend fun approve(id: String, comment: String?): AppResult<Activity> =
        apiCaller.call { api.approve(id, CommentBodyDto(comment.clean())).data.toModel() }

    override suspend fun reject(id: String, comment: String?): AppResult<Activity> =
        apiCaller.call { api.reject(id, CommentBodyDto(comment.clean())).data.toModel() }

    override suspend fun consents(id: String): AppResult<List<ActivityConsent>> = apiCaller.call {
        json.decodeEach(api.consents(id).data.arrayAt("consents", "items", "students"), ConsentDto.serializer())
            .mapNotNull { it.toModel() }
            .sortedBy { it.studentName }
    }

    override suspend fun decideConsent(id: String, studentId: String, decision: ConsentStatus, note: String?): AppResult<Unit> {
        if (decision == ConsentStatus.PENDING) return AppResult.Failure(AppError.Validation("Choose GRANTED or DECLINED"))
        return apiCaller.call { api.decideConsent(id, ConsentBodyDto(studentId, decision.name, note.clean())) }
    }

    override suspend fun participants(id: String): AppResult<List<ActivityParticipant>> = apiCaller.call {
        json.decodeEach(api.participants(id).data.arrayAt("participants", "items"), ParticipantDto.serializer())
            .mapNotNull { it.toModel() }
            .sortedWith(compareBy(nullsLast()) { it.position })
    }
}
