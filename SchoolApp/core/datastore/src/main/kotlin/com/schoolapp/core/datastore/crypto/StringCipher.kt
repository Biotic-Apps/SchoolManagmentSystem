package com.schoolapp.core.datastore.crypto

interface StringCipher {
    fun encrypt(plain: String): String

    /** Returns null when the value cannot be decrypted (e.g. key was invalidated). */
    fun decrypt(encoded: String): String?
}
