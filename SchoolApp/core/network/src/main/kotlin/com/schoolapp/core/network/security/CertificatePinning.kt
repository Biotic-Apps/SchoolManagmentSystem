package com.schoolapp.core.network.security

import okhttp3.CertificatePinner

/**
 * Builds the release pinner from `schoolapp.pin.host` / `schoolapp.pin.sha256` (BuildConfig).
 * Returns null (pinning off) when the host is blank or fewer than [MIN_PINS] valid pins are given,
 * so a single-pin config can never lock users out after a certificate rotation.
 */
object CertificatePinning {
    const val MIN_PINS = 2
    private const val PREFIX = "sha256/"
    private val Base64Sha256 = Regex("^[A-Za-z0-9+/]{43}=$")

    fun pinnerOrNull(host: String, pinsCsv: String): CertificatePinner? {
        val cleanHost = host.trim()
        if (cleanHost.isEmpty()) return null
        val pins = parsePins(pinsCsv)
        if (pins.size < MIN_PINS) return null
        return CertificatePinner.Builder().apply { pins.forEach { add(cleanHost, it) } }.build()
    }

    internal fun parsePins(pinsCsv: String): List<String> = pinsCsv.split(',')
        .map { it.trim().removePrefix(PREFIX) }
        .filter { Base64Sha256.matches(it) }
        .distinct()
        .map { PREFIX + it }
}
