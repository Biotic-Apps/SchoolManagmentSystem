package com.schoolapp.core.data.messages

import com.schoolapp.core.model.message.MessageRecipient
import com.schoolapp.core.model.message.RecipientRole
import com.schoolapp.core.network.dto.message.MessageRecipientDto

internal fun MessageRecipientDto.toModel() = MessageRecipient(
    userId = userId,
    name = name,
    role = RecipientRole.entries.firstOrNull { it.name == role } ?: RecipientRole.OTHER,
    subjectName = subjectName?.takeIf { it.isNotBlank() },
)
