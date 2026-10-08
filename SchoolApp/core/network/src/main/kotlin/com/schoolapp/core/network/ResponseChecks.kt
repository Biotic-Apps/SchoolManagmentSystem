package com.schoolapp.core.network

import retrofit2.HttpException
import retrofit2.Response

/** For bodiless (204) endpoints declared as `Response<Unit>`: turns a 4xx/5xx into the HttpException [ApiCaller] maps. */
fun Response<*>.requireSuccess() {
    if (!isSuccessful) throw HttpException(this)
}
