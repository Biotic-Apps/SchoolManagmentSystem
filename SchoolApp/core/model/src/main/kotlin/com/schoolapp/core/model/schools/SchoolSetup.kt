package com.schoolapp.core.model.schools

/** `POST /schools/setup` input built by the setup wizard; blank optional fields are null. */
data class SchoolSetupInput(
    val school: SetupSchool,
    val branch: SetupBranch,
    val principal: SetupPrincipal,
    val academics: SetupAcademics?,
)

data class SetupSchool(val code: String, val name: String, val phone: String?, val email: String?, val website: String?, val address: String?)

/** Times are 24-hour "HH:mm"; [workingDays] are ISO weekdays 1 (Mon) … 7 (Sun). */
data class SetupBranch(
    val name: String,
    val code: String,
    val phone: String?,
    val email: String?,
    val address: String?,
    val opensAt: String,
    val closesAt: String,
    val attendanceLockAt: String,
    val staffArrivesAt: String,
    val staffLeavesAt: String,
    val workingDays: List<Int>,
)

/** [password] null: the server generates a temporary one and returns it once. */
data class SetupPrincipal(val name: String, val email: String?, val phone: String?, val password: String?)

/** Only sent when the academic year is set up now (otherwise `createSession: false`). */
data class SetupAcademics(
    val sessionName: String,
    val startDate: String,
    val endDate: String,
    val classes: List<SetupClass>,
    val bell: SetupBell,
)

data class SetupClass(val name: String, val level: String, val sections: List<SetupSection>, val subjects: List<SetupSubject>)

data class SetupSection(val name: String, val group: String?)

data class SetupSubject(val name: String, val periodsPerWeek: Int, val group: String?)

/** [friday] null: Friday runs like every other day. */
data class SetupBell(
    val startTime: String,
    val periodMinutes: Int,
    val periodsPerDay: Int,
    val breakAfter: Int,
    val breakMinutes: Int,
    val friday: SetupFriday?,
)

data class SetupFriday(val periodMinutes: Int, val periodsPerDay: Int, val breakMinutes: Int)

/** What the server created; [temporaryPassword] is shown once. */
data class SchoolSetupResult(
    val schoolId: String,
    val schoolName: String,
    val branchId: String,
    val branchName: String,
    val principalName: String,
    val principalEmail: String?,
    val principalPhone: String?,
    val temporaryPassword: String?,
    val sessionName: String?,
    val classes: Int,
    val sections: Int,
    val subjects: Int,
)
