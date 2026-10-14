package com.schoolapp.feature.admin.schools.setup.model

import androidx.compose.runtime.Immutable

@Immutable
data class SchoolPart(
    val name: String = "",
    val code: String = "",
    /** False once the admin types their own code: the name no longer drives it. */
    val codeSuggested: Boolean = true,
    val phone: String = "",
    val email: String = "",
    val website: String = "",
    val address: String = "",
)

/** Times are "HH:mm"; [workingDays] ISO 1 (Mon) … 7 (Sun). */
@Immutable
data class BranchPart(
    val name: String = "Main Branch",
    val code: String = "MAIN",
    val phone: String = "",
    val email: String = "",
    val address: String = "",
    val opensAt: String = "08:00",
    val closesAt: String = "14:00",
    val attendanceLockAt: String = "10:00",
    val staffArrivesAt: String = "07:30",
    val staffLeavesAt: String = "14:00",
    val workingDays: List<Int> = listOf(1, 2, 3, 4, 5, 6),
)

@Immutable
data class PrincipalPart(
    val name: String = "",
    val email: String = "",
    val phone: String = "",
    val generatePassword: Boolean = true,
    val password: String = "",
)

/** [group] "" = no group. */
@Immutable
data class SectionRow(val name: String, val group: String = "")

/** [group] "" = every section of the class. */
@Immutable
data class SubjectCell(val name: String, val periodsPerWeek: Int, val group: String = "")

@Immutable
data class ClassRow(
    val id: Long,
    val include: Boolean = true,
    val name: String,
    val level: ClassLevel,
    /** Typed by the admin (not from a preset): the name stays editable. */
    val custom: Boolean = false,
    val sections: List<SectionRow>,
    val subjects: List<SubjectCell>,
)

@Immutable
data class AcademicsPart(
    val createSession: Boolean = true,
    val sessionName: String = "",
    /** False once the admin types their own name: the dates no longer drive it. */
    val sessionNameSuggested: Boolean = true,
    val startDate: String = "",
    val endDate: String = "",
    val classes: List<ClassRow> = emptyList(),
    /** Columns of the class × subject matrix: preset subjects plus any the admin added. */
    val subjectNames: List<String> = emptyList(),
)

@Immutable
data class FridayPart(val periodMinutes: Int = 35, val periodsPerDay: Int = 6, val breakMinutes: Int = 15)

@Immutable
data class BellPart(
    val startTime: String = "08:00",
    val periodMinutes: Int = 40,
    val periodsPerDay: Int = 8,
    /** 0 = no break. */
    val breakAfter: Int = 4,
    val breakMinutes: Int = 30,
    val shortFriday: Boolean = true,
    val friday: FridayPart = FridayPart(),
)

/** Everything the wizard collects; one object across the steps so Back never loses values. */
@Immutable
data class SetupForm(
    val school: SchoolPart = SchoolPart(),
    val branch: BranchPart = BranchPart(),
    val principal: PrincipalPart = PrincipalPart(),
    val academics: AcademicsPart = AcademicsPart(),
    val bell: BellPart = BellPart(),
) {
    val includedClasses: List<ClassRow> get() = academics.classes.filter { it.include }
    val fridayWorks: Boolean get() = FRIDAY in branch.workingDays

    companion object {
        const val FRIDAY = 5
    }
}
