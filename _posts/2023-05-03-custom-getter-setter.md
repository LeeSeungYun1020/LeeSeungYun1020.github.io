---
layout: post
title: "맞춤 getter와 setter로 함수를 프로퍼티로 바꾸기"
tags: [ "class", "property" ]
excerpt: "가볍고 예측 가능한 작업은 프로퍼티로 바꾸어 직관적인 API를 제공할 수 있습니다."
---

## 들어가기

프로퍼티는 클래스에서 필드와 메소드의 중간 역할을 한다.  
필드처럼 값을 저장하면서 맞춤 getter와 setter를 정의할 수 있으므로 일부 함수는 프로퍼티로 바꾸어 직관적으로 사용할 수 있다.

## 프로퍼티와 함수

- 프로퍼티: 빠름, 부수 효과 없음
- 함수: 느림(네트워크, I/O), 긴 계산, 특정 명령 수행

맞춤 getter와 setter를 정의하면 내부 구현을 감추면서 프로퍼티로 접근하도록 만들 수 있다.

## 유효성 검증

가장 실용적인 활용법으로 setter에서 값을 검증할 때 사용할 수 있다.

```kotlin
class Auth {
    companion object {
        private val EMAIL_REGEX = Regex("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$")
    }

    var email: String = ""
        set(value) {
            require(value.matches(EMAIL_REGEX)) { "Invalid email: $value" }
            field = value
        }
}
```

setter 내에서 원래 저장소를 가리킬 때 `field`라는 식별자를 사용한다.  
email 형식이 검증된 경우에만 값을 설정한다.

```kotlin
class Banner {
    var closeTimeMillis = 0L
        set(value) {
            field = maxOf(value, System.currentTimeMillis())
        }
}
```

종료 시각은 현재 시각 이상으로 설정한다.  
setter에 검증 로직을 추가하여 일관성을 보장할 수 있다.

## 간단한 프로퍼티

계산 값이나 캐싱 값을 설정하거나 반환할 때도 프로퍼티가 유용하다.

```kotlin
class Guild {
    private val players: List<Player> = listOf()
    val count get() = players.size
    val isEmpty get() = players.isEmpty()
    val isFull get() = players.size == 20
}
```

`players`를 외부에 드러내지 않고 계산 값을 반환한다.

```kotlin
class User {
    var token: String
        get() = fetchToken()
        set(value) = updateToken(value)

    private fun fetchToken(): String = TODO()
    private fun updateToken(value: String): Unit = TODO()
}
```

캐싱된 token 값을 설정하거나 반환한다.  
만약 fetchToken이 네트워크 작업이라면 함수로 구현하는 것이 좋다.  
I/O, 네트워크 작업은 getter에 숨기지 않아 성능이나 락, 동시성 문제가 발생하지 않도록 해야 한다.

## 읽기 전용 프로퍼티

내부에서는 값을 변경할 필요가 있는데 외부에 제공할 때는 값을 변경하지 못하도록 하고 싶을 때가 있다.  
setter는 가시성 제어가 가능하므로, private로 정의하여 내부에서 변경할 수 있으면서, 외부에서는 읽기만 가능하게 할 수 있다.

```kotlin
class Auth {
    var email: String = ""
        private set

    fun updateEmail() {
        email = "myEmail@example.com"
    }
}
```

상속 가능한 클래스에서는 가시성을 protected로 제한하면 하위 클래스에서도 변경 가능하게 할 수 있다.

```kotlin
open class Auth {
    var email: String = ""
        protected set
}
```

## 정리

맞춤 getter와 setter를 사용하면 값처럼 보이는 API를 제공하면서 내부 구현을 감출 수 있다.  
프로퍼티 접근은 가볍고 빠르며 예측 가능해야 한다.  
네트워크, I/O 작업같이 무거운 작업은 별도 함수로 분리해야 한다.
