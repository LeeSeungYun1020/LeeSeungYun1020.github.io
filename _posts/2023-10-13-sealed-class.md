---
layout: post
title: "sealed class와 interface"
tags: [ "class", "sealed class", "sealed interface" , "control flow" ]
---

# sealed class와 interface

## sealed class, interface

sealed 클래스와 인터페이스를 사용하면 상속 구조를 내부로 제한할 수 있다.  
컴파일러가 sealed의 직접 하위 타입 전체를 컴파일 시점에 알고 검사할 수 있다.

이런 조건을 만족하기 위해 하위 클래스는 같은 모듈, 패키지에 정의되어야 한다.  
상위 타입 내부에도 하위 타입을 정의할 수 있어 관련 클래스를 묶어 관리할 수 있다.

sealed를 사용하면 상속이 외부에 닫혀 있어 변경 영향 범위가 좁고 when 식에서 컴파일 타임에 빠짐없이 분기할 수 있어 편리하다.

주의할 점으로 sealed 제약은 각 sealed 타입의 직접 하위 타입에만 적용된다.  
중간 계층에서 바로 위 상위 타입이 sealed라면 그 타입의 직접 하위에 동일한 제약이 다시 적용되고,  
sealed가 아니라면 컴파일러가 닫힌 계층을 볼 수 없어 when 식에서 완전성(exhaustive)을 보장 받을 수 없다.

## 사용 예시

### UI State

사용자가 동의 상태를 확인하고 변경할 수 있는 UI를 구성할 때 다음과 같이 sealed interface를 사용하여 상태를 정의할 수 있다.

```kotlin
internal sealed interface AgreementUiState {
    data object Loading : AgreementUiState
    data class Initial(val agreement: Enable) : AgreementUiState
    data class Update(val agreement: Enable, val message: String) : AgreementUiState
    data class Error(val request: Enable, val title: String, val message: String) : AgreementUiState
}
```

data object는 object의 단일 인스턴스 특성을 유지하면서 toString, equals, hashCode를 자동 생성하여 컬렉션 사용/디버깅/로깅 시 편리하다.
여기에서 Loading과 같이 상태를 나타내는 객체가 하나만 필요할 때 사용할 수 있다.

ViewModel에서는 상태를 관리하고, UI에서는 상태에 따라 다른 화면을 표시할 수 있다.

먼저 ViewModel 코드에서는 네트워크 통신을 통해 정책을 가져오거나 변경하고 있다.
작업 수행 전 Loading 상태로 변경하고 작업 성공 여부에 따라 Initial, Update, Error 상태로 변경한다.

```kotlin
internal class PolicyViewModel {
    private val manager = PolicyManager()
    private val _uiState = MutableStateFlow<AgreementUiState>(AgreementUiState.Loading)
    val uiState: StateFlow<AgreementUiState> = _uiState.asStateFlow()

    fun initPolicy() {
        _uiState.value = AgreementUiState.Loading
        viewModelScope.launch {
            manager.getPolicy().onSuccess { enable ->
                _uiState.value = AgreementUiState.Initial(enable)
            }.onFailure { error ->
                _uiState.value = AgreementUiState.Error(
                    request = Enable.Agree,
                    title = "정책 확인 실패",
                    message = error.message.orEmpty()
                )
            }
        }
    }

    fun enablePolicy() {
        _uiState.value = AgreementUiState.Loading
        viewModelScope.launch {
            manager.enablePolicy().onSuccess { (enable, at) ->
                _uiState.value = AgreementUiState.Update(enable, "정책 동의: $at")
            }.onFailure { error ->
                _uiState.value = AgreementUiState.Error(
                    request = Enable.Agree,
                    title = "정책 동의 실패",
                    message = error.message.orEmpty()
                )
            }
        }
    }

    fun disablePolicy() {
        _uiState.value = AgreementUiState.Loading
        viewModelScope.launch {
            manager.disablePolicy().onSuccess { (enable, at) ->
                _uiState.value = AgreementUiState.Update(enable, "정책 거부: $at")
            }.onFailure { error ->
                _uiState.value = AgreementUiState.Error(
                    request = Enable.Disagree,
                    title = "정책 거부 실패",
                    message = error.message.orEmpty()
                )
            }
        }
    }
}
```

다음으로 UI에서 상태에 따라 UI를 표시한다.

```kotlin
class APolicyDialog : DialogFragment() {
    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        viewLifecycleOwner.lifecycleScope.launch {
            viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
                viewModel.uiState.collectLatest { state ->
                    when (state) {
                        AgreementUiState.Loading -> onLoading()
                        is AgreementUiState.Initial -> onInitial(state)
                        is AgreementUiState.Update -> onUpdate(state)
                        is AgreementUiState.Error -> onError(state)
                    }
                }
            }
        }
    }
}
```

여기에서 when은 식으로 사용되어 완전성을 보장받았다.  
될 수 있으면 else는 사용하지 않는 편이 좋다.  
새로운 상태가 추가되면 컴파일러가 누락된 상태를 알려주므로 실수로 상태 처리를 빠뜨리는 일을 막을 수 있기 때문이다.

### Option

앱 설정값을 나타내는 Option 클래스를 구성하였다.

```kotlin
sealed class Option(
    val key: String,
    val items: List<String>,
    val addable: Boolean = false,
) {
    val default get() = items.firstOrNull() ?: ""
}

data object ServerEnvironmentOption : Option(
    key = "ServerEnvironment", items = listOf("Live", "QA", "Alpha")
)

data object StoreTypeOption : Option(
    key = "StoreType", items = listOf("play", "galaxy", "one")
)

data object ServerUrlOption : Option(
    key = "ServerUrl",
    items = listOf("https://api.example.com", "https://test-api.example.com"),
    addable = true
)
```

모든 option 리스트를 구성할 때는 옵션 추가 시 수동으로 추가할 수 있고,  
성능에 영향을 크게 받지 않는 환경에서는 리플랙션을 이용하여 전체 subclass를 획득할 수도 있다.

```kotlin
sealed class Option(/* ... */) {
    companion object {
        val all: List<Option> = listOf(ServerEnvironmentOption, StoreTypeOption, ServerUrlOption)
    }
}
```

리플랙션을 사용하면 정의한 클래스를 빠짐없이 포함할 수 있겠지만 용량과 실행 비용이 커질 수 있으므로 직접 리스트로 구성하는 편이 좋다.

```kotlin
val options: List<Option> =
    Option::class.sealedSubclasses
        .mapNotNull { it.objectInstance }
        .sortedBy { it.key }
```

## 정리

sealed를 사용하면 직접 하위 타입을 컴파일 시간에 고정하여 상속 구조를 제한하고, when 식에서 완전성을 보장 받을 수 있다.  
특히 UI 상태 관리 같은 유한 집합 처리에 유용하며, 새로운 상태가 추가되면 컴파일러가 누락을 잡아 실수로 처리를 빠뜨리는 일을 방지한다.
