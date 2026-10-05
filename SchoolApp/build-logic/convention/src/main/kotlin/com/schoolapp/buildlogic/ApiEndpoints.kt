package com.schoolapp.buildlogic

import org.gradle.api.provider.Provider
import org.gradle.api.provider.ProviderFactory
import java.net.URI

/** API base URLs per build type, overridable with Gradle properties (see SchoolApp/README.md). */
object ApiEndpoints {
    const val DEBUG_PROPERTY = "schoolapp.apiBaseUrl.debug"
    const val RELEASE_PROPERTY = "schoolapp.apiBaseUrl.release"
    const val DEFAULT_DEBUG_URL = "http://10.0.2.2:3000/api/v1/"
    const val DEFAULT_RELEASE_URL = "https://api.example.com/api/v1/"

    fun debugBaseUrl(providers: ProviderFactory): Provider<String> =
        providers.gradleProperty(DEBUG_PROPERTY).map(::withTrailingSlash).orElse(DEFAULT_DEBUG_URL)

    fun releaseBaseUrl(providers: ProviderFactory): Provider<String> =
        providers.gradleProperty(RELEASE_PROPERTY).map(::withTrailingSlash).orElse(DEFAULT_RELEASE_URL)

    fun hostOf(url: String): String = URI(url).host ?: error("API base URL has no host: $url")

    private fun withTrailingSlash(url: String) = if (url.endsWith("/")) url.trim() else "${url.trim()}/"
}
