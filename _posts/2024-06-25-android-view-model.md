---
layout: post
title: "ComponentActivity 없이 Android ViewModel 사용하기"
tags: [ "view model", "app architecture", "compatibility" ]
excerpt: "NativeActivity 또는 구형 프로젝트에서 ViewModel을 사용하는 방법과 원리를 분석합니다."
---

## 들어가기

Android에서 ViewModel을 사용할 때 `androidx.lifecycle.ViewModel`을 상속받아 구현하는 것이 일반적이다.  
하지만 lifecycle ViewModel은 `ComponentActivity` 이상을 사용하도록 요구하여
`android.app.Activity` 기반 프로젝트[^1]에서는 lifecycle ViewModel을 상속 받은 ViewModel을 바로 사용할 수 없다.

[^1]: 이전 Android 프로젝트, Unity와 Unreal 같은 Game Engine 프로젝트, NativeActivity 프로젝트 등이 있다.

구체적으로 viewModel 생성을 위임하는 `viewModels` 함수는 `ComponentActivity` 클래스의 확장함수로
`public inline fun <reified VM : ViewModel> ComponentActivity.viewModels` 형태이다.  
`ViewModelProvider` 클래스를 이용하는 방법도 여의치 않은데 생성자가 `ViewModelStore` 또는 `ViewModelStoreOwner`를 인자로 요구하기
때문이다.  
`ComponentActivity`가 `ViewModelStoreOwner`를 구현하고 있기 때문에 `viewModels` 위임 함수를 사용할 때와 동일한 제약이 가해진다.

```kotlin
public interface ViewModelStoreOwner {
    public val viewModelStore: ViewModelStore
}
```

그렇다면 `ComponentActivity`를 사용하지 않는 환경에서는 ViewModel을 어떻게 구성해야 할까?

## 기본 동작

AndroidX 및 lifecycle 라이브러리를 사용할 때, ViewModel이 어떻게 동작하는지 살펴보자.

### ViewModelStoreOwner와 ViewModelStore

`ComponentActivity` 이상에서는 다음과 같이 ViewModel을 생성한다.

```kotlin
private val mainViewModel: MainViewModel by viewModels()
```

`ActivityViewModelLazy.kt` 파일을 보면 `viewModels` 위임 함수 구현을 확인할 수 있다.

```kotlin
@MainThread
public inline fun <reified VM : ViewModel> ComponentActivity.viewModels(
    noinline extrasProducer: (() -> CreationExtras)? = null,
    noinline factoryProducer: (() -> Factory)? = null
): Lazy<VM> {
    val factoryPromise = factoryProducer ?: {
        defaultViewModelProviderFactory
    }

    return ViewModelLazy(
        VM::class,
        { viewModelStore },
        factoryPromise,
        { extrasProducer?.invoke() ?: this.defaultViewModelCreationExtras }
    )
}
```

`ViewModelLazy`는 `ViewModelLazy.kt` 파일에 정의된 함수인데 `storeProducer` 인자로 `viewModelStore`를 전달한다.

```kotlin
public class ViewModelLazy<VM : ViewModel> @JvmOverloads constructor(
    private val viewModelClass: KClass<VM>,
    private val storeProducer: () -> ViewModelStore,
    private val factoryProducer: () -> ViewModelProvider.Factory,
    private val extrasProducer: () -> CreationExtras = { CreationExtras.Empty }
) : Lazy<VM> {
    private var cached: VM? = null

    override val value: VM
        get() {
            val viewModel = cached
            return if (viewModel == null) {
                val store = storeProducer()
                val factory = factoryProducer()
                val extras = extrasProducer()
                ViewModelProvider.create(store, factory, extras)
                    .get(viewModelClass)
                    .also { cached = it }
            } else {
                viewModel
            }
        }

    override fun isInitialized(): Boolean = cached != null
}
```

내부적으로 `ViewModelProvider.create` 함수를 호출하며 이 `viewModelStore`를 전달한다.  
그렇다면 `ComponentActivity`에서는 `viewModelStore`를 어떻게 구현하고 있는걸까?

