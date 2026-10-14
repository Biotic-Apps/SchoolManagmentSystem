package com.schoolapp.core.data.students.list

import com.schoolapp.core.model.settings.PagedList
import com.schoolapp.core.network.model.ApiEnvelope

/**
 * One server page as a [PagedList]. When the server leaves out `meta.total`, a full page is taken to mean
 * "maybe more" so the list keeps loading until a short page arrives.
 */
internal fun <D, T> ApiEnvelope<List<D>>.toPage(page: Int, pageSize: Int, map: (D) -> T): PagedList<T> {
    val size = meta?.pageSize ?: pageSize
    val total = meta?.total ?: if (data.size >= size) (page + 1) * size else (page - 1) * size + data.size
    return PagedList(data.map(map), meta?.page ?: page, size, total)
}
