package com.schoolapp.feature.exams.grading

import androidx.compose.runtime.Immutable
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.model.exams.grading.GradeBand
import com.schoolapp.core.model.exams.grading.GradingScheme
import java.util.UUID

/** One band as typed. */
@Immutable
data class BandInput(
    val key: String = UUID.randomUUID().toString(),
    val grade: String = "",
    val min: String = "",
    val max: String = "",
    val remark: String = "",
    val gradePoint: String = "",
)

enum class BandIssue { GRADE_MISSING, GRADE_REPEATED, RANGE_INVALID, OVERLAP, GAP, POINT_INVALID }

/** Coverage problems not tied to one row. */
enum class CoverageIssue { NO_BANDS, NOT_FROM_ZERO, NOT_TO_HUNDRED }

@Immutable
data class GradingForm(
    val schemeId: String? = null,
    val name: String = "",
    val passPercent: String = DEFAULT_PASS,
    val bands: List<BandInput> = listOf(BandInput()),
    val nameMissing: Boolean = false,
    val passInvalid: Boolean = false,
    val bandIssues: Map<String, BandIssue> = emptyMap(),
    val coverage: List<CoverageIssue> = emptyList(),
    val isSaving: Boolean = false,
    val error: AppError? = null,
) {
    companion object {
        const val DEFAULT_PASS = "33"

        fun from(scheme: GradingScheme) = GradingForm(
            schemeId = scheme.id,
            name = scheme.name,
            passPercent = scheme.passPercent.clean(),
            bands = scheme.bands.map {
                BandInput(grade = it.grade, min = it.minPercent.clean(), max = it.maxPercent.clean(), remark = it.remark.orEmpty(), gradePoint = it.gradePoint?.clean().orEmpty())
            }.ifEmpty { listOf(BandInput()) },
        )

        /** Common A+ … F scale (pass at 33 %). */
        val STANDARD: List<BandInput> = listOf(
            Triple("A+", 90, 100), Triple("A", 80, 89), Triple("B", 70, 79), Triple("C", 60, 69),
            Triple("D", 50, 59), Triple("E", 33, 49), Triple("F", 0, 32),
        ).map { (grade, min, max) -> BandInput(grade = grade, min = min.toString(), max = max.toString()) }

        private fun Double.clean(): String = if (this % 1.0 == 0.0) toLong().toString() else toString()
    }
}

internal object GradingRules {
    private const val HUNDRED = 100

    /** Row issues (first per row) and coverage issues, like the API's band checks. */
    fun check(bands: List<BandInput>): Pair<Map<String, BandIssue>, List<CoverageIssue>> {
        if (bands.isEmpty()) return emptyMap<String, BandIssue>() to listOf(CoverageIssue.NO_BANDS)
        val issues = mutableMapOf<String, BandIssue>()
        val seen = mutableSetOf<String>()
        val ranges = mutableListOf<Triple<String, Int, Int>>()
        bands.forEach { band ->
            val grade = band.grade.trim().uppercase()
            when {
                grade.isEmpty() -> issues.putIfAbsent(band.key, BandIssue.GRADE_MISSING)
                !seen.add(grade) -> issues.putIfAbsent(band.key, BandIssue.GRADE_REPEATED)
            }
            val min = band.min.whole()
            val max = band.max.whole()
            if (min == null || max == null || min > max) issues.putIfAbsent(band.key, BandIssue.RANGE_INVALID) else ranges += Triple(band.key, min, max)
            if (band.gradePoint.isNotBlank() && band.gradePoint.trim().toDoubleOrNull() == null) issues.putIfAbsent(band.key, BandIssue.POINT_INVALID)
        }
        val sorted = ranges.sortedWith(compareBy({ it.second }, { it.third }))
        for (i in 1 until sorted.size) {
            val previous = sorted[i - 1]
            val current = sorted[i]
            val issue = when {
                current.second <= previous.third -> BandIssue.OVERLAP
                current.second > previous.third + 1 -> BandIssue.GAP
                else -> null
            } ?: continue
            issues.putIfAbsent(previous.first, issue)
            issues.putIfAbsent(current.first, issue)
        }
        val coverage = buildList {
            if (sorted.isNotEmpty() && sorted.first().second > 0) add(CoverageIssue.NOT_FROM_ZERO)
            if (sorted.isNotEmpty() && sorted.maxOf { it.third } < HUNDRED) add(CoverageIssue.NOT_TO_HUNDRED)
        }
        return issues to coverage
    }

    fun toBands(bands: List<BandInput>): List<GradeBand> = bands.map {
        GradeBand(
            grade = it.grade.trim(),
            minPercent = it.min.trim().toDouble(),
            maxPercent = it.max.trim().toDouble(),
            remark = it.remark.trim().ifEmpty { null },
            gradePoint = it.gradePoint.trim().toDoubleOrNull(),
        )
    }

    fun String.whole(): Int? = trim().takeIf { it.isNotEmpty() && it.all(Char::isDigit) }?.toIntOrNull()?.takeIf { it <= HUNDRED }
}
