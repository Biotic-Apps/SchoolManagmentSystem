package com.schoolapp.feature.auth.components

import com.schoolapp.feature.auth.R

/** Who is signing in; only changes the identifier label and the parent's password help line. */
internal enum class LoginAudience(val tabRes: Int, val identifierLabelRes: Int) {
    STAFF(R.string.auth_audience_staff, R.string.auth_identifier_label_staff),
    PARENT(R.string.auth_audience_parent, R.string.auth_identifier_label_parent),
}
