package com.schoolapp.core.network

import com.schoolapp.core.network.dto.auth.AuthTokensDto
import com.schoolapp.core.network.dto.me.MeDto
import com.schoolapp.core.network.model.ApiEnvelope
import com.schoolapp.core.network.model.ApiErrorEnvelope
import org.junit.Assert.assertEquals
import org.junit.Assert.assertTrue
import org.junit.Test

class NetworkJsonTest {

    @Test
    fun decodes_me_envelope_from_contract_ignoring_unknown_fields() {
        val raw = """
            {"data":{"user":{"id":"u1","name":"Sara Ali","email":"s@x.pk","phone":null,"mustChangePassword":false,"extra":1},
             "activeRole":"CUSTOM_FRONT_DESK","roles":["TEACHER","CUSTOM_FRONT_DESK"],
             "permissions":["dashboard.view"],
             "assignments":[{"id":"a1","role":"CUSTOM_FRONT_DESK","roleName":"Front Desk","scopeType":"BRANCH",
               "schoolId":"s1","schoolName":"Bright","branchId":"b1","branchName":"Main","validUntil":null}],
             "children":[]}}
        """.trimIndent()
        val me = NetworkJson.decodeFromString<ApiEnvelope<MeDto>>(raw).data
        assertEquals("Sara Ali", me.user.name)
        assertEquals("CUSTOM_FRONT_DESK", me.activeRole)
        assertEquals("Front Desk", me.assignments.single().roleName)
    }

    @Test
    fun decodes_auth_tokens_with_must_change_flag() {
        val raw = """{"data":{"accessToken":"a","refreshToken":"r","accessExpiresIn":900,"mustChangePassword":true}}"""
        val tokens = NetworkJson.decodeFromString<ApiEnvelope<AuthTokensDto>>(raw).data
        assertTrue(tokens.mustChangePassword)
        assertEquals(900L, tokens.accessExpiresIn)
    }

    @Test
    fun decodes_error_envelope() {
        val raw = """{"error":{"code":"RECORD_LOCKED","message":"Locked"}}"""
        assertEquals("RECORD_LOCKED", NetworkJson.decodeFromString<ApiErrorEnvelope>(raw).error.code)
    }
}
