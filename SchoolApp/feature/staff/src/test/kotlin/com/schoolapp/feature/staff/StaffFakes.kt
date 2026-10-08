package com.schoolapp.feature.staff

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.organisation.ClassesOverviewRepository
import com.schoolapp.core.data.organisation.OrganisationRepository
import com.schoolapp.core.data.staff.AllocationRepository
import com.schoolapp.core.data.staff.StaffAdminRepository
import com.schoolapp.core.data.staff.StaffRepository
import com.schoolapp.core.model.organisation.AcademicSession
import com.schoolapp.core.model.organisation.Branch
import com.schoolapp.core.model.organisation.BranchOverview
import com.schoolapp.core.model.organisation.CalendarEvent
import com.schoolapp.core.model.organisation.ClassOverview
import com.schoolapp.core.model.organisation.SchoolClass
import com.schoolapp.core.model.organisation.Section
import com.schoolapp.core.model.organisation.SectionOverview
import com.schoolapp.core.model.organisation.Subject
import com.schoolapp.core.model.staff.ClassAllocation
import com.schoolapp.core.model.staff.CreatedStaff
import com.schoolapp.core.model.staff.NewStaffInput
import com.schoolapp.core.model.staff.StaffDetail
import com.schoolapp.core.model.staff.StaffLogin
import com.schoolapp.core.model.staff.StaffProfileInput
import com.schoolapp.core.model.staff.StaffStatusChange
import com.schoolapp.core.model.staff.StaffSummary
import com.schoolapp.core.model.staff.StaffWorkload

fun summary(id: String = "st1", name: String = "Ayesha Khan", userId: String? = "u9", status: String = "ACTIVE") =
    StaffSummary(id, name, null, null, "TEACHER", "Main Branch", status, listOf("TEACHER"), false, null, 0, 0, userId, "b1")

fun detail(summary: StaffSummary = summary()) = StaffDetail(summary, "ayesha@school.pk", null, null, "2026-10-01", emptyList())

class FakeStaffRepository(var member: StaffDetail = detail()) : StaffRepository {
    var listCalls = 0
    override suspend fun staff(search: String?): AppResult<List<StaffSummary>> {
        listCalls++
        return AppResult.Success(listOf(member.summary))
    }
    override suspend fun staffMember(id: String): AppResult<StaffDetail> = AppResult.Success(member)
    override suspend fun workload(id: String): AppResult<StaffWorkload> = AppResult.Success(StaffWorkload(0, 0, 0))
}

class FakeStaffAdminRepository : StaffAdminRepository {
    val created = mutableListOf<NewStaffInput>()
    val updates = mutableListOf<Pair<String, StaffProfileInput>>()
    val statusChanges = mutableListOf<StaffStatusChange>()
    var failWith: AppError? = null
    var temporaryPassword: String? = "Tmp-7Kx9-pQ2"
    var onStatus: (String) -> Unit = {}

    override suspend fun create(input: NewStaffInput): AppResult<CreatedStaff> {
        created += input
        failWith?.let { return AppResult.Failure(it) }
        return AppResult.Success(CreatedStaff(detail(summary(name = input.profile.name)), temporaryPassword))
    }

    override suspend fun update(id: String, input: StaffProfileInput): AppResult<StaffDetail> {
        updates += id to input
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(detail())
    }

    override suspend fun setStatus(id: String, change: StaffStatusChange): AppResult<StaffDetail> {
        statusChanges += change
        onStatus(change.status)
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(detail(summary(status = change.status)))
    }

    val accountCalls = mutableListOf<Triple<String?, String?, String?>>()
    var resetCalls = 0

    override suspend fun createAccount(id: String, email: String?, phone: String?, roleKey: String?): AppResult<StaffLogin> {
        accountCalls += Triple(email, phone, roleKey)
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(StaffLogin("u9", email, phone, temporaryPassword))
    }

    override suspend fun resetPassword(id: String): AppResult<StaffLogin> {
        resetCalls++
        return failWith?.let { AppResult.Failure(it) } ?: AppResult.Success(StaffLogin("u9", null, null, "New-Pass-123"))
    }
}

class FakeAllocationRepository(private val allocation: ClassAllocation) : AllocationRepository {
    val classTeacherCalls = mutableListOf<Pair<String, String>>()
    val subjectCalls = mutableListOf<Triple<String, String, String>>()
    var failSectionIds: Set<String> = emptySet()

    override suspend fun classAllocation(classId: String, branchId: String): AppResult<ClassAllocation> = AppResult.Success(allocation)

    override suspend fun setClassTeacher(sectionId: String, staffId: String): AppResult<Unit> {
        classTeacherCalls += sectionId to staffId
        return result(sectionId)
    }

    override suspend fun setSubjectTeacher(sectionId: String, subjectId: String, staffId: String): AppResult<Unit> {
        subjectCalls += Triple(sectionId, subjectId, staffId)
        return result(sectionId)
    }

    private fun result(sectionId: String): AppResult<Unit> = if (sectionId in failSectionIds) {
        AppResult.Failure(AppError.Server(409, "STAFF_LEFT", "Staff member has left"))
    } else {
        AppResult.Success(Unit)
    }
}

class FakeClassesOverviewRepository : ClassesOverviewRepository {
    override suspend fun overview(branchId: String, schoolId: String?, sessionId: String?): AppResult<List<ClassOverview>> =
        AppResult.Success(
            listOf(
                ClassOverview(
                    "c1", "Class 1", 1, "ACTIVE", 0, null,
                    listOf(SectionOverview("secA", "A", null, 0, null, null, null, null)),
                    emptyList(), issues = emptyList(), unallocated = 0,
                ),
            ),
        )
}

class FakeOrganisationRepository(private val branches: List<Branch> = emptyList()) : OrganisationRepository {
    override suspend fun branches(): AppResult<List<Branch>> = AppResult.Success(branches)
    override suspend fun branchOverview(branchId: String): AppResult<BranchOverview> = AppResult.Failure(AppError.Network)
    override suspend fun sessions(branchId: String): AppResult<List<AcademicSession>> = AppResult.Success(emptyList())
    override suspend fun calendar(branchId: String, from: String?, to: String?): AppResult<List<CalendarEvent>> = AppResult.Success(emptyList())
    override suspend fun classes(schoolId: String?): AppResult<List<SchoolClass>> = AppResult.Success(emptyList())
    override suspend fun sections(branchId: String, sessionId: String?): AppResult<List<Section>> = AppResult.Success(emptyList())
    override suspend fun subjects(schoolId: String?): AppResult<List<Subject>> = AppResult.Success(emptyList())
}
