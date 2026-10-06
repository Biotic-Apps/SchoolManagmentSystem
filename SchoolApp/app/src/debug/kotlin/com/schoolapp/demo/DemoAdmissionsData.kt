package com.schoolapp.demo

import com.schoolapp.core.model.admissions.AdmissionApplication
import com.schoolapp.core.model.admissions.AdmissionTest
import com.schoolapp.core.model.admissions.ApplicantGuardian
import com.schoolapp.core.model.admissions.ApplicationStatus

/** Four applications in different states plus two waitlisted (contract section 9). */
internal object DemoAdmissionsData {

    private fun app(
        n: Int,
        child: String,
        className: String,
        status: ApplicationStatus,
        test: AdmissionTest? = null,
        waitlist: Int? = null,
    ) = AdmissionApplication(
        id = "demo-app-$n",
        applicationNo = "APP-2026-%03d".format(n),
        status = status,
        childName = child,
        dob = "2020-0$n-12",
        gender = if (n % 2 == 0) "MALE" else "FEMALE",
        className = className,
        previousSchool = if (n % 2 == 0) "Little Stars Montessori" else null,
        guardians = listOf(ApplicantGuardian("Guardian of ${child.substringBefore(' ')}", "FATHER", "0301555000$n", true)),
        waitlistPosition = waitlist,
        test = test,
        documentCount = n % 3 + 1,
        decisionReason = null,
        createdAt = "2026-09-2${n}T09:00:00Z",
    )

    val applications = listOf(
        app(1, "Aiman Farooq", "Class 1", ApplicationStatus.SUBMITTED),
        app(2, "Zaid Mehmood", "Class 1", ApplicationStatus.DOCUMENTS_PENDING),
        app(3, "Laiba Saeed", "Class 2", ApplicationStatus.TEST_SCHEDULED, AdmissionTest("2026-10-08T05:00:00Z", "Main Hall", null, null, null)),
        app(4, "Hassan Zafar", "Class 2", ApplicationStatus.TEST_COMPLETED, AdmissionTest("2026-09-30T05:00:00Z", "Main Hall", 42.0, 50.0, "Strong reading")),
        app(5, "Noor Fatima", "Class 1", ApplicationStatus.WAITLISTED, waitlist = 1),
        app(6, "Ahmad Raza", "Class 1", ApplicationStatus.WAITLISTED, waitlist = 2),
    )
}
