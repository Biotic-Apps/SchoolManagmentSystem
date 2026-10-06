package com.schoolapp.demo

import com.schoolapp.core.model.RoleKey
import com.schoolapp.core.model.RoleRef
import com.schoolapp.core.model.common.PersonRef

/** Who "the demo user" is in Phase 3 records, per previewed role. */
internal object DemoActors {
    val teacher = PersonRef("demo-u-teacher", "Demo Teacher")
    val helper = PersonRef("demo-u-helper", "Demo Helper")
    val probationTeacher = PersonRef("demo-u-newteacher", "Kamran Ali")
    val parent = PersonRef("demo-g-1", "Imran Khan")
    val principal = PersonRef("demo-u-principal", "Amina Sheikh")
    val coordinator = PersonRef("demo-u-coordinator", "Sana Iqbal")
    val superAdmin = PersonRef("demo-u-admin", "Demo Admin")

    fun forRole(role: RoleRef?): PersonRef = when (role) {
        RoleKey.TEACHER -> teacher
        RoleKey.HELPER -> helper
        RoleKey.PARENT -> parent
        RoleKey.PRINCIPAL -> principal
        RoleKey.COORDINATOR, RoleKey.HEAD_TEACHER -> coordinator
        RoleKey.SUPER_ADMIN -> superAdmin
        else -> PersonRef("demo-user", "Demo User")
    }

    fun sectionLabel(sectionId: String): String? =
        DemoPeopleData.sections.firstOrNull { it.id == sectionId }?.let { "${it.className}-${it.name}" }
}
