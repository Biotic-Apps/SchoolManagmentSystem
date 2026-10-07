package com.schoolapp.core.data.branding

import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.datastore.branding.BrandingCache
import com.schoolapp.core.model.branding.Branding
import com.schoolapp.core.network.ApiCaller
import com.schoolapp.core.network.NetworkJson
import com.schoolapp.core.network.api.BrandingApi
import com.schoolapp.core.network.dto.branding.BrandingDto
import com.schoolapp.core.network.model.ApiEnvelope
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Assert.assertNull
import org.junit.Test
import java.io.IOException

class DefaultBrandingRepositoryTest {

    private val dispatcher = UnconfinedTestDispatcher()
    private val api = FakeBrandingApi()
    private val cache = FakeBrandingCache()
    private val repository = DefaultBrandingRepository(api, ApiCaller(NetworkJson, dispatcher), cache)

    @Test
    fun success_is_cached_and_emitted() = runTest(dispatcher) {
        api.response = BrandingDto("City School", "https://cdn/logo.png", "#0B7F74", "#E6F5F2", "City App")
        assertEquals(AppResult.Success(Unit), repository.refresh("s1"))
        assertEquals(Branding("City School", "City App", "https://cdn/logo.png", "#0B7F74", "#E6F5F2"), repository.branding.first())
        assertEquals(listOf<String?>("s1"), api.calls)
    }

    @Test
    fun failure_keeps_previous_cache() = runTest(dispatcher) {
        val previous = Branding("Old School", null, null, "#0B7F74", null)
        cache.state.value = previous
        api.fail = IOException("offline")
        assertEquals(AppResult.Failure(AppError.Network), repository.refresh("s1"))
        assertEquals(previous, repository.branding.first())
    }

    @Test
    fun blank_fields_become_null() = runTest(dispatcher) {
        api.response = BrandingDto(schoolName = "  ", logoUrl = "", primaryColor = " #0B7F74 ", accentSoftColor = null, appName = "")
        repository.refresh(null)
        assertEquals(Branding(null, null, null, "#0B7F74", null), repository.branding.first())
    }

    @Test
    fun null_or_blank_school_lets_server_pick_default() = runTest(dispatcher) {
        repository.refresh(null)
        repository.refresh(" ")
        assertEquals(listOf<String?>(null, null), api.calls)
    }

    @Test
    fun nothing_cached_before_first_success() = runTest(dispatcher) {
        assertNull(repository.branding.first())
    }

    private class FakeBrandingApi : BrandingApi {
        val calls = mutableListOf<String?>()
        var response = BrandingDto()
        var fail: Exception? = null

        override suspend fun branding(schoolId: String?): ApiEnvelope<BrandingDto> {
            calls += schoolId
            fail?.let { throw it }
            return ApiEnvelope(response)
        }
    }

    private class FakeBrandingCache : BrandingCache {
        val state = MutableStateFlow<Branding?>(null)
        override val branding: Flow<Branding?> = state
        override suspend fun save(branding: Branding) {
            state.value = branding
        }
    }
}
