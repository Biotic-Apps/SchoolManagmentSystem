package com.schoolapp.demo

/**
 * Phone-code sign-in without a backend: the demo parent's phone gets a fake SMS and the fixed code
 * [CODE] signs in as the demo parent. Any other phone goes to the real server.
 */
internal object DemoOtp {
    const val PHONE = "03001234567"
    const val CODE = "123456"
    const val RESEND_AFTER_SECONDS = 60

    private const val COUNTRY_PREFIX = "92"

    /** Accepts `03001234567`, `+92 300 1234567`, `0092-300-1234567` and similar spellings. */
    fun isDemoPhone(phone: String): Boolean {
        val digits = phone.filter(Char::isDigit).removePrefix("00")
        val national = if (digits.startsWith(COUNTRY_PREFIX)) "0" + digits.removePrefix(COUNTRY_PREFIX) else digits
        return national == PHONE
    }

    fun accepts(phone: String, code: String): Boolean = isDemoPhone(phone) && code.trim() == CODE
}
