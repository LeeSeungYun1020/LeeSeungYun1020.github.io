
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}

      var $parcel$global = globalThis;
    
var $parcel$modules = {};
var $parcel$inits = {};

var parcelRequire = $parcel$global["parcelRequirea28d"];

if (parcelRequire == null) {
  parcelRequire = function(id) {
    if (id in $parcel$modules) {
      return $parcel$modules[id].exports;
    }
    if (id in $parcel$inits) {
      var init = $parcel$inits[id];
      delete $parcel$inits[id];
      var module = {id: id, exports: {}};
      $parcel$modules[id] = module;
      init.call(module.exports, module, module.exports);
      return module.exports;
    }
    var err = new Error("Cannot find module '" + id + "'");
    err.code = 'MODULE_NOT_FOUND';
    throw err;
  };

  parcelRequire.register = function register(id, init) {
    $parcel$inits[id] = init;
  };

  $parcel$global["parcelRequirea28d"] = parcelRequire;
}

var parcelRegister = parcelRequire.register;
parcelRegister("7qU6Y", function(module, exports) {

$parcel$export(module.exports, "trimIndent", () => $8924a49b7593d1a2$export$24703bf258c93379);
$parcel$export(module.exports, "dedent", () => $8924a49b7593d1a2$export$1d81801f981b61e);
function $8924a49b7593d1a2$export$24703bf258c93379(template) {
    const lines = template.split("\n");
    const minIndent = Math.min(...lines.filter((line)=>line.trim().length > 0).map((line)=>line.match(/^(\s*)/)[0].length));
    return lines.map((line)=>line.slice(minIndent)).join("\n").trim();
}
function $8924a49b7593d1a2$export$1d81801f981b61e(strings, ...values) {
    const fullString = strings.map((str, i)=>str + (values[i] || "")).join("");
    return $8924a49b7593d1a2$export$24703bf258c93379(fullString);
}

});


parcelRequire("7qU6Y");

//# sourceMappingURL=utils.js.map