### ComponentActivity 내부 동작

`ComponentActivity`에서 `viewModelStore`와 관련 있는 부분만 모아 보았다.

```kotlin
open class ComponentActivity() : ViewModelStoreOwner {
    internal class NonConfigurationInstances {
        var custom: Any? = null
        var viewModelStore: ViewModelStore? = null
    }

    private var _viewModelStore: ViewModelStore? = null

    final override fun onRetainNonConfigurationInstance(): Any? {
        // Maintain backward compatibility.
        val custom = onRetainCustomNonConfigurationInstance()
        var viewModelStore = _viewModelStore
        if (viewModelStore == null) {
            // No one called getViewModelStore(), so see if there was an existing
            // ViewModelStore from our last NonConfigurationInstance
            val nc = lastNonConfigurationInstance as NonConfigurationInstances?
            if (nc != null) {
                viewModelStore = nc.viewModelStore
            }
        }
        if (viewModelStore == null && custom == null) {
            return null
        }
        val nci = NonConfigurationInstances()
        nci.custom = custom
        nci.viewModelStore = viewModelStore
        return nci
    }

    override val viewModelStore: ViewModelStore
        get() {
            checkNotNull(application)
            ensureViewModelStore()
            return _viewModelStore!!
        }

    private fun ensureViewModelStore() {
        if (_viewModelStore == null) {
            val nc = lastNonConfigurationInstance as NonConfigurationInstances?
            if (nc != null) {
                // Restore the ViewModelStore from NonConfigurationInstances
                _viewModelStore = nc.viewModelStore
            }
            if (_viewModelStore == null) {
                _viewModelStore = ViewModelStore()
            }
        }
    }
}
```

`viewModelStore`를 get하면 `ensureViewModelStore` 함수가 호출된다.  
`_viewModelStore`가 null이면 `lastNonConfigurationInstance`가 있는지 확인하여 복구하거나 새로 생성한다.  
`lastNonConfigurationInstance`는 `onRetainNonConfigurationInstance` 함수에서 유지할 데이터를 저장한다.

## Activity에서 데이터 유지

비슷하게 `android.app.Activity`를 상속한 클래스와 뷰모델을 다음과 같이 구성해 볼 수 있다.

```kotlin
data class RetainedData(val data: Map<String, Any>)
class AViewModel {
    // 유지할 데이터
    val retainedData: RetainedData
        get() = RetainedData(mapOf("key" to "value", "Some" to 11))

    fun init(retainedData: RetainedData?) {
        if (retainedData != null) {
            // 데이터 복구
            Log.d("LSYD", "init: $retainedData")
        }
    }
}

class LActivity : Activity() {
    private val viewModel: AViewModel = AViewModel()

    override fun onRetainNonConfigurationInstance(): Any {
        // viewModel에서 유지가 필요한 데이터 가져온다.
        return viewModel.retainedData
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        // 복구할 데이터를 viewModel에 전달한다.
        viewModel.init(lastNonConfigurationInstance as? RetainedData)
    }
}
```

하지만, `Activity`를 직접 수정할 수 있는 경우, `ComponentActivity`나 `AppCompatActivity`를 상속받도록 수정하면 되는 일이다.  
`ComponentActivity`를 사용할 수 없는 환경에서 표시될 수 있도록 Fragment를 만들어 제공해야 한다면 어떻게 해야 할까?

## Fragment에서 데이터 유지

`Fragment.viewModels` 확장함수에서는 `createViewModelLazy` 함수를 통해 ViewModel을 반환한다.

```kotlin
@MainThread
public inline fun <reified VM : ViewModel> Fragment.viewModels(
    noinline ownerProducer: () -> ViewModelStoreOwner = { this },
    noinline factoryProducer: (() -> Factory)? = null
): Lazy<VM> {
    val owner by lazy(LazyThreadSafetyMode.NONE) { ownerProducer() }
    return createViewModelLazy(
        VM::class,
        { owner.viewModelStore },
        {
            (owner as? HasDefaultViewModelProviderFactory)?.defaultViewModelCreationExtras
                ?: CreationExtras.Empty
        },
        factoryProducer ?: {
            (owner as? HasDefaultViewModelProviderFactory)?.defaultViewModelProviderFactory
                ?: defaultViewModelProviderFactory
        })
}
```

