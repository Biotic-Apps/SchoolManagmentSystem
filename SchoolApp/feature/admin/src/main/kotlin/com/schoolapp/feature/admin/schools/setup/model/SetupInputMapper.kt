package com.schoolapp.feature.admin.schools.setup.model

import com.schoolapp.core.model.schools.SchoolSetupInput
import com.schoolapp.core.model.schools.SetupAcademics
import com.schoolapp.core.model.schools.SetupBell
import com.schoolapp.core.model.schools.SetupBranch
import com.schoolapp.core.model.schools.SetupClass
import com.schoolapp.core.model.schools.SetupFriday
import com.schoolapp.core.model.schools.SetupPrincipal
import com.schoolapp.core.model.schools.SetupSchool
import com.schoolapp.core.model.schools.SetupSection
import com.schoolapp.core.model.schools.SetupSubject

/** Web to-setup-input.ts: only ticked classes; the Friday variant only when Friday is a working day. */
internal fun SetupForm.toInput(): SchoolSetupInput = SchoolSetupInput(
    school = with(school) { SetupSchool(code.trim().uppercase(), name.trim(), phone, email, website, address) },
    branch = with(branch) {
        SetupBranch(
            name = name.trim(),
            code = code.trim().uppercase(),
            phone = phone,
            email = email,
            address = address,
            opensAt = opensAt,
            closesAt = closesAt,
            attendanceLockAt = attendanceLockAt,
            staffArrivesAt = staffArrivesAt,
            staffLeavesAt = staffLeavesAt,
            workingDays = workingDays,
        )
    },
    principal = with(principal) { SetupPrincipal(name.trim(), email, phone, password.takeUnless { generatePassword }) },
    academics = academics.takeIf { it.createSession }?.let {
        SetupAcademics(
            sessionName = it.sessionName.trim(),
            startDate = it.startDate,
            endDate = it.endDate,
            classes = includedClasses.map { row ->
                SetupClass(
                    name = row.name.trim(),
                    level = row.level.name,
                    sections = row.sections.map { s -> SetupSection(s.name, s.group.ifBlank { null }) },
                    subjects = row.subjects.map { s -> SetupSubject(s.name, s.periodsPerWeek, s.group.ifBlank { null }) },
                )
            },
            bell = with(bell) {
                SetupBell(
                    startTime = startTime,
                    periodMinutes = periodMinutes,
                    periodsPerDay = periodsPerDay,
                    breakAfter = breakAfter,
                    breakMinutes = breakMinutes,
                    friday = friday.takeIf { shortFriday && fridayWorks }?.let { f -> SetupFriday(f.periodMinutes, f.periodsPerDay, f.breakMinutes) },
                )
            },
        )
    },
)
