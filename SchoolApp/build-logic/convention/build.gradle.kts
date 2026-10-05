plugins {
    `kotlin-dsl`
}

group = "com.schoolapp.buildlogic"

java {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
}

kotlin {
    compilerOptions {
        jvmTarget.set(org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17)
    }
}

dependencies {
    compileOnly(libs.android.gradle.plugin)
    compileOnly(libs.kotlin.gradle.plugin)
    compileOnly(libs.compose.gradle.plugin)
    compileOnly(libs.ksp.gradle.plugin)
    compileOnly(libs.hilt.gradle.plugin)
    compileOnly(libs.room.gradle.plugin)
}

gradlePlugin {
    plugins {
        fun add(name: String, impl: String) = register(name) {
            id = name
            implementationClass = "com.schoolapp.buildlogic.$impl"
        }
        add("schoolapp.android.application", "AndroidApplicationConventionPlugin")
        add("schoolapp.android.application.compose", "AndroidApplicationComposeConventionPlugin")
        add("schoolapp.android.library", "AndroidLibraryConventionPlugin")
        add("schoolapp.android.library.compose", "AndroidLibraryComposeConventionPlugin")
        add("schoolapp.android.feature", "AndroidFeatureConventionPlugin")
        add("schoolapp.hilt", "HiltConventionPlugin")
        add("schoolapp.android.room", "AndroidRoomConventionPlugin")
        add("schoolapp.jvm.library", "JvmLibraryConventionPlugin")
    }
}
