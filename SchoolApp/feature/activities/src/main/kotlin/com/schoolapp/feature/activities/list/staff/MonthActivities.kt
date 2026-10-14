package com.schoolapp.feature.activities.list.staff

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.activities.ActivitiesRepository
import com.schoolapp.core.model.activity.Activity
import com.schoolapp.core.model.activity.ActivityFilter
import com.schoolapp.feature.activities.domain.ActivityTimes
import com.schoolapp.feature.activities.list.ActivityItem
import java.time.LocalDate
import java.time.YearMonth
import java.time.ZoneId

/** Every activity of a month (all pages) grouped by the local days they cover. */
internal object MonthActivities {

    suspend fun load(
        repository: ActivitiesRepository,
        branchId: String?,
        filter: ActivityFilter,
        month: YearMonth,
    ): AppResult<Map<LocalDate, List<ActivityItem>>> {
        val ranged = filter.copy(from = month.atDay(1).toString(), to = month.atEndOfMonth().toString())
        val all = mutableListOf<Activity>()
        var page = 1
        while (true) {
            when (val result = repository.activitiesPage(branchId, ranged, page, MAX_PAGE_SIZE)) {
                is AppResult.Failure -> return result
                is AppResult.Success -> {
                    all += result.data.items
                    if (!result.data.hasNext || page >= MAX_PAGES) break
                    page++
                }
            }
        }
        return AppResult.Success(group(all, month))
    }

    fun group(activities: List<Activity>, month: YearMonth, zone: ZoneId = ZoneId.systemDefault()): Map<LocalDate, List<ActivityItem>> {
        val days = mutableMapOf<LocalDate, MutableList<ActivityItem>>()
        activities.forEach { activity ->
            val start = ActivityTimes.toLocal(activity.startAt, zone)?.toLocalDate() ?: return@forEach
            val end = ActivityTimes.toLocal(activity.endAt, zone)?.toLocalDate()?.takeIf { !it.isBefore(start) } ?: start
            val item = ActivityItem(activity, ActivityTimes.formatRange(activity.startAt, activity.endAt, zone))
            var day = maxOf(start, month.atDay(1))
            val last = minOf(end, month.atEndOfMonth())
            while (!day.isAfter(last)) {
                days.getOrPut(day) { mutableListOf() } += item
                day = day.plusDays(1)
            }
        }
        return days.mapValues { (_, items) -> items.sortedBy { it.activity.startAt } }
    }

    private const val MAX_PAGE_SIZE = 100
    private const val MAX_PAGES = 10
}
