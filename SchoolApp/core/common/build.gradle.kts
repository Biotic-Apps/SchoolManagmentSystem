plugins {
    alias(libs.plugins.schoolapp.android.library)
    alias(libs.plugins.schoolapp.hilt)
}

android {
    namespace = "com.schoolapp.core.common"
}

dependencies {
    api(libs.kotlinx.coroutines.android)
}
