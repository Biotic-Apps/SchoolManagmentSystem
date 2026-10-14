package com.schoolapp.feature.admissions.create

import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.ui.people.ChildForm
import com.schoolapp.core.ui.people.GuardianForm

/** Prefills the form from a saved application (edit mode). */
internal fun NewApplicationUiState.filledFrom(app: AdmissionApplication): NewApplicationUiState {
    val child = app.child
    val guardians = app.guardians.map {
        GuardianForm(
            name = it.name,
            relation = it.relation.orEmpty(),
            phone = it.phone.orEmpty(),
            cnic = it.cnic.orEmpty(),
            email = it.email.orEmpty(),
            occupation = it.occupation.orEmpty(),
            address = it.address.orEmpty(),
            isPrimary = it.isPrimary,
        )
    }.ifEmpty { listOf(GuardianForm(isPrimary = true)) }
    return copy(
        isEdit = true,
        applicationNo = app.applicationNo,
        className = app.className,
        classId = app.classId,
        child = ChildForm(
            firstName = child?.firstName.orEmpty(),
            lastName = child?.lastName.orEmpty(),
            dob = child?.dob.orEmpty(),
            gender = child?.gender.orEmpty(),
            bForm = child?.bForm.orEmpty(),
            previousSchool = child?.previousSchool.orEmpty(),
            address = child?.address.orEmpty(),
        ),
        guardians = if (guardians.none { it.isPrimary }) guardians.mapIndexed { i, g -> g.copy(isPrimary = i == 0) } else guardians,
        medical = MedicalForm.from(app.medical),
        notes = app.notes.orEmpty(),
    )
}
