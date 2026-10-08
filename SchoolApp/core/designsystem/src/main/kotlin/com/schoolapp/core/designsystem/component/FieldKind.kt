package com.schoolapp.core.designsystem.component

import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType

/** What a text field holds; picks the keyboard, capitalisation, autocorrect and autofill hint. */
enum class FieldKind(
    val keyboardType: KeyboardType,
    val capitalization: KeyboardCapitalization,
    val autoCorrect: Boolean,
) {
    /** Short free text such as a title or subject. */
    Text(KeyboardType.Text, KeyboardCapitalization.Sentences, autoCorrect = true),

    /** Notes, descriptions, comments and messages. */
    Sentence(KeyboardType.Text, KeyboardCapitalization.Sentences, autoCorrect = true),

    /** A person's name. */
    Name(KeyboardType.Text, KeyboardCapitalization.Words, autoCorrect = false),

    /** Place, school or other proper names. */
    Title(KeyboardType.Text, KeyboardCapitalization.Words, autoCorrect = true),

    Email(KeyboardType.Email, KeyboardCapitalization.None, autoCorrect = false),
    Phone(KeyboardType.Phone, KeyboardCapitalization.None, autoCorrect = false),

    /** Sign-in identifier: email or phone. */
    Username(KeyboardType.Email, KeyboardCapitalization.None, autoCorrect = false),

    /** Whole numbers: marks, roll numbers, counts. */
    Number(KeyboardType.Number, KeyboardCapitalization.None, autoCorrect = false),

    /** Amounts and measurements. */
    Decimal(KeyboardType.Decimal, KeyboardCapitalization.None, autoCorrect = false),

    /** Numeric one-time code or PIN, hidden digits keyboard. */
    OneTimeCode(KeyboardType.NumberPassword, KeyboardCapitalization.None, autoCorrect = false),

    /** Letters-and-digits codes: reset tokens, recovery codes, admission numbers. */
    Code(KeyboardType.Ascii, KeyboardCapitalization.None, autoCorrect = false),

    Password(KeyboardType.Password, KeyboardCapitalization.None, autoCorrect = false),
    NewPassword(KeyboardType.Password, KeyboardCapitalization.None, autoCorrect = false),
    Uri(KeyboardType.Uri, KeyboardCapitalization.None, autoCorrect = false),
    ;

    fun keyboardOptions(imeAction: ImeAction): KeyboardOptions = KeyboardOptions(
        capitalization = capitalization,
        autoCorrectEnabled = autoCorrect,
        keyboardType = keyboardType,
        imeAction = imeAction,
    )

    /**
     * Autofill hint for the system password manager / SMS code autofill, or null when none applies.
     * Name, Email and Phone mostly hold someone else's details (a student, guardian or staff member),
     * so they get no hint: autofill would paste the signed-in user's own saved details into them.
     * Sign-in fields use [Username].
     */
    val contentType: ContentType?
        get() = when (this) {
            Username -> ContentType.Username
            OneTimeCode -> ContentType.SmsOtpCode
            Password -> ContentType.Password
            NewPassword -> ContentType.NewPassword
            else -> null
        }
}
