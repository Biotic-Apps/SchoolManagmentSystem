package com.schoolapp.feature.students.detail.health

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Add
import androidx.compose.material.icons.outlined.DeleteOutline
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppCard
import com.schoolapp.core.designsystem.component.AppTextButton
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.ui.humanizeKey
import com.schoolapp.feature.students.R

@Composable
internal fun AllergiesEditor(draft: HealthDraft, onChange: (HealthDraft) -> Unit, enabled: Boolean) {
    ListSection(R.string.sd_health_allergies, R.string.sd_health_add_allergy, R.string.sd_health_no_allergies, draft.allergies.isEmpty(), enabled, {
        onChange(draft.copy(allergies = draft.allergies + AllergyDraft()))
    }) {
        draft.allergies.forEachIndexed { i, a ->
            val set = { v: AllergyDraft -> onChange(draft.copy(allergies = draft.allergies.replaced(i, v))) }
            ItemCard(stringResource(R.string.sd_health_allergy_n, i + 1), enabled, { onChange(draft.copy(allergies = draft.allergies.without(i))) }) {
                Field(a.name, { set(a.copy(name = it)) }, R.string.sd_health_allergic_to, problemText(draft.errorOf("allergies.$i.name"), HealthDraft.NAME_MAX), enabled)
                Text(stringResource(R.string.sd_health_severity), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
                FilterChipRow(HealthDraft.Severities.map { SwitcherOption(it, humanizeKey(it)) }, a.severity, { if (enabled) set(a.copy(severity = it)) })
                problemText(draft.errorOf("allergies.$i.severity"), 0)?.let { ErrorLine(it) }
                Field(a.reaction, { set(a.copy(reaction = it)) }, R.string.sd_health_reaction, problemText(draft.errorOf("allergies.$i.reaction"), HealthDraft.REACTION_MAX), enabled)
            }
        }
    }
}

@Composable
internal fun ConditionsEditor(draft: HealthDraft, onChange: (HealthDraft) -> Unit, enabled: Boolean) {
    ListSection(R.string.sd_health_conditions, R.string.sd_health_add_condition, R.string.sd_health_no_conditions, draft.conditions.isEmpty(), enabled, {
        onChange(draft.copy(conditions = draft.conditions + ""))
    }) {
        draft.conditions.forEachIndexed { i, c ->
            ItemCard(stringResource(R.string.sd_health_condition_n, i + 1), enabled, { onChange(draft.copy(conditions = draft.conditions.without(i))) }) {
                Field(c, { onChange(draft.copy(conditions = draft.conditions.replaced(i, it))) }, R.string.sd_health_condition,
                    problemText(draft.errorOf("conditions.$i"), HealthDraft.CONDITION_MAX), enabled)
            }
        }
    }
}

@Composable
internal fun MedicationsEditor(draft: HealthDraft, onChange: (HealthDraft) -> Unit, enabled: Boolean) {
    ListSection(R.string.sd_health_medications, R.string.sd_health_add_medicine, R.string.sd_health_no_medications, draft.medications.isEmpty(), enabled, {
        onChange(draft.copy(medications = draft.medications + MedicationDraft()))
    }) {
        draft.medications.forEachIndexed { i, m ->
            val set = { v: MedicationDraft -> onChange(draft.copy(medications = draft.medications.replaced(i, v))) }
            ItemCard(stringResource(R.string.sd_health_medicine_n, i + 1), enabled, { onChange(draft.copy(medications = draft.medications.without(i))) }) {
                Field(m.name, { set(m.copy(name = it)) }, R.string.sd_health_medicine, problemText(draft.errorOf("medications.$i.name"), HealthDraft.NAME_MAX), enabled)
                Field(m.dose, { set(m.copy(dose = it)) }, R.string.sd_health_dose, problemText(draft.errorOf("medications.$i.dose"), HealthDraft.NAME_MAX), enabled)
                Field(m.schedule, { set(m.copy(schedule = it)) }, R.string.sd_health_schedule, problemText(draft.errorOf("medications.$i.schedule"), HealthDraft.CONDITION_MAX), enabled)
            }
        }
    }
}

@Composable
internal fun ContactsEditor(draft: HealthDraft, onChange: (HealthDraft) -> Unit, enabled: Boolean) {
    ListSection(R.string.sd_health_contacts, R.string.sd_health_add_contact, R.string.sd_health_no_contacts, draft.contacts.isEmpty(), enabled, {
        onChange(draft.copy(contacts = draft.contacts + ContactDraft()))
    }) {
        Text(stringResource(R.string.sd_health_contacts_order), style = MaterialTheme.typography.bodySmall, color = AppColors.TextSecondary)
        draft.contacts.forEachIndexed { i, c ->
            val set = { v: ContactDraft -> onChange(draft.copy(contacts = draft.contacts.replaced(i, v))) }
            ItemCard(stringResource(R.string.sd_health_contact_n, i + 1), enabled, { onChange(draft.copy(contacts = draft.contacts.without(i))) }) {
                Field(c.name, { set(c.copy(name = it)) }, R.string.sd_name, problemText(draft.errorOf("contacts.$i.name"), HealthDraft.NAME_MAX), enabled, FieldKind.Name)
                Field(c.relation, { set(c.copy(relation = it)) }, R.string.sd_relation, problemText(draft.errorOf("contacts.$i.relation"), HealthDraft.RELATION_MAX), enabled)
                Field(c.phone, { set(c.copy(phone = it)) }, R.string.sd_phone, problemText(draft.errorOf("contacts.$i.phone"), 0), enabled, FieldKind.Phone)
            }
        }
    }
}

@Composable
private fun ListSection(title: Int, addLabel: Int, emptyText: Int, empty: Boolean, enabled: Boolean, onAdd: () -> Unit, items: @Composable () -> Unit) {
    EditorHeading(title)
    if (empty) Muted(stringResource(emptyText))
    items()
    AppTextButton(stringResource(addLabel), onAdd, enabled = enabled, leadingIcon = Icons.Outlined.Add)
}

@Composable
private fun ItemCard(title: String, enabled: Boolean, onRemove: () -> Unit, content: @Composable () -> Unit) {
    AppCard(Modifier.fillMaxWidth(), contentPadding = 12.dp) {
        Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, style = MaterialTheme.typography.labelLarge, color = AppColors.TextSecondary, modifier = Modifier.weight(1f))
                IconButton(onClick = onRemove, enabled = enabled) {
                    Icon(Icons.Outlined.DeleteOutline, stringResource(R.string.sd_remove_named, title), tint = AppColors.Error)
                }
            }
            content()
        }
    }
}

@Composable
private fun Field(value: String, onChange: (String) -> Unit, label: Int, error: String?, enabled: Boolean, kind: FieldKind = FieldKind.Text) {
    AppTextField(value = value, onValueChange = onChange, label = stringResource(label), errorText = error, enabled = enabled, kind = kind)
}

@Composable
private fun ErrorLine(text: String) {
    Text(text, style = MaterialTheme.typography.bodySmall, color = AppColors.Error)
}

private fun <T> List<T>.replaced(index: Int, value: T): List<T> = mapIndexed { i, item -> if (i == index) value else item }

private fun <T> List<T>.without(index: Int): List<T> = filterIndexed { i, _ -> i != index }
