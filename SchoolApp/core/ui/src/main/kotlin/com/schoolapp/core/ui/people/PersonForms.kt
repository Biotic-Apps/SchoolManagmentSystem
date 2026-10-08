package com.schoolapp.core.ui.people

import androidx.compose.runtime.Immutable
import com.schoolapp.core.model.people.ChildInput
import com.schoolapp.core.model.people.GuardianEntry
import com.schoolapp.core.model.people.GuardianInput
import com.schoolapp.core.model.people.PersonProblem
import com.schoolapp.core.model.people.PersonRules

/** Typed text of the child fields shared by Add student and New application. */
@Immutable
data class ChildForm(
    val firstName: String = "",
    val lastName: String = "",
    val dob: String = "",
    val gender: String = "",
    val bForm: String = "",
    val previousSchool: String = "",
    val address: String = "",
) {
    /** Problems keyed by the API field path ("child.firstName"), so server errors land on the same field. */
    fun problems(today: String, prefix: String = "child."): Map<String, PersonProblem> = buildMap {
        PersonRules.requiredName(firstName)?.let { put(prefix + "firstName", it) }
        PersonRules.requiredName(lastName)?.let { put(prefix + "lastName", it) }
        PersonRules.date(dob, today)?.let { put(prefix + "dob", it) }
        if (gender.isBlank()) put(prefix + "gender", PersonProblem.REQUIRED)
        PersonRules.idNumber(bForm)?.let { put(prefix + "bForm", it) }
        PersonRules.optionalText(previousSchool, PREVIOUS_SCHOOL_MAX)?.let { put(prefix + "previousSchool", it) }
        PersonRules.optionalText(address, PersonRules.ADDRESS_MAX)?.let { put(prefix + "address", it) }
    }

    fun toInput() = ChildInput(firstName, lastName, dob, gender, bForm.ifBlank { null }, previousSchool.ifBlank { null }, address.ifBlank { null })

    private companion object {
        const val PREVIOUS_SCHOOL_MAX = 120
    }
}

/** One guardian row; [relation] is a GuardianRelation name. */
@Immutable
data class GuardianForm(
    val name: String = "",
    val relation: String = "",
    val phone: String = "",
    val cnic: String = "",
    val email: String = "",
    val occupation: String = "",
    val address: String = "",
    val isPrimary: Boolean = false,
) {
    fun problems(prefix: String): Map<String, PersonProblem> = buildMap {
        PersonRules.requiredName(name, PersonRules.GUARDIAN_NAME_MAX, min = 2)?.let { put(prefix + "name", it) }
        if (relation.isBlank()) put(prefix + "relation", PersonProblem.REQUIRED)
        PersonRules.phone(phone)?.let { put(prefix + "phone", it) }
        PersonRules.idNumber(cnic)?.let { put(prefix + "cnic", it) }
        PersonRules.email(email)?.let { put(prefix + "email", it) }
        PersonRules.optionalText(occupation, OCCUPATION_MAX)?.let { put(prefix + "occupation", it) }
        PersonRules.optionalText(address, PersonRules.ADDRESS_MAX)?.let { put(prefix + "address", it) }
    }

    fun toInput() = GuardianInput(
        name, relation, phone, cnic.ifBlank { null }, email.ifBlank { null }, occupation.ifBlank { null }, address.ifBlank { null },
    )

    companion object {
        const val OCCUPATION_MAX = 80

        fun from(guardian: com.schoolapp.core.model.people.Guardian) = GuardianForm(
            name = guardian.name,
            relation = guardian.relation.orEmpty(),
            phone = guardian.phone.orEmpty(),
            email = guardian.email.orEmpty(),
            occupation = guardian.occupation.orEmpty(),
            address = guardian.address.orEmpty(),
        )
    }
}

/** Every guardian row's problems ("guardians.0.phone"), plus the two list rules the API enforces. */
fun List<GuardianForm>.problems(): Map<String, PersonProblem> = buildMap {
    this@problems.forEachIndexed { index, row -> putAll(row.problems("guardians.$index.")) }
    this@problems.forEachIndexed { index, row ->
        val earlier = this@problems.take(index).any { it.phone.isNotBlank() && PersonRules.samePhone(it.phone, row.phone) }
        if (row.phone.isNotBlank() && earlier) put("guardians.$index.phone", PersonProblem.DUPLICATE_PHONE)
    }
}

fun List<GuardianForm>.toEntries(): List<GuardianEntry> = map { GuardianEntry(it.toInput(), it.isPrimary) }

/** Marks row [index] primary and every other row not. */
fun List<GuardianForm>.withPrimary(index: Int): List<GuardianForm> = mapIndexed { i, row -> row.copy(isPrimary = i == index) }

/** Removes a row; the first remaining row becomes primary if the primary one went. */
fun List<GuardianForm>.without(index: Int): List<GuardianForm> {
    val rest = filterIndexed { i, _ -> i != index }
    return if (rest.isNotEmpty() && rest.none { it.isPrimary }) rest.withPrimary(0) else rest
}

const val MAX_GUARDIANS = 4
