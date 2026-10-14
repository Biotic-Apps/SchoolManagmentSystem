package com.schoolapp.core.data.schools

import com.schoolapp.core.model.schools.SchoolSetupInput
import com.schoolapp.core.model.schools.SetupBell
import com.schoolapp.core.model.schools.SetupClass
import com.schoolapp.core.network.schools.SchoolSetupBody
import com.schoolapp.core.network.schools.SetupAcademicsBody
import com.schoolapp.core.network.schools.SetupBellBody
import com.schoolapp.core.network.schools.SetupBranchBody
import com.schoolapp.core.network.schools.SetupClassBody
import com.schoolapp.core.network.schools.SetupFridayBody
import com.schoolapp.core.network.schools.SetupPrincipalBody
import com.schoolapp.core.network.schools.SetupSchoolBody
import com.schoolapp.core.network.schools.SetupSectionBody
import com.schoolapp.core.network.schools.SetupSubjectBody
import com.schoolapp.core.network.schools.SetupTimingsBody

internal fun SchoolSetupInput.toBody() = SchoolSetupBody(
    school = with(school) { SetupSchoolBody(code, name.trim(), phone.blank(), email.blank(), website.blank(), address.blank()) },
    branch = with(branch) {
        SetupBranchBody(
            name = name.trim(),
            code = code,
            phone = phone.blank(),
            email = email.blank(),
            address = address.blank(),
            timings = SetupTimingsBody(opensAt, closesAt, attendanceLockAt, staffArrivesAt, staffLeavesAt),
            workingDays = workingDays.sorted(),
        )
    },
    principal = with(principal) { SetupPrincipalBody(name.trim(), email.blank(), phone.blank(), password?.takeIf { it.isNotEmpty() }) },
    academics = academics?.let {
        SetupAcademicsBody(
            createSession = true,
            sessionName = it.sessionName.trim(),
            startDate = it.startDate,
            endDate = it.endDate,
            classes = it.classes.map(SetupClass::toBody),
            bellSchedule = it.bell.toBody(),
        )
    } ?: SetupAcademicsBody(createSession = false),
)

/** A subject group that no section of the class has is dropped, so the subject goes to every section. */
private fun SetupClass.toBody(): SetupClassBody {
    val groups = sections.mapNotNull { it.group?.takeIf(String::isNotBlank) }.toSet()
    return SetupClassBody(
        name = name.trim(),
        level = level,
        sections = sections.map { SetupSectionBody(it.name, it.group?.takeIf(String::isNotBlank)) },
        subjects = subjects.map { SetupSubjectBody(it.name, it.periodsPerWeek, it.group?.takeIf { group -> group in groups }) },
    )
}

private fun SetupBell.toBody() = SetupBellBody(
    startTime = startTime,
    periodMinutes = periodMinutes,
    periodsPerDay = periodsPerDay,
    breakAfter = breakAfter,
    breakMinutes = breakMinutes,
    friday = friday?.let { SetupFridayBody(it.periodMinutes, it.periodsPerDay, it.breakMinutes) },
)

private fun String?.blank(): String? = this?.trim()?.takeIf { it.isNotEmpty() }
