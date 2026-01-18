---
layout: post
title: "스마트 캐스트, 언제 적용될까?"
tags: [ "type", "type check", "smart cast" ]
excerpt: "왜 어떤 경우에는 스마트 캐스트되고, 어떤 경우에는 안 될까요? 스마트 캐스트되지 않는 경우 안전하게 사용할 수 있는 방법이 있을까요?"
---

## 들어가기

스마트 캐스트는 컴파일러가 확인하는 시점과 사용하는 시점 사이에 값이 변경되지 않음을 보장하는 경우에만 적용된다.  
타입을 명확하게 구분할 수 있는 경우 자동으로 캐스트되어 불필요한 타입 변환을 줄여준다.

## val 지역 변수

지역 위임(delegated) 프로퍼티를 제외하고는 모두 스마트 캐스트가 적용된다.  
위임 프로퍼티는 getter 호출 시마다 다른 값을 반환할 가능성이 있기 때문이다.

```kotlin
class Some {
    fun calculate(): Any? = listOf("Hello", 33, null).random()
}

fun check() {
    val delegatedValue by lazy { Some().calculate() } // delegated
    if (delegatedValue is String) {
        // Error
        println(delegatedValue.length)
    }
}
```

## val 프로퍼티

프로퍼티가 private, internal이거나 프로퍼티가 선언된 모듈에서 확인하는 경우 스마트 캐스트된다.
이때 프로퍼티는 열려 있지 않고(final) 맞춤 getter가 없어야 한다. 맞춤 getter는 호출 시마다 다른 값을 반환할 수 있기 때문이다.  

- private, internal 가시성 제한
- final 열려 있지 않음
- custom getter 없음

```kotlin
abstract class AbstractClass() {
    abstract val openValue: Int? // open
    val sum: Int? // custom getter
        get() = Some().sum()


    fun check() {
        if (openValue != null) {
            // Error
            println(openValue + 4)
        }

        if (sum != null) {
            // Error
            println(sum + 2)
        }
    }
}
```

## var 지역 변수

지역 변수를 var로 선언하면 때에 따라 캐스트 여부가 다르다.  
스마트 캐스트는 컴파일러가 변경이 없다고 확인되면 적용해 준다.  
다시 말해 확인과 사용 사이에 수정되지 않고 수정 가능한 람다에 캡처되지 않아 변경 가능성이 없으면 스마트 캐스트 된다.


- 값을 확인하는 시점과 사용하는 시점 사이에 수정이 없음
- 람다에서 변수를 수정하지 않음
- 위임 프로퍼티 아님

```kotlin
fun local() {
    var a: Any = "Hello"
    if (a is String) println(a.length) // OK
}
```

변경 가능성이 있는 코드에서는 자동으로 캐스트되지 않아 컴파일 에러가 발생한다.

```kotlin
fun local() {
    var a: Any = 3

    fun change() {
        a = "hello"
    } // 변경 가능

    // Error
    if (a is String) println(a.length)
    change()
    // Error
    if (a is String) println(a.length)
}
```

## var 프로퍼티

값이 바뀔 수 있기 때문에 스마트 캐스트되지 않는다.  
다른 스레드에서 값이 변경될 수도 있기 때문이다.

```kotlin
class MyDialog {
    var a: Any = 1
    var listener: ((name: String, message: String) -> Unit)? = null

    fun onClick() {
        // Error
        if (a is String && a.length > 0) {
            println(a)
        }

        if (listener != null) {
            // Error
            listener.invoke("name", "message")
        }
    }
}
```

## 스마트 캐스트 되지 않는 경우 안전 패턴

안전 호출(safe call) 연산자와 범위 함수(scope function) 조합으로 값을 캡처해서 사용할 수 있다.

- 안전 캐스트: `(a as? T)?.let {}`
- 안전 호출: `a?.let { ... }`, `a?.invoke(...)`
- 지역 변수로 캡처: `val v = a as? T ?: return`

```kotlin
class MyDialog {
    var a: Any = 1
    var listener: ((name: String, message: String) -> Unit)? = null

    fun onClick() {
        // 안전 캐스트
        (a as? String)?.length?.takeIf { it > 0 }?.let(::println)

        // 안전 호출
        listener?.invoke("name", "message")
    }
}
```

위임 프로퍼티도 같은 방법으로 캐스트하여 사용할 수 있다.

```kotlin
class Some {
    fun calculate(): Any? = listOf("Hello", 33, null).random()
}

fun check() {
    val delegatedValue by lazy { Some().calculate() }

    // 안전 캐스트
    delegatedValue?.let { it as? String }?.length?.run(::println)

    // 지역 변수로 캡처
    val str = delegatedValue as? String ?: return
    println(str.length)
}
```

## 정리

스마트 캐스트가 언제 적용되는지 정리해 보면 다음과 같다.  
- 위임 프로퍼티: X
- val 지역 변수: O
- val 프로퍼티: private/internal/프로퍼티가 선언된 모듈에서 검사, final, custom getter 없음
- var 지역 변수: 확인과 사용 시점 사이에 변경 없고 캡처된 람다에서 수정되지 않음
- var 프로퍼티: X
