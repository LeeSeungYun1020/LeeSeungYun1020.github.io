---
layout: post
title: "Android 바인딩 사용하기"
tags: [ "binding", "app architecture", "view binding", "data binding" ]
---

## binding 사용 방법

Android에서 바인딩(ViewBinding과 DataBinding)을 사용할 때 Activity와 Fragment에서 사용하는 방법이 다르다.  
특히 Fragment에서 사용할 때 바인딩 객체를 정리해 주어야 하는 부분이 있어 내용을 정리하게 되었다.  
Activity와 Fragment에서의 사용법을 간단하게 정리해 보면 다음과 같다.

- Activity - lateinit property
- Fragment - nullable backing property

## Activity에서 binding 사용하기

### lateinit property

binding 객체를 생성할 때는 LayoutInflater가 필요하다.  
LayoutInflater는 Activity 객체 생성 시점이 아닌 onCreate 시점에서 사용할 수 있으므로,    
lateinit 프로퍼티로 선언 후 onCreate 시점에 초기화해 사용한다.

```kotlin
class MainActivity : Activity() {
    private lateinit var binding: ActivityMainBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)
    }
}
```

### lazy property

위임 프로퍼티(by lazy)를 사용해도 기능상으로 문제없으나
lazy 프로퍼티를 그냥 사용하면 연산 중 동기화에 따른 약간의 오버헤드가 추가[^1]된다.  
lazy 프로퍼티로 선언하려면 `LazyThreadSafetyMode.NONE`로 설정하여야 한다.  

```kotlin
class MainActivity : Activity() {
    private val binding: ActivityMainBinding by lazy(LazyThreadSafetyMode.NONE) {
        ActivityMainBinding.inflate(layoutInflater)
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(binding.root)
    }
}
```

[^1]: https://kotlinlang.org/docs/delegated-properties.html#lazy-properties

## Fragment에서 binding 사용하기

### nullable backing property

Activity와 유사하게 Fragment도
Fragment 객체 생성 시점이 아닌 FragmentManager에 부착된 이후에
LayoutInflater를 사용할 수 있어 Fragment 생성 시점에 초기화는 불가능하다.

Fragment에서는 View 생명주기와 Fragment 생명주기가 다르기 때문에 nullable property 사용이 필요[^2]하다.  
Fragment에서 View가 사라질 때 binding은 더는 View에 대한 참조가 필요하지 않으므로,  
binding reference를 View가 파괴되는 시점(onDestroyView)에 정리[^3]해 주어야 한다.  
이렇게 Fragment의 View 참조를 제거하여 garbage가 수집되도록 한다.

[^2]: https://developer.android.com/topic/libraries/view-binding#fragments

[^3]: https://developer.android.com/guide/fragments/lifecycle#fragment_created_and_view_destroyed

backing property를 이용하여 nullable property를 별도로 관리하면 nullable 타입 사용에 따른 불편을 제거할 수 있다.  
binding 프로퍼티는 onCreateView에서 대입해 준 뒤부터 onDestroyView에서 null을 대입하기 전까지 유효하다.

```kotlin
class HomeFragment : Fragment() {
    private var _binding: FragmentHomeBinding? = null
    private val binding get() = _binding!!

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?
    ): View {
        _binding = FragmentHomeBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)

        binding.apply {
            appBar.init()
            menuRecycler.update()
        }
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

### non-null property

Fragment에서 non-null property를 그냥 사용하면 위험하다.  
Activity에서와 같이 lateinit non-null property를 사용하면 Fragment가 View를 해제한 뒤에도 binding 레퍼런스가 남아 메모리가 정리되지
않을 수 있다.  
Fragment의 생명주기는 Fragment 내 View의 생명주기와 차이가 있으므로 onCreateView/onDestroyView 주기에 맞춰 관리되어야 한다.

## RecyclerView의 Adapter에서 binding 사용하기

Adapter의 onCreateViewHolder 시점에 parent.context에서 LayoutInflater를 얻어 바인딩 객체를 생성하여 ViewHolder에 전달하면
된다.

```kotlin
internal class MenuAdapter(
    private val onClick: (Menu) -> Unit,
) : ListAdapter<Menu, MenuAdapter.MenuViewHolder>(DiffCallback()) {

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): MenuViewHolder {
        return MenuViewHolder(
            MenuItemBinding.inflate(
                LayoutInflater.from(parent.context), parent, false
            ), onClick
        )
    }

    override fun onBindViewHolder(holder: MenuViewHolder, position: Int) {
        holder.bind(getItem(position))
    }

    class MenuViewHolder(
        private val binding: MenuItemBinding,
        private val onClick: (Menu) -> Unit,
    ) : RecyclerView.ViewHolder(binding.root) {
        private lateinit var menu: Menu

        init {
            binding.root.setOnClickListener {
                onClick(menu)
            }
        }

        fun bind(menu: Menu) {
            this.menu = menu
            binding.apply {
                icon.setImageResource(menu.icon)
                title.text = menu.title
            }
        }
    }

    class DiffCallback : DiffUtil.ItemCallback<Menu>() {
        override fun areItemsTheSame(oldItem: Menu, newItem: Menu): Boolean =
            oldItem.id == newItem.id
        override fun areContentsTheSame(oldItem: Menu, newItem: Menu): Boolean = oldItem == newItem
    }
}
```

## 정리

Activity에서 binding을 사용할 때는 lateinit property를 이용하여 선언하고 onCreate에서 초기화한다.  
Fragment에서 binding을 사용할 때는 nullable backing property를 사용해 onCreateView에서 초기화한다.
이후 onDestroyView에서 null을 대입하여 참조를 제거해야 한다.