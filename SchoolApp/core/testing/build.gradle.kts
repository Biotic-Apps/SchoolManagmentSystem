plugins {
    alias(libs.plugins.schoolapp.android.library)
}

android {
    namespace = "com.schoolapp.core.testing"
}

dependencies {
    api(projects.core.data)
    api(libs.junit)
    api(libs.kotlinx.coroutines.test)
    api(libs.turbine)
}