owner의 기본값은 ownerProducer에서 this로 전달한 fragment이다.  
activity에서와 같이 Fragment에서 viewModelStore를 어떻게 사용하고 있는지 살펴보자.

```java
public class Fragment implements ComponentCallbacks, OnCreateContextMenuListener, LifecycleOwner,
    ViewModelStoreOwner, HasDefaultViewModelProviderFactory, SavedStateRegistryOwner,
    ActivityResultCaller {
  // ...

  FragmentManager mFragmentManager;

  // ...

  @NonNull
  @Override
  public ViewModelStore getViewModelStore() {
    if (mFragmentManager == null) {
      throw new IllegalStateException("Can't access ViewModels from detached fragment");
    }
    if (getMinimumMaxLifecycleState() == Lifecycle.State.INITIALIZED.ordinal()) {
      throw new IllegalStateException("Calling getViewModelStore() before a Fragment "
          + "reaches onCreate() when using setMaxLifecycle(INITIALIZED) is not "
          + "supported");
    }
    return mFragmentManager.getViewModelStore(this);
  }
}
```

Fragment에서는 mFragmentManager에서 viewModelStore를 가져와 반환하기만 한다.  
FragmentManager로 가보자.

```java
public abstract class FragmentManager implements FragmentResultOwner {

  private FragmentManagerViewModel mNonConfig;

  @NonNull
  ViewModelStore getViewModelStore(@NonNull Fragment f) {
    return mNonConfig.getViewModelStore(f);
  }

  @NonNull
  private FragmentManagerViewModel getChildNonConfig(@NonNull Fragment f) {
    return mNonConfig.getChildNonConfig(f);
  }

  void attachController(@NonNull FragmentHostCallback<?> host,
      @NonNull FragmentContainer container, @Nullable final Fragment parent) {
    // ...
    // Get the FragmentManagerViewModel
    if (parent != null) {
      mNonConfig = parent.mFragmentManager.getChildNonConfig(parent);
    } else if (host instanceof ViewModelStoreOwner) {
      ViewModelStore viewModelStore = ((ViewModelStoreOwner) host).getViewModelStore();
      mNonConfig = FragmentManagerViewModel.getInstance(viewModelStore);
    } else {
      mNonConfig = new FragmentManagerViewModel(false);
    }
    // Ensure that the state is in sync with FragmentManager
    mNonConfig.setIsStateSaved(isStateSaved());
    mFragmentStore.setNonConfig(mNonConfig);
    // ...
  }
}
```

부모가 있다면 부모에게서 nonConfig를 가져오고, Fragment의 host에게서 가져온다.  
host가 ViewModelStoreOwner를 구현하지 않는다면 `FragmentManagerViewModel(false)`로 FragmentManagerViewModel을 생성한다.

