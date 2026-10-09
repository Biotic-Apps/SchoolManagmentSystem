package com.schoolapp.core.designsystem.component

import androidx.compose.ui.autofill.ContentType
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardCapitalization
import androidx.compose.ui.text.input.KeyboardType
import org.junit.Assert.assertEquals
import org.junit.Assert.assertFalse
import org.junit.Assert.assertNull
import org.junit.Assert.assertTrue
import org.junit.Test

class FieldKindTest {

    @Test
    fun email_uses_email_keyboard_without_autocorrect_or_caps() {
        val options = FieldKind.Email.keyboardOptions(ImeAction.Next)
        assertEquals(KeyboardType.Email, options.keyboardType)
        assertEquals(KeyboardCapitalization.None, options.capitalization)
        assertEquals(false, options.autoCorrectEnabled)
        assertEquals(ImeAction.Next, options.imeAction)
    }

    @Test
    fun keyboard_types_match_the_content() {
        assertEquals(KeyboardType.Phone, FieldKind.Phone.keyboardType)
        assertEquals(KeyboardType.Number, FieldKind.Number.keyboardType)
        assertEquals(KeyboardType.Decimal, FieldKind.Decimal.keyboardType)
        assertEquals(KeyboardType.NumberPassword, FieldKind.OneTimeCode.keyboardType)
        assertEquals(KeyboardType.Password, FieldKind.Password.keyboardType)
        assertEquals(KeyboardType.Password, FieldKind.NewPassword.keyboardType)
        assertEquals(KeyboardType.Uri, FieldKind.Uri.keyboardType)
    }

    @Test
    fun names_capitalise_words_and_notes_capitalise_sentences() {
        assertEquals(KeyboardCapitalization.Words, FieldKind.Name.capitalization)
        assertEquals(KeyboardCapitalization.Sentences, FieldKind.Sentence.capitalization)
        assertTrue(FieldKind.Sentence.autoCorrect)
    }

    @Test
    fun codes_and_credentials_never_autocorrect() {
        listOf(
            FieldKind.Email, FieldKind.Phone, FieldKind.Username, FieldKind.Code,
            FieldKind.OneTimeCode, FieldKind.Password, FieldKind.NewPassword, FieldKind.Number,
        ).forEach { assertFalse(it.name, it.autoCorrect) }
    }

    @Test
    fun autofill_hints_for_credentials_and_codes() {
        assertEquals(ContentType.Username, FieldKind.Username.contentType)
        assertEquals(ContentType.Password, FieldKind.Password.contentType)
        assertEquals(ContentType.NewPassword, FieldKind.NewPassword.contentType)
        assertEquals(ContentType.SmsOtpCode, FieldKind.OneTimeCode.contentType)
        // Phone/email fields usually hold someone else's details (guardians, staff), so no hint.
        assertNull(FieldKind.Phone.contentType)
        assertNull(FieldKind.Email.contentType)
        assertNull(FieldKind.Sentence.contentType)
    }
}
