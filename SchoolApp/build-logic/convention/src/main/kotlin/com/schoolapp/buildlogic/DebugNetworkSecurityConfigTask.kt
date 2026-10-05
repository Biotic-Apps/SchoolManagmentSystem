package com.schoolapp.buildlogic

import org.gradle.api.DefaultTask
import org.gradle.api.file.DirectoryProperty
import org.gradle.api.provider.ListProperty
import org.gradle.api.tasks.Input
import org.gradle.api.tasks.OutputDirectory
import org.gradle.api.tasks.TaskAction

/** Writes `xml/network_security_config_debug.xml` allowing cleartext only to the given hosts. */
abstract class DebugNetworkSecurityConfigTask : DefaultTask() {

    @get:Input
    abstract val cleartextHosts: ListProperty<String>

    @get:OutputDirectory
    abstract val outputDir: DirectoryProperty

    @TaskAction
    fun generate() {
        val domains = cleartextHosts.get().distinct().joinToString("\n") {
            "        <domain includeSubdomains=\"false\">$it</domain>"
        }
        val xmlDir = outputDir.get().asFile.resolve("xml").apply { mkdirs() }
        xmlDir.resolve("network_security_config_debug.xml").writeText(
            """
            |<?xml version="1.0" encoding="utf-8"?>
            |<!-- Generated for debug builds only. Cleartext is limited to the local API hosts. -->
            |<network-security-config>
            |    <base-config cleartextTrafficPermitted="false">
            |        <trust-anchors>
            |            <certificates src="system" />
            |        </trust-anchors>
            |    </base-config>
            |    <domain-config cleartextTrafficPermitted="true">
            |$domains
            |    </domain-config>
            |</network-security-config>
            |
            """.trimMargin(),
        )
    }
}
