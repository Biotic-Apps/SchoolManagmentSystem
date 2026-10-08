package com.schoolapp.core.data.academics

import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.model.academics.ClassSetup
import com.schoolapp.core.model.academics.ClassSubject
import com.schoolapp.core.model.academics.ClassSubjectInput
import com.schoolapp.core.model.academics.NewSection
import com.schoolapp.core.model.academics.SectionChange

/** Classes, their sections and curriculum (`classes.add/edit/delete`), same endpoints as the web Classes pages. */
interface ClassStructureRepository {
    /** Appended after the last class; returns the new class id. */
    suspend fun createClass(schoolId: String, name: String, levelOrder: Int): AppResult<String>
    suspend fun renameClass(classId: String, name: String): AppResult<Unit>
    suspend fun reorderClasses(classIds: List<String>): AppResult<Unit>
    suspend fun classSetup(classId: String, branchId: String, sessionId: String?): AppResult<ClassSetup>

    /** Whole curriculum in order; 409 SUBJECT_IN_USE when a removed subject is still taught. */
    suspend fun setClassSubjects(classId: String, items: List<ClassSubjectInput>): AppResult<List<ClassSubject>>
    suspend fun addSection(section: NewSection): AppResult<Unit>
    suspend fun updateSection(sectionId: String, change: SectionChange): AppResult<Unit>

    /** 409 SECTION_IN_USE when students are enrolled. */
    suspend fun archiveSection(sectionId: String): AppResult<Unit>
}
