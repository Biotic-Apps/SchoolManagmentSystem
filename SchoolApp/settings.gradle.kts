pluginManagement {
    includeBuild("build-logic")
    repositories {
        google {
            content {
                includeGroupByRegex("com\\.android.*")
                includeGroupByRegex("com\\.google.*")
                includeGroupByRegex("androidx.*")
            }
        }
        mavenCentral()
        gradlePluginPortal()
    }
}
plugins {
    id("org.gradle.toolchains.foojay-resolver-convention") version "1.0.0"
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

enableFeaturePreview("TYPESAFE_PROJECT_ACCESSORS")
rootProject.name = "SchoolApp"
include(":app")
include(":core:common")
include(":core:model")
include(":core:designsystem")
include(":core:navigation")
include(":core:network")
include(":core:datastore")
include(":core:database")
include(":core:data")
include(":core:sync")
include(":core:ui")
include(":core:testing")
include(":feature:auth")
include(":feature:home")
include(":feature:profile")
include(":feature:dashboard")
include(":feature:approvals")
include(":feature:notifications")
include(":feature:organisation")
include(":feature:students")
include(":feature:timetable")
include(":feature:admissions")
include(":feature:staff")
include(":feature:attendance")
include(":feature:diary")
include(":feature:activities")
include(":feature:notices")
include(":feature:messages")
include(":feature:complaints")
include(":feature:meetings")
include(":feature:health")
include(":feature:pickup")
include(":feature:exams")
include(":feature:progress")
include(":feature:fees")
include(":feature:payroll")
include(":feature:certificates")
include(":feature:settings")
include(":feature:expenses")
include(":feature:inventory")
include(":feature:accounts")
include(":feature:reports")
include(":feature:admin")
include(":feature:homework")
include(":feature:questionbank")
