/*
    kintoneアプリのスキーマをjson形式で取得する。
    （どこかのアプリのカスタマイズjsとして利用するスクリプトではない）

    1. ブラウザからkintoneにログイン
    2. kintone内のページを開く
    3. DevToolsのConsoleを開く
    4. Consoleで下記スクリプトを実行する
    5. スキーマ情報を得られる

    実行結果をテキストファイルに保存して、開発版アプリと本番アプリでフィールドの設定などに差異が無いかを確かめたりする用途に使える。
*/

const app = 999;
// レイアウト情報のうち、widthおよびheightは揃える手段がないため、比較対象から外す
const del_W_H = (obj) => {
    const deleted = {};
    Object.keys(obj).forEach((key) => {
        if (Object.prototype.toString.call(obj[key]) === "[object Object]") {
            deleted[key] = del_W_H(obj[key]);
        } else if (Object.prototype.toString.call(obj[key]) === "[object Array]") {
            const deleted_child = [];
            (obj[key]).forEach((child_obj) => {
                deleted_child.push(del_W_H(child_obj));
            });
            deleted[key] = deleted_child;
        } else if ((key !== "width") && (key !== "height")) {
            deleted[key] = obj[key];
        }
    });
    return deleted;
};
// 一覧情報のうち、一覧そのもののidは揃える手段がないため、比較対象から外す
const del_view_id = (obj) => {
    Object.keys(obj.views).forEach((view) => {
        delete obj.views[view].id;
    });
};
const getting = (async (app) => {
    const [fields, layout, views] = await Promise.all([
        kintone.api(kintone.api.url("/k/v1/app/form/fields", true), "GET", { app: app }),
        kintone.api(kintone.api.url("/k/v1/app/form/layout", true), "GET", { app: app }),
        kintone.api(kintone.api.url("/k/v1/preview/app/views", true), "GET", { app: app })
    ]);

    del_view_id(views);

    delete fields.revision;
    delete layout.revision;
    delete views.revision;

    return {
        fields: fields,
        layout: del_W_H(layout),
        views: views,
    };
})(app);
const sort_object = (unordered) => {
    const ordered = {};
    Object.keys(unordered).sort().forEach((key) => {
        if (Object.prototype.toString.call(unordered[key]) === "[object Object]") {
            ordered[key] = sort_object(unordered[key]);
        } else {
            ordered[key] = unordered[key];
        }
    });
    return ordered;
};
getting.then((resp) => console.log(JSON.stringify(sort_object(resp), null, "  ")));
