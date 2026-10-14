package com.schoolapp.feature.settings.shell

import androidx.annotation.StringRes
import com.schoolapp.feature.settings.R

/** Tabs of Settings & Backups, in web order; which ones show depends on the role. */
internal enum class SettingsTab(@StringRes val title: Int) {
    SCHOOL(R.string.settings_tab_school),
    NOTIFICATIONS(R.string.settings_tab_notifications),
    POLICIES(R.string.settings_tab_policies),
    SUPPORT(R.string.settings_tab_support),
    BACKUPS(R.string.settings_tab_backups),
    IMPORTS(R.string.settings_tab_imports),
    SMS_GATEWAY(R.string.settings_tab_sms_gateway),
}

/** Role differences of the web page: support and backups are super admin only; imports need edit or principal. */
internal fun visibleTabs(isSuperAdmin: Boolean, isPrincipal: Boolean, canEdit: Boolean): List<SettingsTab> =
    SettingsTab.entries.filter { tab ->
        when (tab) {
            SettingsTab.SCHOOL, SettingsTab.NOTIFICATIONS, SettingsTab.POLICIES -> true
            SettingsTab.SUPPORT, SettingsTab.BACKUPS -> isSuperAdmin
            SettingsTab.IMPORTS -> canEdit || isPrincipal
            SettingsTab.SMS_GATEWAY -> isSuperAdmin || isPrincipal
        }
    }
