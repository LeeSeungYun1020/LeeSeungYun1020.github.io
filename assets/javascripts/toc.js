// Array.from compatibility, 하위 호환성
// Production steps of ECMA-262, Edition 6, 22.1.2.1
if (!Array.from) {
  Array.from = (function () {
    var toStr = Object.prototype.toString;
    var isCallable = function (fn) {
      return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
    };
    var toInteger = function (value) {
      var number = Number(value);
      if (isNaN(number)) {
        return 0;
      }
      if (number === 0 || !isFinite(number)) {
        return number;
      }
      return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
    };
    var maxSafeInteger = Math.pow(2, 53) - 1;
    var toLength = function (value) {
      var len = toInteger(value);
      return Math.min(Math.max(len, 0), maxSafeInteger);
    };

    // The length property of the from method is 1.
    return function from(arrayLike/*, mapFn, thisArg */) {
      // 1. Let C be the this value.
      var C = this;

      // 2. Let items be ToObject(arrayLike).
      var items = Object(arrayLike);

      // 3. ReturnIfAbrupt(items).
      if (arrayLike == null) {
        throw new TypeError(
            'Array.from requires an array-like object - not null or undefined');
      }

      // 4. If mapfn is undefined, then let mapping be false.
      var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
      var T;
      if (typeof mapFn !== 'undefined') {
        // 5. else
        // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
        if (!isCallable(mapFn)) {
          throw new TypeError(
              'Array.from: when provided, the second argument must be a function');
        }

        // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
        if (arguments.length > 2) {
          T = arguments[2];
        }
      }

      // 10. Let lenValue be Get(items, "length").
      // 11. Let len be ToLength(lenValue).
      var len = toLength(items.length);

      // 13. If IsConstructor(C) is true, then
      // 13. a. Let A be the result of calling the [[Construct]] internal method
      // of C with an argument list containing the single item len.
      // 14. a. Else, Let A be ArrayCreate(len).
      var A = isCallable(C) ? Object(new C(len)) : new Array(len);

      // 16. Let k be 0.
      var k = 0;
      // 17. Repeat, while k < len… (also steps a - h)
      var kValue;
      while (k < len) {
        kValue = items[k];
        if (mapFn) {
          A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T,
              kValue, k);
        } else {
          A[k] = kValue;
        }
        k += 1;
      }
      // 18. Let putStatus be Put(A, "length", len, true).
      A.length = len;
      // 20. Return A.
      return A;
    };
  }());
}

// 태그명 이용해 값과 높이 값 가져옴
function getElementsAndHeightByTagName(tag, level = 0) {
  return Array.from(document.getElementsByTagName(tag), it => {
    const dict = {};
    dict["level"] = level
    dict["value"] = it
    dict["height"] = window.pageYOffset + it.getBoundingClientRect().top
    return dict
  })
}

// 현재 위치에 해당하는 TOC element에 클래스 지정
function setNowClass(posY, where) {
  for (const item of where) {
    document.getElementById(
        "toc-" + item["value"]["id"])?.parentElement.classList.remove(
        "post-toc-item-now")
  }

  let checked = false
  for (let i = 1; i < where.length; i++) {
    let now = where[i]
    if (now["height"] >= posY + 10) {
      // add class to preview toc item
      let tocItem = document.getElementById(
          "toc-" + where[i - 1]["value"]["id"])
      if (tocItem) {
        tocItem.parentElement.classList.add("post-toc-item-now")
      } else {
        continue
      }
      checked = true
      break
    }
  }
  // check last toc item
  if (!checked) {
    document.getElementById("toc-" + where[where.length
    - 1]["value"]["id"])?.parentElement.classList.add("post-toc-item-now")
  }
}

function concatHeadings(heading1, heading2, heading3) {
  return heading1.concat(heading2).concat(heading3).sort(
      (a, b) => a["height"] - b["height"])
}

// main
window.onload = () => {
  let heading1 = getElementsAndHeightByTagName("h1", 1)
  let heading2 = getElementsAndHeightByTagName("h2", 2)
  let heading3 = getElementsAndHeightByTagName("h3", 3)
  let heading = concatHeadings(heading1, heading2, heading3)

  setNowClass(window.pageYOffset, heading)
  document.addEventListener('scroll', () => {
    setNowClass(window.pageYOffset, heading)
  })

  window.addEventListener('resize', () => {
    heading1 = getElementsAndHeightByTagName("h1", 1)
    heading2 = getElementsAndHeightByTagName("h2", 2)
    heading3 = getElementsAndHeightByTagName("h3", 3)
    heading = concatHeadings(heading1, heading2, heading3)
  })
}