```java
final class FragmentManagerViewModel extends ViewModel {

  @NonNull
  static FragmentManagerViewModel getInstance(ViewModelStore viewModelStore) {
    ViewModelProvider viewModelProvider = new ViewModelProvider(viewModelStore,
        FACTORY);
    return viewModelProvider.get(FragmentManagerViewModel.class);
  }

  private final HashMap<String, Fragment> mRetainedFragments = new HashMap<>();
  private final HashMap<String, FragmentManagerViewModel> mChildNonConfigs = new HashMap<>();
  private final HashMap<String, ViewModelStore> mViewModelStores = new HashMap<>();

  FragmentManagerViewModel(boolean stateAutomaticallySaved) {
    mStateAutomaticallySaved = stateAutomaticallySaved;
  }

  @NonNull
  FragmentManagerViewModel getChildNonConfig(@NonNull Fragment f) {
    FragmentManagerViewModel childNonConfig = mChildNonConfigs.get(f.mWho);
    if (childNonConfig == null) {
      childNonConfig = new FragmentManagerViewModel(mStateAutomaticallySaved);
      mChildNonConfigs.put(f.mWho, childNonConfig);
    }
    return childNonConfig;
  }

  @NonNull
  ViewModelStore getViewModelStore(@NonNull Fragment f) {
    ViewModelStore viewModelStore = mViewModelStores.get(f.mWho);
    if (viewModelStore == null) {
      viewModelStore = new ViewModelStore();
      mViewModelStores.put(f.mWho, viewModelStore);
    }
    return viewModelStore;
  }

  void clearNonConfigState(@NonNull Fragment f, boolean destroyChildNonConfig) {
    if (FragmentManager.isLoggingEnabled(Log.DEBUG)) {
      Log.d(TAG, "Clearing non-config state for " + f);
    }
    clearNonConfigStateInternal(f.mWho, destroyChildNonConfig);
  }

  void clearNonConfigState(@NonNull String who, boolean destroyChildNonConfig) {
    if (FragmentManager.isLoggingEnabled(Log.DEBUG)) {
      Log.d(TAG, "Clearing non-config state for saved state of Fragment " + who);
    }
    clearNonConfigStateInternal(who, destroyChildNonConfig);
  }
}
```

`FragmentManagerViewModel`은 `ViewModelStore`를 매핑, 저장한다.  
`Fragment`의 `ViewModelStore`는 상위 Fragment 또는 Host Activity의 `ViewModelStore`로 관리된다.

앞에서 살펴 보았듯, Activity는 `onRetainNonConfigurationInstance` 함수를 통해 `ViewScope`를 보존한다.  
구성이 변경되어도 `FragmentManagerViewModel`이 유지되므로 Fragment의 `viewModelStore`도 유지된다.

Activity가 `ViewModelStoreOwner`가 아니거나, `onRetainNonConfigurationInstance`를 통해 상태를 유지해주지 않으면 하위
Fragment들도 ViewModel을 정상적으로 유지할 수 없게 된다.  
이렇게 생각해 보면 Activity에서 뭔가를 해주지 않으면 어쩌지 못하는 것 아닌가 싶다.

## 방법 1: lifecycle-viewmodel 사용 가능 환경

ViewModel 동작의 핵심은 ViewModelStore이다.    
`ViewModelStore`가 구성 변경 시 살아남을 수 있다면 ViewModel이 동작할 수 있다.

### 보관용 Fragment

Activity는 수정할 수 없으므로, 보관용 Fragment 하나를 유지하여 ViewModelStore를 들고 있게 해보았다.

```kotlin
// android.app.Fragment 사용
class LFragment : Fragment(), ViewModelStoreOwner {
    override val viewModelStore: ViewModelStore = ViewModelStore()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        retainInstance = true // Fragment 인스턴스 유지
    }

    override fun onDestroy() {
        super.onDestroy()
        if (activity?.isChangingConfigurations != true) {
            viewModelStore.clear()
        }
    }

    companion object {
        private const val TAG = "lib_vm_holder"

        internal fun of(fm: android.app.FragmentManager): LFragment {
            (fm.findFragmentByTag(TAG) as? LFragment)?.let { return it }
            val holder = LFragment()
            fm.beginTransaction().add(holder, TAG).commitAllowingStateLoss()
            fm.executePendingTransactions()
            return holder
        }
    }
}
```

기존 ViewModel에서와 같이, 구성 변경 시에는 데이터가 유지되지만 프로세스 종료 시에는 복구되지 않는다.  
프로세스가 종료되어 앱이 재시작되면 FragmentManager 자체 상태가 초기화되어 보관용 Fragment도 사라지기 때문이다.

### 보관용 Fragment 사용 예시

Androidx가 아닌 `android.app.Fragment` 계열에서 보관용 Fragment를 이용하여 ViewModel을 사용하는 예시이다.

