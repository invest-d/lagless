// https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/find#Polyfill
export function definePolyfill() {
    if (!Array.prototype.find) {
        Object.defineProperty(Array.prototype, "find", {
            value: function(predicate) {
                if (this == null) {
                    throw TypeError('"this" is null or not defined');
                }

                const o = Object(this);
                const len = o.length >>> 0;

                if (typeof predicate !== "function") {
                    throw TypeError("predicate must be a function");
                }

                const thisArg = arguments[1];
                let k = 0;

                while (k < len) {
                    const kValue = o[k];
                    if (predicate.call(thisArg, kValue, k, o)) {
                        return kValue;
                    }
                    k++;
                }

                return undefined;
            },
            configurable: true,
            writable: true
        });
    }
}
