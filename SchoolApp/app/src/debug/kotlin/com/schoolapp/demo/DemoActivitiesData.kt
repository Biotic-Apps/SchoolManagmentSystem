package com.schoolapp.demo

import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityConsent
import com.schoolapp.core.model.activity.ActivityParticipant
import com.schoolapp.core.model.activity.ActivityStatus
import com.schoolapp.core.model.activity.ActivityType
import com.schoolapp.core.model.activity.ConsentStatus
import kotlinx.coroutines.flow.MutableStateFlow

/** Sports Day (announced, consent due in 3 days), a museum trip (proposed) and a completed science quiz. */
internal object DemoActivitiesData {
    const val SPORTS_DAY = "demo-act-1"
    const val TRIP = "demo-act-2"
    const val QUIZ = "demo-act-3"
    private val class5 = setOf("demo-sec-5a", "demo-sec-5b")

    val activities = MutableStateFlow(seed())

    /** Sections an activity is for; null = the whole branch. */
    val audience = MutableStateFlow<Map<String, Set<String>?>>(mapOf(SPORTS_DAY to null, TRIP to class5, QUIZ to class5))

    val consents = MutableStateFlow(
        mapOf(SPORTS_DAY to sportsConsents(), TRIP to emptyList(), QUIZ to emptyList()),
    )

    val participants = MutableStateFlow(mapOf(QUIZ to quizResults()))

    private fun seed(): List<Activity> {
        val today = DemoDates.today()
        val sports = today.plusDays(7)
        val trip = today.plusDays(14)
        val quiz = DemoDates.previousSchoolDays(5).last()
        return listOf(
            Activity(
                SPORTS_DAY, ActivityType.SPORTS, "Annual Sports Day",
                "Races, relay and tug of war for all classes. Students wear house colours and bring a water bottle.",
                DemoDates.iso(sports, "08:30"), DemoDates.iso(sports, "12:30"), "School playground", ActivityStatus.ANNOUNCED,
                consentRequired = true, consentDeadline = today.plusDays(3).toString(), feeMinor = null, maxParticipants = null,
                audienceLabel = "Whole branch", proposedBy = DemoActors.teacher.name,
            ),
            Activity(
                TRIP, ActivityType.TRIP, "Visit to Lahore Museum",
                "Guided tour of the history and science galleries. Transport by school bus.",
                DemoDates.iso(trip, "09:00"), DemoDates.iso(trip, "13:00"), "Lahore Museum, Mall Road", ActivityStatus.PROPOSED,
                consentRequired = true, consentDeadline = today.plusDays(10).toString(), feeMinor = 50_000, maxParticipants = 60,
                audienceLabel = "Class 5", proposedBy = DemoActors.teacher.name,
            ),
            Activity(
                QUIZ, ActivityType.COMPETITION, "Inter-section Science Quiz",
                "Two rounds of general science questions between Class 5 sections.",
                DemoDates.iso(quiz, "10:00"), DemoDates.iso(quiz, "11:30"), "School hall", ActivityStatus.COMPLETED,
                consentRequired = false, consentDeadline = null, feeMinor = null, maxParticipants = 8,
                audienceLabel = "Class 5", proposedBy = "Kamran Ali",
            ),
        )
    }

    private fun sportsConsents(): List<ActivityConsent> = DemoPeopleData.students.mapIndexed { index, s ->
        val status = when {
            s.id == DemoPeopleData.CHILD_1 -> ConsentStatus.PENDING
            s.id == DemoPeopleData.CHILD_2 -> ConsentStatus.GRANTED
            index % 4 == 1 -> ConsentStatus.PENDING
            index % 7 == 3 -> ConsentStatus.DECLINED
            else -> ConsentStatus.GRANTED
        }
        ActivityConsent(
            s.id, s.name, s.primaryGuardianName, status,
            if (status == ConsentStatus.PENDING) null else DemoDates.iso(DemoDates.previousSchoolDays(1).first(), "19:30"),
        )
    }

    private fun quizResults(): List<ActivityParticipant> {
        fun idOf(name: String) = DemoPeopleData.students.first { it.name == name }.id
        return listOf(
            ActivityParticipant(idOf("Ayesha Khan"), "Ayesha Khan", "Team captain", "Winner", 1, "Answered the rapid-fire round perfectly"),
            ActivityParticipant(idOf("Maryam Raza"), "Maryam Raza", "Team captain", "Runner-up", 2, null),
            ActivityParticipant(idOf("Bilal Ahmed"), "Bilal Ahmed", "Member", "Third place", 3, null),
            ActivityParticipant(idOf("Saad Hussain"), "Saad Hussain", "Member", "Participated", null, "Good effort"),
        )
    }
}