```kotlin
internal class AViewModel : ViewModel() {
    private val _count = MutableStateFlow(0)
    val count = _count.asStateFlow()

    fun click() {
        _count.value += 1
    }
}

class AFragment : DialogFragment() {
    private var _binding: TestBinding? = null
    private val binding get() = _binding!!
    private var uiStateJob: Job? = null
    private val viewModel: AViewModel by lazy {
        val holder = LFragment.of(childFragmentManager)
        ViewModelProvider.create(holder.viewModelStore)[AViewModel::class.java]
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        LFragment.of(childFragmentManager)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        _binding = TestBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.button.setOnClickListener { viewModel.click() }
    }

    override fun onStart() {
        super.onStart()
        uiStateJob = CoroutineScope(Dispatchers.Main.immediate).launch {
            viewModel.count.collectLatest { count ->
                binding.text.text = "Count: $count"
            }
        }
    }

    override fun onStop() {
        super.onStop()
        uiStateJob?.cancel()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}
```

유의할 점은 `AFragment`는 `LFragment`를 상속 받는게 아니라는 점이다.  
`LFragment`는 UI와 분리된 보관용 Fragment로 `retainInstance = true`로 상태를 유지한다.  
`AFragment`는 일반적 Fragment의 생명주기를 따르며, `AFragment`가 제거되고 다른 Fragment가 추가되어도 `LFragment`는 유지되어
ViewModel 공유가 가능하다.

> [!NOTE]
> 덧붙여 viewModel에서 stateFlow를 사용할 때는 onStart에 작업을 시작하여 변경 사항을 수신하고 onStop에서 작업을 취소하도록 구성하였다.  
> viewLifecycleOwner가 있는 androidx.fragment에서는 다음과 같이 사용할 수 있었을 것이다.
> ```kotlin
> override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
> 	super.onViewCreated(view, savedInstanceState)
> 	viewLifecycleOwner.lifecycleScope.launch {
> 		viewLifecycleOwner.repeatOnLifecycle(Lifecycle.State.STARTED) {
> 			viewModel.count.collectLatest { count ->
> 				binding.text.text = "Count: $count"
> 			}
> 		}
> 	}
> }
> ```

처음 목표로 했던 바와 같이, 이 Fragment는 Activity, ComponentActivity, AppCompatActivity 등 어떤 Activity를 사용하는
환경에서도 정상 표시 가능하다.

## 방법 2: AndroidX가 사용 불가능한 환경

AndroidX 라이브러리조차 사용할 수 없다면, ViewModel 구현에 사용된 일부 구현을 참고하여 Store를 저장하고 관리하는 로직을 구현해야 한다.

### 보관용 Fragment 수정

앞서 lifecycle-viewmodel 사용 가능 환경에서와 같이 보관용 Fragment인 LFragment를 이용하는 아이디어를 유지한다.  
여기에 viewModelStore를 관리할 수 있는 로직을 추가한다.

```kotlin
class LFragment : Fragment() {
    internal val storeId = UUID.randomUUID().toString()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        retainInstance = true // Fragment 인스턴스 유지
    }

    override fun onDestroy() {
        super.onDestroy()
        if (activity?.isChangingConfigurations != true) {
            LViewModelStoreHolder.clear(storeId)
        }
    }

    companion object {
        private const val TAG = "lib_vm_holder"

        internal fun of(fm: android.app.FragmentManager): LFragment {
            (fm.findFragmentByTag(TAG) as? LFragment)?.let { return it }
            val holder = LFragment()
            fm.beginTransaction().add(holder, TAG).commitAllowingStateLoss()
            fm.executePendingTransactions()
            return holder
        }
    }
}
```

### ViewModelStore 관리

ViewModelStore 관리는 android의 메인 스레드가 하나라는 점을 이용하여 동시성 문제를 회피한다.  
`of` 함수의 `get`, `put`과 `clear` 함수의 `remove`는 동시에 실행되지 않는다.

