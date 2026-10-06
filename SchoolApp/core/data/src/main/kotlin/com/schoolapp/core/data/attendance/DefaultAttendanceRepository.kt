package com.schoolapp.core.data.attendance

import com.schoolapp.core.common.dispatcher.IoDispatcher
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.database.attendance.AttendanceRegisterDao
import com.schoolapp.core.database.attendance.AttendanceRegisterEntity
import com.schoolapp.core.database.outbox.OutboxDao
import com.schoolapp.core.database.outbox.OutboxEntity
import com.schoolapp.core.database.outbox.OutboxStatus
import com.schoolapp.core.model.attendance.AttendanceStatus
import com.schoolapp.core.model.attendance.EntryMark
import com.schoolapp.core.model.attendance.LoadedRegister
import com.schoolapp.core.model.attendance.MyStaffAttendance
import com.schoolapp.core.model.attendance.RegisterOutcome
import com.schoolapp.core.model.attendance.RegisterSyncState
import com.schoolapp.core.model.attendance.SectionAttendance
import com.schoolapp.core.model.attendance.StudentAttendance
import com.schoolapp.core.model.attendance.UnmarkedSection
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.api.AttendanceApi
import com.schoolapp.core.network.dto.attendance.CorrectionBodyDto
import com.schoolapp.core.network.dto.attendance.EntryInputDto
import com.schoolapp.core.network.dto.attendance.RegisterBodyDto
import com.schoolapp.core.network.dto.attendance.RegisterDto
import com.schoolapp.core.network.model.ApiErrorCodes
import com.schoolapp.core.sync.SyncScheduler
import kotlinx.coroutines.CoroutineDispatcher
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.distinctUntilChanged
import kotlinx.coroutines.flow.flowOn
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext
import kotlinx.serialization.builtins.ListSerializer
import kotlinx.serialization.json.Json
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class DefaultAttendanceRepository @Inject constructor(
    private val api: AttendanceApi,
    private val apiCaller: ApiCaller,
    private val registerDao: AttendanceRegisterDao,
    private val outboxDao: OutboxDao,
    private val syncScheduler: SyncScheduler,
    private val json: Json,
    @IoDispatcher private val io: CoroutineDispatcher,
) : AttendanceRepository {

    private val marksSerializer = ListSerializer(EntryInputDto.serializer())

    override suspend fun register(sectionId: String, date: String): AppResult<LoadedRegister> =
        when (val result = apiCaller.call { api.register(sectionId, date).data }) {
            is AppResult.Success -> {
                val server = result.data
                val marks = cacheServer(sectionId, date, server, keepLocal = !server.toModel().status.isFinal)
                AppResult.Success(LoadedRegister(server.toModel(), marks))
            }
            is AppResult.Failure -> if (result.error == AppError.Network) {
                loadCached(sectionId, date)?.let { AppResult.Success(it) } ?: result
            } else {
                result
            }
        }

    override suspend fun saveDraft(
        sectionId: String,
        date: String,
        marks: List<EntryMark>,
        clientRequestId: String,
    ): AppResult<RegisterOutcome> = mutate(Mutation.DRAFT, sectionId, date, marks, clientRequestId)

    override suspend fun submit(
        sectionId: String,
        date: String,
        marks: List<EntryMark>,
        clientRequestId: String,
    ): AppResult<RegisterOutcome> = mutate(Mutation.SUBMIT, sectionId, date, marks, clientRequestId)

    override fun syncState(sectionId: String, date: String): Flow<RegisterSyncState> =
        outboxDao.observeByEntityKey(registerKey(sectionId, date))
            .map { rows ->
                when {
                    rows.any { it.status == OutboxStatus.NEEDS_ATTENTION } -> RegisterSyncState.NEEDS_ATTENTION
                    rows.isNotEmpty() -> RegisterSyncState.QUEUED
                    else -> RegisterSyncState.NONE
                }
            }
            .distinctUntilChanged()
            .flowOn(io)

    override suspend fun discardLocal(sectionId: String, date: String) = withContext(io) {
        registerDao.clearLocal(sectionId, date)
        outboxDao.deleteByEntityKey(registerKey(sectionId, date))
    }

    override suspend fun requestCorrection(entryId: String, newStatus: AttendanceStatus, reason: String): AppResult<Unit> =
        apiCaller.call { api.requestCorrection(CorrectionBodyDto(entryId, newStatus.name, reason.trim())) }

    override suspend fun studentHistory(studentId: String, from: String?, to: String?): AppResult<StudentAttendance> =
        apiCaller.call { api.studentHistory(studentId, from, to).data.toModel() }

    override suspend fun branchSummary(branchId: String?, date: String): AppResult<List<SectionAttendance>> =
        apiCaller.call {
            api.summary(branchId, date).data.map { it.toModel() }
                .sortedWith(compareBy({ it.className }, { it.sectionName }))
        }

    override suspend fun unmarked(branchId: String?, date: String): AppResult<List<UnmarkedSection>> =
        apiCaller.call {
            api.unmarked(branchId, date).data.map { it.toModel() }
                .sortedWith(compareBy({ it.className }, { it.sectionName }))
        }

    override suspend fun myStaffAttendance(from: String?, to: String?): AppResult<MyStaffAttendance> =
        apiCaller.call { api.myStaffAttendance(from, to).data.toMyStaffAttendance(json) }

    private suspend fun mutate(
        mutation: Mutation,
        sectionId: String,
        date: String,
        marks: List<EntryMark>,
        clientRequestId: String,
    ): AppResult<RegisterOutcome> {
        val body = RegisterBodyDto(sectionId, date, marks.map { it.toDto() }, clientRequestId)
        withContext(io) { persistLocal(sectionId, date, body.entries) }
        val result = apiCaller.call {
            when (mutation) {
                Mutation.DRAFT -> api.saveDraft(body, clientRequestId).data
                Mutation.SUBMIT -> api.submit(body, clientRequestId).data
            }
        }
        return when (result) {
            is AppResult.Success -> {
                val (outcome, register) = result.data.toRegisterResult(json)
                withContext(io) {
                    if (register != null) cacheServer(sectionId, date, register, keepLocal = false)
                    else registerDao.clearLocal(sectionId, date)
                }
                AppResult.Success(outcome)
            }
            is AppResult.Failure -> failureOutcome(mutation, sectionId, date, body, result)
        }
    }

    private suspend fun failureOutcome(
        mutation: Mutation,
        sectionId: String,
        date: String,
        body: RegisterBodyDto,
        failure: AppResult.Failure,
    ): AppResult<RegisterOutcome> {
        val error = failure.error
        return when {
            error == AppError.Network -> {
                enqueue(mutation, sectionId, date, body)
                AppResult.Success(RegisterOutcome.Queued)
            }
            error is AppError.Server && error.httpCode == HTTP_CONFLICT &&
                (mutation == Mutation.SUBMIT || error.code == ApiErrorCodes.ALREADY_SUBMITTED) ->
                AppResult.Success(RegisterOutcome.AlreadySubmitted(refetch(sectionId, date)))
            error is AppError.Server && error.httpCode == HTTP_LOCKED -> AppResult.Success(RegisterOutcome.Locked)
            else -> failure
        }
    }

    /** Current server register after a conflict; local marks stay so the user can compare. */
    private suspend fun refetch(sectionId: String, date: String) =
        when (val current = apiCaller.call { api.register(sectionId, date).data }) {
            is AppResult.Success -> {
                cacheServer(sectionId, date, current.data, keepLocal = true)
                current.data.toModel()
            }
            is AppResult.Failure -> null
        }

    private suspend fun enqueue(mutation: Mutation, sectionId: String, date: String, body: RegisterBodyDto) {
        withContext(io) {
            outboxDao.insert(
                OutboxEntity(
                    type = mutation.outboxType,
                    method = mutation.method,
                    path = mutation.path,
                    payloadJson = json.encodeToString(RegisterBodyDto.serializer(), body),
                    clientRequestId = body.clientRequestId.orEmpty(),
                    createdAt = System.currentTimeMillis(),
                    entityKey = registerKey(sectionId, date),
                ),
            )
        }
        syncScheduler.requestSync()
    }

    /** Stores the server copy; returns the local marks that were kept (only when [keepLocal]). */
    private suspend fun cacheServer(sectionId: String, date: String, server: RegisterDto, keepLocal: Boolean): List<EntryMark>? =
        withContext(io) {
            val kept = if (keepLocal) registerDao.get(sectionId, date)?.localMarksJson else null
            registerDao.upsert(
                AttendanceRegisterEntity(
                    sectionId = sectionId,
                    date = date,
                    registerJson = json.encodeToString(RegisterDto.serializer(), server),
                    localMarksJson = kept,
                    updatedAt = System.currentTimeMillis(),
                ),
            )
            kept?.let(::decodeMarks)
        }

    private suspend fun persistLocal(sectionId: String, date: String, entries: List<EntryInputDto>) {
        val registerJson = registerDao.get(sectionId, date)?.registerJson
            ?: json.encodeToString(RegisterDto.serializer(), seedRegister(sectionId, date))
        registerDao.upsert(
            AttendanceRegisterEntity(
                sectionId = sectionId,
                date = date,
                registerJson = registerJson,
                localMarksJson = json.encodeToString(marksSerializer, entries),
                updatedAt = System.currentTimeMillis(),
            ),
        )
    }

    private suspend fun loadCached(sectionId: String, date: String): LoadedRegister? = withContext(io) {
        val row = registerDao.get(sectionId, date)
        val register = row?.let { decodeRegister(it.registerJson) }
            ?: registerDao.latestForSection(sectionId)?.let { decodeRegister(it.registerJson) }?.asUnmarked(sectionId, date)
            ?: return@withContext null
        LoadedRegister(register.toModel(), row?.localMarksJson?.let(::decodeMarks), offline = true)
    }

    private suspend fun seedRegister(sectionId: String, date: String): RegisterDto =
        registerDao.latestForSection(sectionId)?.let { decodeRegister(it.registerJson) }?.asUnmarked(sectionId, date)
            ?: RegisterDto(sectionId = sectionId, date = date)

    private fun decodeRegister(raw: String): RegisterDto? =
        runCatching { json.decodeFromString(RegisterDto.serializer(), raw) }.getOrNull()

    private fun decodeMarks(raw: String): List<EntryMark>? =
        runCatching { json.decodeFromString(marksSerializer, raw).mapNotNull { it.toMark() } }.getOrNull()

    private enum class Mutation(val outboxType: String, val method: String, val path: String) {
        DRAFT(OUTBOX_DRAFT, "PUT", "attendance/registers"),
        SUBMIT(OUTBOX_SUBMIT, "POST", "attendance/registers/submit"),
    }

    internal companion object {
        const val OUTBOX_DRAFT = "ATTENDANCE_DRAFT"
        const val OUTBOX_SUBMIT = "ATTENDANCE_SUBMIT"
        private const val HTTP_CONFLICT = 409
        private const val HTTP_LOCKED = 423

        /** Outbox `entity_key` of one register. */
        fun registerKey(sectionId: String, date: String) = "attendance|$sectionId|$date"
    }
}
