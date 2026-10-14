package com.schoolapp.feature.exams.skillsetup

import androidx.compose.runtime.Immutable
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.schoolapp.core.common.result.AppError
import com.schoolapp.core.common.result.AppResult
import com.schoolapp.core.data.auth.AuthRepository
import com.schoolapp.core.data.exams.skillsetup.SkillConfig
import com.schoolapp.core.data.exams.skillsetup.SkillConfigRepository
import com.schoolapp.core.model.exams.SkillDomain
import com.schoolapp.core.model.exams.SkillItem
import com.schoolapp.core.model.exams.SkillLevel
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.filterNotNull
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import java.util.UUID
import javax.inject.Inject

@Immutable
data class ItemDraft(val key: String = newKey(), val id: String = "", val domain: SkillDomain, val name: String = "")

@Immutable
data class LevelDraft(val key: String = newKey(), val code: String = "", val label: String = "")

@Immutable
data class SkillSetupDraft(
    val items: List<ItemDraft>,
    val levels: List<LevelDraft>,
    val invalidKeys: Set<String> = emptySet(),
    val tooFewLevels: Boolean = false,
    val isSaving: Boolean = false,
    val error: AppError? = null,
)

@Immutable
data class SkillSetupState(
    val config: SkillConfig? = null,
    val loadError: AppError? = null,
    val canEdit: Boolean = false,
    val draft: SkillSetupDraft? = null,
    val saved: Boolean = false,
)

/** Branch behaviour & skills setup (web SkillSetupDialog): items per domain and the rating scale. */
@HiltViewModel
class SkillSetupViewModel @Inject constructor(
    private val repository: SkillConfigRepository,
    authRepository: AuthRepository,
) : ViewModel() {

    private val _state = MutableStateFlow(SkillSetupState())
    val state: StateFlow<SkillSetupState> = _state.asStateFlow()

    private var branchId: String? = null

    init {
        viewModelScope.launch {
            val session = authRepository.session.filterNotNull().first()
            _state.update { it.copy(canEdit = session.has("exams.edit")) }
        }
    }

    fun start(branchId: String?) {
        if (branchId == null || branchId == this.branchId) return
        this.branchId = branchId
        load()
    }

    fun load() {
        val id = branchId ?: return
        viewModelScope.launch {
            when (val result = repository.config(id)) {
                is AppResult.Success -> _state.update { it.copy(config = result.data, loadError = null) }
                is AppResult.Failure -> _state.update { it.copy(loadError = result.error) }
            }
        }
    }

    fun open() = _state.update { state ->
        val config = state.config ?: return@update state
        if (!state.canEdit) return@update state
        state.copy(
            saved = false,
            draft = SkillSetupDraft(
                items = config.items.map { ItemDraft(id = it.id, domain = it.domain, name = it.name) },
                levels = config.scale.map { LevelDraft(code = it.code, label = it.label) },
            ),
        )
    }

    fun dismiss() = _state.update { if (it.draft?.isSaving == true) it else it.copy(draft = null) }

    fun addItem(domain: SkillDomain) = edit { it.copy(items = it.items + ItemDraft(domain = domain)) }

    fun renameItem(key: String, name: String) = edit { d -> d.copy(items = d.items.map { if (it.key == key) it.copy(name = name.take(NAME_MAX)) else it }) }

    fun removeItem(key: String) = edit { d -> d.copy(items = d.items.filterNot { it.key == key }) }

    /** Moves an item up (-1) or down (+1) within its domain. */
    fun moveItem(key: String, by: Int) = edit { d ->
        val item = d.items.firstOrNull { it.key == key } ?: return@edit d
        val same = d.items.filter { it.domain == item.domain }.toMutableList()
        val index = same.indexOf(item)
        val target = index + by
        if (target !in same.indices) return@edit d
        same.removeAt(index)
        same.add(target, item)
        d.copy(items = d.items.filter { it.domain != item.domain } + same)
    }

    fun addLevel() = edit { it.copy(levels = it.levels + LevelDraft()) }

    fun editLevel(key: String, code: String? = null, label: String? = null) = edit { d ->
        d.copy(levels = d.levels.map { if (it.key == key) it.copy(code = code?.take(CODE_MAX) ?: it.code, label = label?.take(LABEL_MAX) ?: it.label) else it })
    }

    fun removeLevel(key: String) = edit { d -> d.copy(levels = d.levels.filterNot { it.key == key }) }

    fun save() {
        val draft = _state.value.draft ?: return
        val id = branchId ?: return
        if (draft.isSaving) return
        val invalid = SkillSetupRules.invalidKeys(draft)
        val tooFew = draft.levels.size !in MIN_LEVELS..MAX_LEVELS
        if (invalid.isNotEmpty() || tooFew) return _state.update { it.copy(draft = draft.copy(invalidKeys = invalid, tooFewLevels = tooFew)) }
        _state.update { it.copy(draft = draft.copy(isSaving = true, error = null, invalidKeys = emptySet(), tooFewLevels = false)) }
        viewModelScope.launch {
            val items = draft.items.map { SkillItem(it.id, it.domain, it.name) }
            val scale = draft.levels.map { SkillLevel(0, it.code, it.label) }
            when (val result = repository.save(id, items, scale)) {
                is AppResult.Success -> _state.update { it.copy(config = result.data, draft = null, saved = true) }
                is AppResult.Failure -> _state.update { it.copy(draft = it.draft?.copy(isSaving = false, error = result.error)) }
            }
        }
    }

    private fun edit(transform: (SkillSetupDraft) -> SkillSetupDraft) =
        _state.update { state -> state.draft?.let { state.copy(draft = transform(it).copy(invalidKeys = emptySet(), tooFewLevels = false)) } ?: state }

    private companion object {
        const val NAME_MAX = 60
        const val CODE_MAX = 4
        const val LABEL_MAX = 40
        const val MIN_LEVELS = 2
        const val MAX_LEVELS = 10
    }
}

internal object SkillSetupRules {
    private const val NAME_MIN = 2

    /** Items with a too-short or repeated name (per domain); levels with an empty or repeated code or empty label. */
    fun invalidKeys(draft: SkillSetupDraft): Set<String> = buildSet {
        val names = mutableSetOf<String>()
        draft.items.forEach { item ->
            val name = item.name.trim()
            if (name.length < NAME_MIN || !names.add("${item.domain}:${name.lowercase()}")) add(item.key)
        }
        val codes = mutableSetOf<String>()
        draft.levels.forEach { level ->
            val code = level.code.trim().uppercase()
            if (code.isEmpty() || level.label.isBlank() || !codes.add(code)) add(level.key)
        }
    }
}

private fun newKey() = UUID.randomUUID().toString()