```kotlin
object LViewModelStoreHolder {
    private val providers = mutableMapOf<String, LViewModelProvider>()

    fun of(storeId: String): LViewModelProvider {
        checkMain()
        return providers.getOrPut(storeId) { LViewModelProvider(storeId) }
    }

    fun clear(storeId: String) {
        checkMain()
        providers.remove(storeId)?.clear()
    }

    private fun checkMain() = check(Looper.myLooper() == Looper.getMainLooper())
}

class LViewModelProvider internal constructor(private val storeId: String) {
    private val map = mutableMapOf<KClass<out LViewModel>, LViewModel>()

    operator fun <T : LViewModel> get(klass: KClass<T>): T =
        map.getOrPut(klass) { instantiate(klass) } as T

    fun clear() {
        map.values.forEach { it.onCleared() }
        map.clear()
    }

    private fun <T : LViewModel> instantiate(kc: KClass<T>): T {
        // factory 메서드 호출 시도
        companionFactory(kc)?.let { return it.create() }

        // 인자 없는 생성자 호출 시도
        return runCatching {
            kc.java.getDeclaredConstructor().apply {
                isAccessible = true
            }.newInstance()
        }.getOrElse {
            error("No factory(companion) or no-arg constructor for ${kc.qualifiedName}")
        }
    }

    private fun <T : LViewModel> companionFactory(kc: KClass<T>): LViewModel.LFactory<T>? {
        return try { // Companion
            kc.java.getDeclaredField("Companion").apply {
                isAccessible = true
            }.get(null)
        } catch (_: Throwable) { // $Companion.INSTANCE
            runCatching {
                kc.java.declaredClasses
                    .firstOrNull { it.simpleName == "Companion" }
                    ?.getDeclaredField("INSTANCE")
                    ?.apply { isAccessible = true }
                    ?.get(null)
            }.getOrNull()
        } as? LViewModel.LFactory<T>
    }

    companion object {
        fun create(storeId: String): LViewModelProvider = LViewModelStoreHolder.of(storeId)
    }
}

interface LViewModel {
    fun onCleared() {}

    fun interface LFactory<T : LViewModel> {
        fun create(): T
    }
}
```

### Custom ViewModel 사용 예시

```kotlin
class BViewModel : LViewModel {
    private val _count = MutableStateFlow(0)
    val count = _count.asStateFlow()

    fun click() {
        _count.value += 1
    }

    companion object : LViewModel.LFactory<BViewModel> {
        override fun create() = BViewModel()
    }
}

class BFragment : DialogFragment() {
    private var _binding: TestBinding? = null
    private val binding get() = _binding!!
    private var uiStateJob: Job? = null
    private val viewModel: BViewModel by lazy {
        val holder = LFragment.of(childFragmentManager)
        LViewModelProvider.create(holder.storeId)[BViewModel::class]
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        LFragment.of(childFragmentManager)
    }

    override fun onCreateView(
        inflater: LayoutInflater,
        container: ViewGroup?,
        savedInstanceState: Bundle?,
    ): View? {
        _binding = TestBinding.inflate(inflater, container, false)
        return binding.root
    }

    override fun onViewCreated(view: View, savedInstanceState: Bundle?) {
        super.onViewCreated(view, savedInstanceState)
        binding.button.setOnClickListener { viewModel.click() }
    }

    override fun onStart() {
        super.onStart()
        uiStateJob = CoroutineScope(Dispatchers.Main.immediate).launch {
            viewModel.count.collectLatest { count ->
                binding.text.text = "Count: $count"
            }
        }
    }

    override fun onStop() {
        super.onStop()
        uiStateJob?.cancel()
    }

    override fun onDestroyView() {
        super.onDestroyView()
        _binding = null
    }
}

```

### ViewModelScope 구현

그렇다면 viewModelScope는 어떻게 사용할 수 있을까?  
AndroidX의 viewModelScope 구현을 살펴보면, createViewModelScope 함수로 scope가 구성된다.

