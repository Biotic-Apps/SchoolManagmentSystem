package com.schoolapp.core.ui.people

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.Delete
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import com.schoolapp.core.designsystem.component.AppDatePickerDialog
import com.schoolapp.core.designsystem.component.AppTextField
import com.schoolapp.core.designsystem.component.FieldKind
import com.schoolapp.core.designsystem.component.FilterChipRow
import com.schoolapp.core.designsystem.component.PickerField
import com.schoolapp.core.designsystem.component.SwitcherOption
import com.schoolapp.core.designsystem.theme.AppColors
import com.schoolapp.core.model.people.GuardianRelation
import com.schoolapp.core.ui.R
import com.schoolapp.core.ui.formatDate

/** Child fields: names, date of birth, gender, B-Form and optional previous school / address. */
@Composable
fun ChildFields(
    form: ChildForm,
    errors: FormErrors,
    onChange: (ChildForm) -> Unit,
    today: String,
    prefix: String = "child.",
    showPreviousSchool: Boolean = true,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        AppTextField(form.firstName, { onChange(form.copy(firstName = it)) }, stringResource(R.string.ui_first_name), kind = FieldKind.Name,
            errorText = errors.text(prefix + "firstName"))
        AppTextField(form.lastName, { onChange(form.copy(lastName = it)) }, stringResource(R.string.ui_last_name), kind = FieldKind.Name,
            errorText = errors.text(prefix + "lastName"))
        DateField(stringResource(R.string.ui_date_of_birth), form.dob, { onChange(form.copy(dob = it)) }, errors.text(prefix + "dob"), maxDate = today)
        GenderChips(form.gender, { onChange(form.copy(gender = it)) }, errors.text(prefix + "gender"))
        AppTextField(form.bForm, { onChange(form.copy(bForm = it.take(ID_MAX))) }, stringResource(R.string.ui_bform),
            placeholder = stringResource(R.string.ui_id_hint), kind = FieldKind.Phone, errorText = errors.text(prefix + "bForm"),
            supportingText = stringResource(R.string.ui_optional))
        if (showPreviousSchool) {
            AppTextField(form.previousSchool, { onChange(form.copy(previousSchool = it)) }, stringResource(R.string.ui_previous_school),
                kind = FieldKind.Title, errorText = errors.text(prefix + "previousSchool"), supportingText = stringResource(R.string.ui_optional))
        }
        AppTextField(form.address, { onChange(form.copy(address = it)) }, stringResource(R.string.ui_address), kind = FieldKind.Sentence,
            errorText = errors.text(prefix + "address"), supportingText = stringResource(R.string.ui_optional))
    }
}

/** One guardian: name, relation, phone, optional CNIC/email/occupation; primary toggle and remove when allowed. */
@Composable
fun GuardianFields(
    form: GuardianForm,
    errors: FormErrors,
    prefix: String,
    onChange: (GuardianForm) -> Unit,
    title: String? = null,
    onMakePrimary: (() -> Unit)? = null,
    onRemove: (() -> Unit)? = null,
) {
    Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
        if (title != null) {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Text(title, style = MaterialTheme.typography.titleMedium, modifier = Modifier.weight(1f))
                onMakePrimary?.let {
                    FilterChip(selected = form.isPrimary, onClick = it, label = { Text(stringResource(R.string.ui_primary_guardian)) })
                }
                onRemove?.let {
                    IconButton(onClick = it) { Icon(Icons.Outlined.Delete, contentDescription = stringResource(R.string.ui_remove_guardian), tint = AppColors.TextSecondary) }
                }
            }
        }
        AppTextField(form.name, { onChange(form.copy(name = it)) }, stringResource(R.string.ui_guardian_name), kind = FieldKind.Name,
            errorText = errors.text(prefix + "name"))
        RelationChips(form.relation, { onChange(form.copy(relation = it)) }, errors.text(prefix + "relation"))
        AppTextField(form.phone, { onChange(form.copy(phone = it)) }, stringResource(R.string.ui_phone), kind = FieldKind.Phone,
            errorText = errors.text(prefix + "phone"))
        AppTextField(form.cnic, { onChange(form.copy(cnic = it.take(ID_MAX))) }, stringResource(R.string.ui_cnic), kind = FieldKind.Phone,
            placeholder = stringResource(R.string.ui_id_hint), errorText = errors.text(prefix + "cnic"), supportingText = stringResource(R.string.ui_optional))
        AppTextField(form.email, { onChange(form.copy(email = it)) }, stringResource(R.string.ui_email), kind = FieldKind.Email,
            errorText = errors.text(prefix + "email"), supportingText = stringResource(R.string.ui_optional))
        AppTextField(form.occupation, { onChange(form.copy(occupation = it)) }, stringResource(R.string.ui_occupation), kind = FieldKind.Title,
            errorText = errors.text(prefix + "occupation"), supportingText = stringResource(R.string.ui_optional))
    }
}

@Composable
fun GenderChips(selected: String, onSelect: (String) -> Unit, error: String?) {
    LabeledChips(
        label = stringResource(R.string.ui_gender),
        options = listOf(
            SwitcherOption("MALE", stringResource(R.string.ui_gender_male)),
            SwitcherOption("FEMALE", stringResource(R.string.ui_gender_female)),
            SwitcherOption("OTHER", stringResource(R.string.ui_gender_other)),
        ),
        selected = selected,
        onSelect = onSelect,
        error = error,
    )
}

@Composable
fun RelationChips(selected: String, onSelect: (String) -> Unit, error: String?) {
    LabeledChips(
        label = stringResource(R.string.ui_relation),
        options = GuardianRelation.entries.map { SwitcherOption(it.name, stringResource(relationLabel(it))) },
        selected = selected,
        onSelect = onSelect,
        error = error,
    )
}

@Composable
private fun LabeledChips(label: String, options: List<SwitcherOption>, selected: String, onSelect: (String) -> Unit, error: String?) {
    Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
        Text(label, style = MaterialTheme.typography.labelMedium, color = if (error != null) AppColors.Error else AppColors.TextSecondary)
        FilterChipRow(options = options, selectedId = selected.ifBlank { null }, onSelect = onSelect)
        error?.let { Text(it, style = MaterialTheme.typography.bodySmall, color = AppColors.Error) }
    }
}

/** Date picker field; value and callback use API `YYYY-MM-DD`. */
@Composable
fun DateField(label: String, value: String, onPick: (String) -> Unit, error: String?, maxDate: String? = null, minDate: String? = null) {
    var open by rememberSaveable { mutableStateOf(false) }
    PickerField(value = formatDate(value.ifBlank { null }).orEmpty(), label = label, onClick = { open = true }, errorText = error)
    if (open) {
        AppDatePickerDialog(
            initialDate = value.ifBlank { null },
            onConfirm = {
                open = false
                onPick(it)
            },
            onDismiss = { open = false },
            maxDate = maxDate,
            minDate = minDate,
        )
    }
}

fun relationLabel(relation: GuardianRelation): Int = when (relation) {
    GuardianRelation.FATHER -> R.string.ui_relation_father
    GuardianRelation.MOTHER -> R.string.ui_relation_mother
    GuardianRelation.GUARDIAN -> R.string.ui_relation_guardian
    GuardianRelation.OTHER -> R.string.ui_relation_other
}

private const val ID_MAX = 15
