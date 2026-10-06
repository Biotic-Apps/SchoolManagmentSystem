package com.schoolapp.buildlogic

import org.gradle.api.GradleException
import org.gradle.api.provider.ProviderFactory

/** Release certificate pins from Gradle properties; both empty = pinning disabled. Never used for debug. */
object CertificatePins {
    const val HOST_PROPERTY = "schoolapp.pin.host"
    const val PINS_PROPERTY = "schoolapp.pin.sha256"

    data class Config(val host: String, val pins: String)

    fun release(providers: ProviderFactory): Config {
        val host = providers.gradleProperty(HOST_PROPERTY).orNull?.trim().orEmpty()
        val pins = providers.gradleProperty(PINS_PROPERTY).orNull?.trim().orEmpty()
        val count = pins.split(',').count { it.isNotBlank() }
        if (host.isNotEmpty() && count < 2) {
            throw GradleException("$PINS_PROPERTY needs at least 2 comma-separated pins (current + backup) when $HOST_PROPERTY is set")
        }
        return if (host.isEmpty()) Config("", "") else Config(host, pins)
    }
}
