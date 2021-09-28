export const replaceFullWidthNumbers = (str) => {
    return str.replace(/[\uff10-\uff19]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
};

/**
* @summary { hoge: XXX, foo: XXX, bar: XXX, ... }の配列から組み合わせが重複しているものを削除して返す
* @param {Object[]} pairs
* @param {string[]} keys - 重複を判定するpairのkey
* @return {Object[]} pairsから重複を取り除いたもの。keysで指定したkeyだけを含む。
*/
export const getUniqueCombinations = (pairs, keys) => {
    const DELIMITER = String.fromCharCode("31");
    return Array.from(new Map(
        pairs.map((p) => {
            const mapKey = keys.map((k) => p[k]).join(DELIMITER);
            const mapVal = ((p, keys) => {
                const obj = {};
                for (const k of keys) {
                    obj[k] = p[k];
                }
                return obj;
            })(p, keys);
            // returnのイメージは下記の通り
            // return [`${p.hoge}${DELIMITER}${p.foo}`, p];
            return [mapKey, mapVal];
        })
    ).values());
};