```kotlin
internal const val VIEW_MODEL_SCOPE_KEY =
    "androidx.lifecycle.viewmodel.internal.ViewModelCoroutineScope.JOB_KEY"

internal fun createViewModelScope(): CloseableCoroutineScope {
    val dispatcher =
        try {
            // In platforms where `Dispatchers.Main` is not available, Kotlin Multiplatform will
            // throw
            // an exception (the specific exception type may depend on the platform). Since there's
            // no
            // direct functional alternative, we use `EmptyCoroutineContext` to ensure that a
            // coroutine
            // launched within this scope will run in the same context as the caller.
            Dispatchers.Main.immediate
        } catch (_: NotImplementedError) {
            // In Native environments where `Dispatchers.Main` might not exist (e.g., Linux):
            EmptyCoroutineContext
        } catch (_: IllegalStateException) {
            // In JVM Desktop environments where `Dispatchers.Main` might not exist (e.g., Swing):
            EmptyCoroutineContext
        }
    return CloseableCoroutineScope(coroutineContext = dispatcher + SupervisorJob())
}


public val ViewModel.viewModelScope: CoroutineScope
get() =
    synchronized(VIEW_MODEL_SCOPE_LOCK) {
        getCloseable(VIEW_MODEL_SCOPE_KEY)
            ?: createViewModelScope().also { scope ->
                addCloseable(VIEW_MODEL_SCOPE_KEY, scope)
            }
    }

private val VIEW_MODEL_SCOPE_LOCK = SynchronizedObject()
```

함수에서는 Dispatchers.Main.immediate + SupervisorJob()가 반환된다.  
Android에는 Main scope가 존재하므로 Dispatchers.Main.immediate가 dispatcher 변수에 할당되기 때문이다.  
ViewModel에서 동일한 scope를 구성해 볼 수 있다.

```kotlin
class CViewModel : LViewModel {
    private val scope = CoroutineScope(Dispatchers.Main.immediate + SupervisorJob())

    fun getData() {
        scope.launch {
            // Get data
        }
    }

    override fun onCleared() {
        scope.cancel()
    }
}
```

## 정리

ComponentActivity 구현을 사용할 수 없는 환경에 Fragment를 제공해야 할 때, 어떻게 ViewModel을 사용할 수 있는지 살펴보았다.  
lifecycle-viewmodel 라이브러리를 사용할 수 있다면 ViewModelStore를 유지하는 보관용 Fragment를 만들어 ViewModel을 사용할 수 있었다.  
라이브러리 사용이 불가능한 경우에는 ViewModelStore와 ViewModelProvider를 추가 구현하여 Custom ViewModel을 사용할 수 있었다.

내용을 간단하게 정리해 보면 다음과 같다.

| 구분                | 방법 1: lifecycle-viewmodel 사용 가능 환경                                               | 방법 2: AndroidX 불가 환경                                               |
|-------------------|----------------------------------------------------------------------------------|--------------------------------------------------------------------|
| 전제 조건             | AndroidX 라이브러리 사용 가능                                                             | AndroidX 사용 불가(구형 Activity/Fragment 환경)                            |
| 핵심 아이디어           | 보관용 Fragment를 `ViewModelStoreOwner`로 두어 ViewModel 유지                             | 보관용 Fragment + 커스텀 `ViewModelStoreHolder` / `ViewModelProvider` 구현 |
| ViewModel 생성      | lifecycle-viewmodel 그대로 활용(`ViewModelProvider.create(holder.viewModelStore)` 사용) | 커스텀(`LViewModelProvider.create(holder.storeId)[VM::class]` 사용)     |
| ViewModelStore 유지 | Fragment의 `retainInstance = true` 활용                                             | Fragment + 커스텀 Store 관리(Map 기반, main thread 사용)                    |
| Scope 처리          | lifecycle-viewmodel `viewModelScope` 사용                                          | `SupervisorJob` 기반 커스텀 Scope 구현                                    |
| 장점                | lifecycle-viewmodel 그대로 활용                                                       | AndroidX 의존 없이 동일한 개념 구현                                           |

제한된 환경에서 개발을 진행하는 것은 어렵고 짜증나는 일일 수 있다.  
그러나 라이브러리 내부 원리를 들여다보면, 비슷하게나마 우리 상황에 맞는 해결책을 찾아낼 수 있다.
