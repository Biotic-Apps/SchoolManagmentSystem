plugins {
    alias(libs.plugins.schoolapp.android.feature)
}

android {
    namespace = "com.schoolapp.feature.profile"
}

dependencies {
    // QR code for authenticator setup (encoder only, no camera).
    implementation("com.google.zxing:core:3.5.3")
}
