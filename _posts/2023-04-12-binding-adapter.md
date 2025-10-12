---
layout: post
title: "Android 데이터 바인딩에서 바인딩 어댑터 사용하기"
excerpt: "바인딩 어댑터로 레이아웃 파일에서 복잡한 표현식을 분리하는 방법과 다양한 활용 사례를 소개합니다."
tags: [ "binding", "app architecture", "data binding", "binding adapter" ]
---

## 데이터 바인딩과 바인딩 어댑터

레이아웃 파일에서 `app:` 네임스페이스로 선언한 속성(attribute)은 데이터 바인딩 시점에 매칭 가능한 바인딩 어댑터가 있으면 자동으로 호출된다.  
`@BindingAdapter` 애너테이션을 사용하여 바인딩 어댑터를 정의하면, XML에서 해당 속성에 맞는 어댑터 함수를 자동으로 호출해 주는 식이다.  
이때, 표현식과 어댑터 함수 인자가 서로 매칭되는 타입을 사용해야 한다.

## 바인딩 식과 바인딩 어댑터

간단한 데이터 객체를 가공 없이 사용할 때는 바인딩 식을 이용하여 바로 사용할 수 있다.  
데이터 오브젝트를 이용하여 import 및 변수를 선언하면 된다.

```xml
<TextView
  android:layout_width="wrap_content"
  android:layout_height="wrap_content"
  android:text="@{user.firstName}"/>
```

바인딩 어댑터는 바인딩 식을 간결화하고 코드상에서 동작을 표현하기 위한 기능이다.  
바인딩 식이 제공하는 연산자나 리스너 바인딩을 사용하면 꽤 복잡한 기능도 구현이 가능하다.  
하지만 복잡한 식이나 이벤트 핸들링 때문에 레이아웃 파일을 읽고 유지관리하기 어렵게 된다.  
바인딩 어댑터는 마치 Kotlin의 확장 함수같이 View에 새 속성을 추가해 줄 수 있다.  
레이아웃 파일에서 복잡한 표현식을 줄이고 UI 관련 코드를 분리할 수 있다.

## 사용 방법

### 파라미터 추가하기

어댑터 함수를 정의할 때는 `@BindingAdapter` 애너테이션을 추가하고 첫 번째 인자로 대상 View, 다음 인자로 XML 상에서 입력할 파라미터 값을 받으면 된다.

```kotlin
@BindingAdapter("boardType")
fun setBoardImage(
    imageView: ImageView,
    boardType: String?,
) {
    imageView.setImageResource(
        when (boardType) {
            "notice" -> R.drawable.ic_board_notice
            "event" -> R.drawable.ic_board_event
            "survey" -> R.drawable.ic_board_survey
            else -> R.drawable.ic_board_default
        }
    )
}
```

xml에서 boardType 속성을 지정하면 바인딩 어댑터가 호출되어 해당 이미지가 표시될 것이다.

```xml
<data>
  <import type="com.example.app.model.Board"/>
  <variable
    name="board"
    type="Board"/>
</data>

<ImageView
    android:id="@+id/type_icon"
    android:layout_width="16dp"
    android:layout_height="16dp"
    android:src="@drawable/ic_board_default"
    android:visibility="@{board != null && board.isEmpty() ? View.GONE : View.VISIBLE }"
    app:boardType="@{board.type}"
    app:layout_constraintBottom_toBottomOf="parent"
    app:layout_constraintEnd_toEndOf="parent"
    app:layout_constraintStart_toStartOf="parent"
    app:layout_constraintTop_toTopOf="parent"/>
```

### 여러 파라미터 조합하기

여러 요소를 한꺼번에 받아 처리하도록 구성할 수도 있다.  
예를 들어 앞의 예시에서 대체 이미지를 지정할 수 있도록 `placeholder`를 추가할 수 있다.

```kotlin
@BindingAdapter(value = ["boardType", "placeholder"])
fun setBoardImage(
    imageView: ImageView,
    boardType: String?,
    placeholder: Drawable?,
) {
    val resource = when (boardType) {
        "notice" -> R.drawable.ic_board_notice
        "event" -> R.drawable.ic_board_event
        "survey" -> R.drawable.ic_board_survey
        else -> null
    }

    if (resource != null) {
        imageView.setImageResource(resource)
    } else if (placeholder != null) {
        imageView.setImageDrawable(placeholder)
    } else {
        imageView.setImageResource(R.drawable.ic_board_default)
    }
}
```

### width, height 지정하기

width, height 속성을 데이터 바인딩으로 적용하려면 오류가 발생한다.  
바인딩 라이브러리에서 자동으로 제공하지 않아[^1] 별도의 바인딩 어댑터를 만들어 사용해야 한다.

[^1]: https://issuetracker.google.com/issues/37054474

```kotlin
/**
 * layout_width 옵션을 사용자 지정
 *
 * @param width 너비 `MATCH_PARENT`, `WRAP_CONTENT`, `MATCH_CONSTRAINT` 또는 정확한 사이즈
 */
@BindingAdapter("android:layout_width")
fun setWidth(view: View, width: Number) {
    view.updateLayoutParams { this.width = width.toInt() }
}

/**
 * layout_height 옵션을 사용자 지정
 *
 * @param height 높이 `MATCH_PARENT`, `WRAP_CONTENT`, `MATCH_CONSTRAINT` 또는 정확한 사이즈
 */
@BindingAdapter("android:layout_height")
fun setHeight(view: View, height: Number) {
    view.updateLayoutParams { this.height = height.toInt() }
}
```

편의상 `android:` 네임스페이스의 `layout_width`, `layout_height`를 직접 수정하였지만 `android:` 네임스페이스를 직접 지정하는 것은 권장되지 않으므로 주의가 필요하다.  

### ConstraintLayout에서 dimension ratio 지정하기

ConstraintLayout의 dimension ratio도 XML 상에서 조절할 수 있다.

```kotlin
/**
 * Constraint layout의 constraintDimensionRatio 옵션을 사용자 지정
 *
 * @param ratio 지정할 비율 "XX:XX", "h,XX:XX", "w,XX:XX"
 */
@BindingAdapter("layout_constraintDimensionRatio")
fun setConstraintDimensionRatio(view: View, ratio: String) {
    if (view.parent is ConstraintLayout) {
        view.updateLayoutParams<ConstraintLayout.LayoutParams> {
            dimensionRatio = ratio
        }
    }
}
```

# 정리

바인딩 어댑터로 바인딩 식을 레이아웃 파일에서 분리할 수 있다.  
레이아웃 파일에 복잡한 식이 모두 위치할 때보다 개발과 유지보수가 훨씬 쉬워졌다.

하지만 바인딩 어댑터로 분리할 필요 없이 View 단에 해당 코드가 포함하면 안 될까?  
특정 View에서 반복적으로 쓰이는 코드라면 View 확장 함수로 분리하는 방법도 생각해 볼 수 있다.  
ViewModel에 비즈니스 로직을 분리하여 데이터 처리를 깔끔하게 해둔다면 레이아웃에 복잡한 표현식이 들어갈 이유는 줄어든다.  
View 단에는 UI 배치와 관련된 약간의 로직만으로 레이아웃을 표시하기 충분할 수 있다.

데이터 바인딩 기능은 강력하지만, 과연 작성된 코드도 강력한지 생각해 볼 필요가 있다.  
라이브러리가 주는 이점은 득하고 단점은 담지 말아야 한다.  
레이아웃이 지나치게 복잡해지지 않도록 균형을 잡는 것이 중요하다고 생각한다.  
