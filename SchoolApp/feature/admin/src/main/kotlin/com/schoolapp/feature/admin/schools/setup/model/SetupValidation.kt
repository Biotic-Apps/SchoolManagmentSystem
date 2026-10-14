package com.schoolapp.feature.admin.schools.setup.model

import com.schoolapp.feature.admin.R
import com.schoolapp.feature.admin.common.AdminFormRules
import com.schoolapp.feature.admin.common.FieldProblem
import com.schoolapp.feature.admin.schools.setup.model.SetupKeys as K

/** Web school-setup/schemas.ts + branches/timing-rules.ts, per step. */
internal object SetupValidation {
    private const val CLASS_NAME_MAX = 40
    private const val SESSION_NAME_MAX = 30
    private const val PRINCIPAL_NAME_MAX = 100

    fun step(step: SetupStep, form: SetupForm): Map<String, SetupError> = when (step) {
        SetupStep.SCHOOL -> school(form.school)
        SetupStep.BRANCH -> branch(form.branch)
        SetupStep.PEOPLE -> principal(form.principal) + session(form.academics)
        SetupStep.CLASSES -> classes(form.academics)
        SetupStep.BELL -> bell(form.bell)
        SetupStep.REVIEW -> emptyMap()
    }

    fun all(form: SetupForm): Map<String, SetupError> = SetupStep.entries.fold(emptyMap()) { acc, step -> acc + step(step, form) }

    private fun school(s: SchoolPart) = buildMap<String, SetupError> {
        problem(K.SCHOOL_NAME, AdminFormRules.name(s.name))
        problem(K.SCHOOL_CODE, AdminFormRules.code(s.code))
        problem(K.SCHOOL_PHONE, AdminFormRules.phone(s.phone))
        problem(K.SCHOOL_EMAIL, AdminFormRules.email(s.email))
        problem(K.SCHOOL_WEBSITE, AdminFormRules.url(s.website))
    }

    private fun branch(b: BranchPart) = buildMap<String, SetupError> {
        problem(K.BRANCH_NAME, AdminFormRules.name(b.name))
        problem(K.BRANCH_CODE, AdminFormRules.code(b.code))
        problem(K.BRANCH_PHONE, AdminFormRules.phone(b.phone))
        problem(K.BRANCH_EMAIL, AdminFormRules.email(b.email))
        if (b.closesAt <= b.opensAt) local(K.CLOSES_AT, R.string.setup_error_closes)
        if (b.attendanceLockAt < b.opensAt || b.attendanceLockAt > b.closesAt) local(K.LOCK_AT, R.string.setup_error_lock)
        if (b.staffArrivesAt > b.opensAt) local(K.STAFF_ARRIVES, R.string.setup_error_staff_arrives)
        if (b.staffLeavesAt < b.closesAt) local(K.STAFF_LEAVES, R.string.setup_error_staff_leaves)
        if (b.workingDays.isEmpty()) local(K.WORKING_DAYS, R.string.setup_error_working_days)
    }

    private fun principal(p: PrincipalPart) = buildMap<String, SetupError> {
        problem(K.PRINCIPAL_NAME, AdminFormRules.name(p.name, max = PRINCIPAL_NAME_MAX))
        problem(K.PRINCIPAL_EMAIL, AdminFormRules.email(p.email))
        problem(K.PRINCIPAL_PHONE, AdminFormRules.phone(p.phone))
        if (K.PRINCIPAL_EMAIL !in this && !AdminFormRules.hasContact(p.email, p.phone)) local(K.PRINCIPAL_EMAIL, R.string.setup_error_principal_contact)
        if (!p.generatePassword) problem(K.PRINCIPAL_PASSWORD, AdminFormRules.password(p.password, optional = false))
    }

    private fun session(a: AcademicsPart) = buildMap<String, SetupError> {
        if (!a.createSession) return@buildMap
        if (!a.startDate.isIsoDate()) local(K.START_DATE, R.string.setup_error_start_date)
        when {
            !a.endDate.isIsoDate() -> local(K.END_DATE, R.string.setup_error_end_date)
            a.endDate <= a.startDate -> local(K.END_DATE, R.string.setup_error_end_after_start)
        }
        val name = a.sessionName.trim()
        when {
            name.length < 2 -> local(K.SESSION_NAME, R.string.setup_error_session_name)
            name.length > SESSION_NAME_MAX -> local(K.SESSION_NAME, R.string.setup_error_session_name_long)
        }
    }

    private fun classes(a: AcademicsPart) = buildMap<String, SetupError> {
        if (!a.createSession) return@buildMap
        if (a.classes.none { it.include }) local(K.CLASSES, R.string.setup_error_no_classes)
        val seen = mutableSetOf<String>()
        a.classes.forEachIndexed { index, row ->
            if (!row.include) return@forEachIndexed
            val name = row.name.trim()
            when {
                name.isEmpty() || name.length > CLASS_NAME_MAX -> local(K.classRow(index), R.string.setup_error_class_name)
                !seen.add(name.lowercase()) -> local(K.classRow(index), R.string.setup_error_class_duplicate)
                row.sections.isEmpty() -> local(K.classRow(index), R.string.setup_error_class_sections)
            }
        }
    }

    private fun bell(b: BellPart) = buildMap<String, SetupError> {
        if (b.breakAfter >= b.periodsPerDay) local(K.BREAK_AFTER, R.string.setup_error_break_after)
    }

    private fun MutableMap<String, SetupError>.local(key: String, res: Int) = put(key, SetupError.Local(res))

    private fun MutableMap<String, SetupError>.problem(key: String, problem: FieldProblem?) {
        if (problem != null) put(key, SetupError.Local(problemRes(problem)))
    }

    private fun problemRes(problem: FieldProblem): Int = when (problem) {
        FieldProblem.REQUIRED -> R.string.admin_error_required
        FieldProblem.TOO_SHORT -> R.string.admin_error_too_short
        FieldProblem.TOO_LONG -> R.string.admin_error_too_long
        FieldProblem.INVALID_CODE -> R.string.admin_error_code
        FieldProblem.INVALID_EMAIL -> R.string.admin_error_email
        FieldProblem.INVALID_PHONE -> R.string.admin_error_phone
        FieldProblem.INVALID_URL -> R.string.admin_error_url
        FieldProblem.CONTACT_REQUIRED -> R.string.admin_error_contact
        FieldProblem.WEAK_PASSWORD -> R.string.admin_error_password
    }

    private fun String.isIsoDate() = matches(Regex("""\d{4}-\d{2}-\d{2}"""))
}
