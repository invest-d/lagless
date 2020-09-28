(function() {
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
            console.warn(`Unknown app: ${ app_id }`);
        }
    })(kintone.app.getId());

    const APP_ID_COLLECT = APP_ID.COLLECT;
    const fieldRecordId_COLLECT = "$id";
    const fieldStatus_COLLECT = "collectStatus";
    const statusReadyToGenerate_COLLECT = "クラウドサイン作成待ち";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldAccount_COLLECT = "account";
    const fieldSendDate_COLLECT = "cloudSignSendDate";
    const fieldClosing_COLLECT = "closingDate";
    const fieldSubtableCS_COLLECT = "cloudSignApplies";

    const APP_ID_CONSTRUCTOR = "96";
    const fieldConstructorId_CONSTRUCTOR = "id";
    const fieldCorporateId_CONSTRUCTOR = "customerCode";

    const APP_ID_CORPORATE = "28";
    const fieldRecordId_CORPORATE = "$id";
    const fieldCorporateName_CORPORATE = "法人名・屋号";
    const fieldAddress_CORPORATE = "住所_本店";
    const fieldCeoTitle_CORPORATE = "代表者名_役職";
    const fieldCeoName_CORPORATE = "代表者名";

    const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

    kintone.events.on("app.record.index.show", (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            const button = createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    const button_id = "generate_acceptance_letter";
    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById(button_id) === null;
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = button_id;
        button.innerText = "各レコードに債権譲渡承諾書を作成する";
        button.addEventListener("click", clickButton);
        return button;
    }

    // ボタンクリック時の処理を定義
    async function clickButton() {
        const text_ready = this.innerText;
        this.innerText = "作成中...";

        const clicked_ok = confirm(`「${statusReadyToGenerate_COLLECT}」の各レコードに、債権譲渡承諾書のPDFファイルを作成しますか？\n\n` +
            "※各レコードに「クラウドサイン送信予定日」を入力してください。PDF右上の日付として作成されます。ブランクのレコードにはPDFを作成しません。\n" +
            "※既に債権譲渡承諾書が添付されている場合、ファイルは上書きします。");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            this.innerText = text_ready;
            return;
        }

        const blank_date_ids = [];
        try {
            const targets = await getTargetRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("回収レコードの取得中にエラーが発生しました。");
                });

            const constructor_ids = Array.from(new Set(targets.map((record) => record[fieldConstructorId_COLLECT]["value"])));
            const corporate_ids_by_constructor = await getCorporateIdsByConstructor(constructor_ids)
                .catch((err) => {
                    console.error(err);
                    throw new Error("工務店レコードの取得中にエラーが発生しました。");
                });

            const corporates_by_id = await getCorporateRecordsByRecordId(Object.values(corporate_ids_by_constructor))
                .catch((err) => {
                    console.error(err);
                    throw new Error("取引企業管理レコードの取得中にエラーが発生しました。");
                });
            console.log(corporates_by_record_id);

            for (const record of targets) {
                if (!record[fieldSendDate_COLLECT]["value"]) {
                    blank_date_ids.push(record[fieldRecordId_COLLECT]["value"]);
                    continue;
                }
            }
        } catch(err) {
            alert(err);
        } finally {
            if (blank_date_ids.length > 0) {
                alert("クラウドサイン送信日時を入力していないため、次のレコード番号のレコードは処理されませんでした：\n\n"
                    + `${blank_date_ids.join(", ")}`);
            }
            this.innerText = text_ready;
        }
    }

    function getTargetRecords() {
        // 送信予定日時フィールドが入っているもののみ処理するが、入っていないものには警告を出したいので両方レコード取得する
        const request_body = {
            "app": APP_ID_COLLECT,
            "fields":[
                fieldRecordId_COLLECT,
                fieldAccount_COLLECT,
                fieldSendDate_COLLECT,
                fieldClosing_COLLECT,
                fieldSubtableCS_COLLECT,
                fieldConstructorId_COLLECT
            ],
            "condition": `${fieldStatus_COLLECT} in ("${statusReadyToGenerate_COLLECT}")`
        };

        return client.record.getAllRecords(request_body);
    }

    async function getCorporateIdsByConstructor(constructor_ids) {
        const ids = constructor_ids.map((id) => `"${id}"`).join(",");

        const request_body = {
            "app": APP_ID_CONSTRUCTOR,
            "fields":[
                fieldConstructorId_CONSTRUCTOR,
                fieldCorporateId_CONSTRUCTOR
            ],
            "condition": `${fieldConstructorId_CONSTRUCTOR} in (${ids})`,
        };

        const records = await client.record.getAllRecords(request_body);

        const result = {};
        for (const record of records) {
            result[record[fieldConstructorId_CONSTRUCTOR]["value"]] = record[fieldCorporateId_CONSTRUCTOR]["value"];
        }

        return result;
    }

    async function getCorporateRecordsByRecordId(corporate_ids) {
        // corporate_idsには重複の可能性がある（支払サイトが複数あるなどで、複数の工務店IDが同一の取引企業を指す場合がある）
        const unique_corporate_ids = Array.from(new Set(corporate_ids));
        const quoted_ids = unique_corporate_ids.map((id) => `"${id}"`).join(",");

        const request_body = {
            "app": APP_ID_CORPORATE,
            "fields":[
                fieldRecordId_CORPORATE,
                fieldCorporateName_CORPORATE,
                fieldAddress_CORPORATE,
                fieldCeoTitle_CORPORATE,
                fieldCeoName_CORPORATE
            ],
            "condition": `${fieldRecordId_CORPORATE} in (${quoted_ids})`,
        };

        const records = await client.record.getAllRecords(request_body);

        const result = {};
        for (const record of records) {
            result[record[fieldRecordId_CORPORATE]["value"]] = record;
        }

        return result;
    }

})();
