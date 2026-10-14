package com.schoolapp.feature.settings.shell

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.schoolapp.feature.settings.backups.BackupsTab
import com.schoolapp.feature.settings.imports.ImportsTab
import com.schoolapp.feature.settings.notifications.NotificationsTab
import com.schoolapp.feature.settings.policies.PoliciesTab
import com.schoolapp.feature.settings.school.SchoolBrandingTab
import com.schoolapp.feature.settings.smsgateway.SmsGatewayTab
import com.schoolapp.feature.settings.support.SupportTab

/** Each tab keeps its own ViewModel (keyed by school), so switching tabs never drops unsaved edits. */
@Composable
internal fun SettingsTabContent(
    tab: SettingsTab,
    schoolId: String,
    canEdit: Boolean,
    isSuperAdmin: Boolean,
    modifier: Modifier = Modifier,
) {
    when (tab) {
        SettingsTab.SCHOOL -> SchoolBrandingTab(schoolId, canEdit, modifier)
        SettingsTab.NOTIFICATIONS -> NotificationsTab(schoolId, canEdit, modifier)
        SettingsTab.POLICIES -> PoliciesTab(schoolId, canEdit, modifier)
        SettingsTab.SUPPORT -> SupportTab(schoolId, canEdit, showHealth = isSuperAdmin, modifier = modifier)
        SettingsTab.BACKUPS -> BackupsTab(modifier)
        SettingsTab.IMPORTS -> ImportsTab(schoolId, modifier)
        SettingsTab.SMS_GATEWAY -> SmsGatewayTab(schoolId, modifier)
    }
}
