import "url-search-params-polyfill";

// URLから指定したパラメータを取得する。パラメータが見つからなければ null を返す
export function getUrlParam(param_name) {
    const params = new URLSearchParams(window.location.search);
    return params.get(param_name);
}
