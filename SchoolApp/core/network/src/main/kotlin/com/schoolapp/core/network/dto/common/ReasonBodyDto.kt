package com.schoolapp.core.network.dto.common

import kotlinx.serialization.Serializable

/** Optional-text action bodies (`{ comment? }`, `{ reason? }`, `{ note? }`); nulls are not sent. */
@Serializable
data class CommentBodyDto(val comment: String? = null)

@Serializable
data class ReasonBodyDto(val reason: String? = null)

@Serializable
data class NoteBodyDto(val note: String? = null)
