---
layout: post
title: "확장 함수와 상속"
tags: [ "class", "extension", "extension function", "inheritance" ]
---

# 확장 함수와 상속

## 들어가기

interface나 상속할 수 있는 open class에 확장 함수를 정의할 때는 주의가 필요하다.  
확장 함수는 정적으로 적용되기 때문에 컴파일 시점에 리시버 타입을 이용하여 어떤 함수가 호출될지 결정된다.  
다시 말해 상속 관계에서 확장 함수를 하위 클래스에 추가로 정의할 경우 의도와 다른 함수가 호출되는 결과가 발생할 수 있다.  

## 상속에서 잘못된 확장 함수 사용

예를 들어 다음 코드를 살펴보자.  

```kotlin
open class Shape
class Rectangle : Shape()

fun Shape.getName() = "Shape"
fun Rectangle.getName() = "Rectangle"

fun printClassName(s: Shape) {
	println(s.getName())
}

fun main() {
	// "Rectangle"이 아닌 "Shape"를 출력한다.
	printClassName(Rectangle())
	// Rectangle, Shape 모두 "Shape"가 된다.
	listOf(Rectangle(), Shape()).forEach {
		println(it.getName())
	}
}
```

하위 클래스에 확장 함수를 정의하였더라도 컬렉션을 이용할 때와 같이 상위 타입으로 참조하는 경우가 있기 때문에 해당 함수가 호출되는 것이 보장되지 않는다.  
확장 함수는 정적 디스패치라 선언된 타입에 따라 호출할 함수가 컴파일 시 미리 결정되기 때문이다.

확장 프로퍼티에서도 동일한 문제가 발생한다.

```kotlin
open class Shape
class Rectangle : Shape()

val Shape.name get() = "Shape"
val Rectangle.name get() = "Rectangle"

fun main() {
	listOf(Shape(), Rectangle()).forEach { println(it.name) }
}
```

## 방법 1: 멤버 함수 정의

직접 선언한 클래스에 새로운 기능을 추가하고자 할 때는 멤버 함수 정의가 가능하다.  
하위 클래스에서 다른 동작을 수행하도록 하는 것이 목적이므로 확장 함수가 아닌 멤버 함수로 정의하는 것은 타당하다.  
`open fun`으로 멤버 함수를 정의하면 하위 클래스에서 `override` 가능하다.  
상속 계층 전반에 공통적인 기능 수행이 필요할 때, 상위 타입 하나에 확장을 정의하자.  

```kotlin
// 수정 가능한 클래스
open class A {
	open fun printName() {
		println("A")
	}
}
class B : A() {
	override fun printName() {
		println("B")
	}
}
class C : A() {
	override fun printName() {
		println("C")
	}
}

fun main() {
	listOf(A(), B(), C()).forEach { it.printName() }
}
```

동일 시그니처가 있으면 멤버 함수가 확장 함수보다 우선 호출된다.  
설령 클래스 멤버 함수와 동일한 시그니처의 확장 함수를 정의하더라도 멤버 함수가 호출된다.  
다음 코드를 추가하더라도 멤버 함수에 정의된 대로 A, B, C 각각이 정상적으로 출력된다.  

```kotlin
fun A.printName() {
	println("I'm A!!")
}
```

## 방법 2: 최상위 클래스에만 확장 함수 정의

시스템, 외부 라이브러리에 선언된 클래스라 멤버 함수 정의가 불가능한 클래스라면 어떻게 해야할까?  
이런 외부 클래스라면 필요한 범위의 최상위 클래스 하나에만 확장 함수를 정의하여 내부적으로 타입을 구분하는 방법을 생각해 볼 수 있다.  


```kotlin
// 시스템, 외부 라이브러리 등에 있어 수정 불가능한 클래스
open class A
class B : A()
class C : A()

// 다른 파일
internal fun A.printName() {
	when(this) {
		is B -> println("B")
		is C -> println("C")
		else -> println("A")
	}
}

fun main() {
	listOf(A(), B(), C()).forEach { it.printName() }
}
```

최상위 클래스인 A에만 확장 함수를 추가하여 내부에서 타입을 구분하도록 했다.  
확장 함수는 internal로 선언하여 scope를 제한하여 모듈 내에서만 사용하도록 제한하였다.  
만약 B.printName(), C.printName() 같이 하위 타입에 확장 함수를 추가하였다면 의도와 다르게 작동했을 것이다.  


## 정리

확장 함수는 정적으로 적용되므로 상속 계층에서 상위 타입으로 참조될 때는 하위 타입 확장이 선택되지 않는다.  
수정 가능한 클래스에서는 멤버 함수로, 수정 불가능한 외부 클래스에는 불가피한 경우에만 최상위 타입에 하나의 확장을 추가하자.  
이미 동일한 시그니처의 멤버가 있다면 멤버 함수가 확장 함수보다 우선 호출된다. 확장 함수로 멤버 함수를 덮어쓰려 하지 말자.
