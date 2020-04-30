/*
    Version 1
    クラウドサイン却下になったレコードを削除するボタンをレコード詳細画面に設置する。
    回収アプリ上でのレコードを削除するとともに、申込アプリにおける回収IDの紐づけも解消する。
    また、回収の親レコードに集約している情報も適切に処理する。
*/

(function () {
    "use strict";

    const APP_ID = ((app_id) => {
        switch(app_id) {
        // 開発版の回収アプリ
        case 160:
            return {
                APPLY: 159,
                COLLECT: 160
            };

            // 本番の回収アプリ
        case 162:
            return {
                APPLY: 161,
                COLLECT: 162
            };
        default:
            console.warn(`Unknown app: ${  app_id}`);
        }
    })(kintone.app.getId());

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordNo_COLLECT = "レコード番号";
    const fieldStatus_COLLECT = "collectStatus";
    const statusRejected_COLLECT = "クラウドサイン却下・再作成待ち";
    const fieldParent_COLLECT = "parentCollectRecord";
    const statusParent_COLLECT = "true";
    const fieldConstructionShopId_COLLECT = "constructionShopId";
    const fieldClosingDate_COLLECT = "closingDate";

    const APP_ID_APPLY = APP_ID.APPLY;
    const fieldRecordNo_APPLY = "レコード番号";
    const fieldCollectId_APPLY = "collectId";

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton()) {
            const button = createRejectCollectRecordButton(event.record);
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 増殖バグ防止
        const not_displayed = document.getElementById("getCollectable") === null;

        return not_displayed;
    }

    function createRejectCollectRecordButton(showing_record) {
        const getRejectCollect = document.createElement("button");
        getRejectCollect.id = "rejectCollect";
        getRejectCollect.innerText = "クラウドサイン再送信用にレコードを削除する";
        getRejectCollect.addEventListener("click", clickRejectCollectRecord.bind(null, showing_record));
        return getRejectCollect;
    }

    // ボタンクリック時の処理を定義
    async function clickRejectCollectRecord(showing_record) {
        // 却下されたレコードでのみ動作
        const rejected = (showing_record[fieldStatus_COLLECT]["value"] === statusRejected_COLLECT);
        if (!rejected) {
            alert("削除するには、このレコードの状態を一度却下にして保存してからもう一度操作してください。");
            return;
        }

        const clicked_ok = confirm("申込レコードと回収レコードの結びつきを解除し、\n回収レコードを削除しますか？");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        try {
            // これから削除するレコードが親レコードかどうかによって削除の挙動を変更する
            if (showing_record[fieldParent_COLLECT]["value"] === statusParent_COLLECT) {
                // 親を削除する場合。子レコードのうち最も番号が小さいものを見つけてくる
                const new_parent = getNewParentRecord(
                    showing_record[fieldConstructionShopId_COLLECT]["value"],
                    showing_record[fieldClosingDate_COLLECT]["value"]
                );

                // 見つけてきた子レコードを親にして、旧親の情報を押し付ける
                await imporseParent(new_parent, showing_record);
            } else {
                // 子を削除する場合。親を見つけてくる
                const parent = getParentRecord(
                    showing_record[fieldConstructionShopId_COLLECT]["value"],
                    showing_record[fieldClosingDate_COLLECT]["value"]
                );

                // 親に集約している情報のうち、自分自身の情報を引く
                await removeChildData(parent, showing_record);
            }

            const detail_ids = await getDetailApplies(showing_record[fieldRecordNo_COLLECT]["value"])
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードに紐づく申込レコードの取得中にエラーが発生しました。");
                });

            await deleteCollectIdField(detail_ids.records)
                .catch((err) => {
                    console.error(err);
                    throw new Error("申込レコードの回収IDの削除中にエラーが発生しました。");
                });

            await deleteCollectRecord(showing_record[fieldRecordNo_COLLECT]["value"])
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードの削除中にエラーが発生しました。\n今開いているレコード詳細画面から手動で削除してください。\nその後、不要な申込レコードを「保留中」にした後で、債権譲渡契約準備を開始ボタンを再び押してください。");
                });

            alert("回収IDの紐づけを解除し、回収レコードを削除しました。\n不要な申込レコードを「保留中」にした後で、債権譲渡契約準備を開始ボタンを再び押してください。");
            alert("レコード一覧画面に戻ります。");
            window.location.href = `https://investdesign.cybozu.com/k/${APP_ID_COLLECT}/`;
        } catch(err) {
            alert(err);
        }
    }

    async function getNewParentRecord(constructor_id, closing_date) {
        // 親でない かつ 工務店IDも締め日も親に等しい かつ レコード番号が小さい順
        const request_body = {
            "app": APP_ID_COLLECT,
            "fields": [

            ],
            "query": `${fieldParent_COLLECT} not in ("${statusParent_COLLECT}") and ${fieldConstructionShopId_COLLECT} = ${constructor_id} and ${fieldClosingDate_COLLECT} = ${closing_date} order by ${fieldRecordNo_COLLECT} asc`
        };

        const result = await kintoneRecord.getAllRecordsByQuery(request_body);
        // 最もレコード番号が小さいものを1件だけ返す
        return result.records[0];
    }

    async function getParentRecord(constructor_id, closing_date) {
        const request_body = {
            "app": APP_ID_COLLECT,
            "fields": [

            ],
            "query": `${fieldParent_COLLECT}`
        }
    }

    function getDetailApplies(collect_record_no) {
        console.log("表示中の回収レコードの明細にあたる申込レコードを全て取得する");

        const request_body = {
            "app": APP_ID_APPLY,
            "fields": [fieldRecordNo_APPLY],
            "query": `${fieldCollectId_APPLY} = ${collect_record_no}`
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
    }

    function deleteCollectIdField(detail_ids) {
        console.log("クラウドサインの明細にあたるレコードの回収IDをブランクに戻す");

        const request_body = {
            "app": APP_ID_APPLY,
            records: detail_ids.map((detail) => {
                return {
                    "id": detail[fieldRecordNo_APPLY]["value"],
                    "record": {
                        [fieldCollectId_APPLY]: {
                            "value": null
                        }
                    }
                };
            })
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
    }

    function deleteCollectRecord(record_id) {
        console.log("回収アプリから、今開いているレコードを削除する");

        const request_body = {
            "app": APP_ID_COLLECT,
            "ids": [record_id]
        };

        return kintone.api(kintone.api.url("/k/v1/records", true), "DELETE", request_body);
    }
})();
