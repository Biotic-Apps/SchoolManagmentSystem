package com.schoolapp.buildlogic

import org.gradle.api.Project
import org.gradle.api.artifacts.VersionCatalog
import org.gradle.api.artifacts.VersionCatalogsExtension
import org.gradle.kotlin.dsl.getByType
import org.gradle.kotlin.dsl.withType
import org.jetbrains.kotlin.gradle.tasks.KotlinCompilationTask

internal val Project.libs: VersionCatalog
    get() = extensions.getByType<VersionCatalogsExtension>().named("libs")

internal fun VersionCatalog.lib(alias: String) = findLibrary(alias).get()

internal fun Project.implementation(alias: String) {
    dependencies.add("implementation", libs.lib(alias))
}

internal fun Project.testImplementation(alias: String) {
    dependencies.add("testImplementation", libs.lib(alias))
}

internal fun Project.ksp(alias: String) {
    dependencies.add("ksp", libs.lib(alias))
}

internal fun Project.configureKotlinCompiler() {
    tasks.withType<KotlinCompilationTask<*>>().configureEach {
        compilerOptions.freeCompilerArgs.add("-Xannotation-default-target=param-property")
    }
}
