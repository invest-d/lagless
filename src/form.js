import $ from "jquery";
import "url-search-params-polyfill";
const params = new URLSearchParams(window.location.search);

import * as app from "./app";

$(async () => {
    const data = await app.getConstructorData(params.get("c"));
    if (Object.keys(data).length === 0) {
        $("#error").text("不正なパラメータです.").show();
        return;
    }

    app.show(data, params);
    $("#content").show();
    $("#float_act").show();
});
