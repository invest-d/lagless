const dayjs = require("dayjs");
dayjs.locale("ja");

(function() {
    "use strict";
    const CLOUDSIGN_API_SERVER = "https://api.cloudsign.jp";
    const GET_TOKEN_API = "https://us-central1-lagless.cloudfunctions.net/fetch_cloudSign_token";

    const APP_ID_LOGIN = "61";
    const cloud_sign_record_id = "54";
    const fieldID_LOGIN = "ID";

    const APP_ID_COLLECT = kintone.app.getId();
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldCollectStatus_COLLECT = "collectStatus";
    const statusReady_COLLECT = "クラウドサイン作成待ち";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldClosingDate_COLLECT = "closingDate";
    const fieldCloudSignAmount_COLLECT = "scheduledCollectableAmount";
    const fieldAcceptanceLetter_COLLECT = "cloudSignPdf";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const fieldAccount_COLLECT = "account";
    const fieldDaysLater_COLLECT = "daysLater";

    const APP_ID_CONSTRUCTOR = "96";
    const fieldConstructorId_CONSTRUCTOR = "id";
    const fieldCustomerId_CONSTRUCTOR = "customerCode";
    const tableParticipants_CONSTRUCTOR = "participants";
    const tableReportees_CONSTRUCTOR = "reportees";

    const APP_ID_CUSTOMER = "28";
    const fieldCustomerId_CUSTOMER = "レコード番号";
    const fieldCustomerName_CUSTOMER = "法人名・屋号";

    const client = new KintoneRestAPIClient({baseUrl: "https://investdesign.cybozu.com"});

    kintone.events.on("app.record.index.show", (event) => {
        // ボタンを表示するか判定
        if (needShowButton()) {
            const button = createButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    const button_id = "post_cloud_sign_draft";
    function needShowButton() {
        // 一旦は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById(button_id) === null;
    }

    function createButton() {
        const button = document.createElement("button");
        button.id = button_id;
        button.innerText = "債権譲渡クラウドサイン下書きを作成する";
        button.addEventListener("click", clickButton);
        return button;
    }

    async function clickButton() {
        const clicked_ok = confirm(`「${statusReady_COLLECT}」の各レコードについて、クラウドサインの下書きを作成しますか？\n\n`
            + "・SMBCクラウドサインに債権譲渡承諾の下書きを作成します（発射はしません）。\n"
            + "・作成した下書きは「クラウドサインURL」フィールドから確認できます。\n\n"
            + "※先に「債権譲渡承諾書PDFファイル」フィールドにPDFファイルを添付してください。添付ファイルの無いレコードは作成に失敗します\n"
            + "※請求書ファイルは各申込レコードの請求書フィールドの添付ファイルから取得して利用します。回収レコードに添付する必要はありません。");

        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        const text_ready = this.innerText;
        this.innerText = "作成中...";

        try {
            const client_id = await get_client_id();
            const token = await get_cloudSign_token(client_id);

            const target_records = await get_target_records();
            for (const record of target_records) {
                const posted_document = await post_cloudSign_document(token, record);
            }
        } catch (err) {
            console.error(err);
            alert(err);
        } finally {
            this.innerText = text_ready;
        }
    }

    const createURLSearchParams = (data) => {
        const params = new URLSearchParams();
        Object.keys(data).forEach((key) => params.append(key, data[key]));
        return params;
    };

    const get_client_id = async () => {
        const body = {
            app: APP_ID_LOGIN,
            id: cloud_sign_record_id
        };
        const result = await client.record.getRecord(body);
        return result["record"][fieldID_LOGIN]["value"];
    };

    const get_cloudSign_token = async (client_id) => {
        const body = {
            client_id: client_id
        };
        const response = await fetch(GET_TOKEN_API, {
            method: "POST",
            body: JSON.stringify(body)
        });

        const result = await response.json();
        return result;
    };

    const request_post_API_with_urlencoded = (token, url, params) => {
        return fetch(url, {
            method: "POST",
            headers: {
                "accept": "application/json",
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `${token.token_type} ${token.access_token}`
            },
            body: createURLSearchParams(params)
        });
    };

    const post_cloudSign_document = async (token, record) => {
        const url = `${CLOUDSIGN_API_SERVER}/documents`;
        const customer_name = record["customer_record"][fieldCustomerName_CUSTOMER]["value"];
        const title = `（テスト用）${dayjs(record[fieldClosingDate_COLLECT]["value"]).format("YYYY年M月D日")}締め分 債権譲渡承諾書（${customer_name}）`;
        const params = {
            "title": title,
            "note": customer_name,
            "can_transfer": true
        };
        const response = await request_post_API_with_urlencoded(token, url, params);
        const result = await response.json();
        return result;
    };

    const get_target_records = async () => {
        // 回収アプリのレコードを取得 ＆ それぞれの回収レコードに紐づく工務店の登記情報を取得
        const get_collect_records = async () => {
            const body = {
                app: APP_ID_COLLECT,
                fields: [
                    fieldRecordId_COLLECT,
                    fieldConstructorId_COLLECT,
                    fieldClosingDate_COLLECT,
                    fieldCloudSignAmount_COLLECT,
                    fieldAcceptanceLetter_COLLECT,
                    tableCloudSignApplies_COLLECT,
                    fieldAccount_COLLECT,
                    fieldDaysLater_COLLECT,
                ],
                query: `${fieldCollectStatus_COLLECT} in ("${statusReady_COLLECT}")`
            };
            const result = await client.record.getRecords(body);
            return result.records;
        };

        const get_constructor_records = (ids) => {
            return get_records_by_unique_id(
                APP_ID_CONSTRUCTOR,
                [
                    fieldConstructorId_CONSTRUCTOR,
                    fieldCustomerId_CONSTRUCTOR,
                    tableParticipants_CONSTRUCTOR,
                    tableReportees_CONSTRUCTOR,
                ],
                fieldConstructorId_CONSTRUCTOR,
                ids
            );
        };

        const get_customer_records = (ids) => {
            return get_records_by_unique_id(
                APP_ID_CUSTOMER,
                [
                    fieldCustomerId_CUSTOMER,
                    fieldCustomerName_CUSTOMER
                ],
                fieldCustomerId_CUSTOMER,
                ids
            );
        };

        const get_records_by_unique_id = async (app_id, fields, unique_field, ids) => {
            const ids_condition = ids.map((id) => `"${id}"`).join(",");
            const body = {
                app: app_id,
                fields: fields,
                query: `${unique_field} in (${ids_condition})`
            };
            const result = await client.record.getRecords(body);
            return result.records;
        };

        const collect_records = await get_collect_records();

        const unique_constructor_ids = Array.from(new Set(
            collect_records.map((r) => r[fieldConstructorId_COLLECT]["value"])
        ));
        const constructor_records = await get_constructor_records(unique_constructor_ids);

        // collect_recordsにconstructor_recordの情報を紐づける
        for (const record of collect_records) {
            const id = record[fieldConstructorId_COLLECT]["value"];
            const constructor_record = constructor_records.find((r) => r[fieldConstructorId_CONSTRUCTOR]["value"] === id);
            record["constructor_record"] = constructor_record;
        }

        const unique_customer_ids = Array.from(new Set(
            constructor_records.map((r) => r[fieldCustomerId_CONSTRUCTOR]["value"])
        ));
        const customer_records = await get_customer_records(unique_customer_ids);

        // collect_recordsにcustomer_recordの情報を紐づける
        for (const record of collect_records) {
            const id = record["constructor_record"][fieldCustomerId_CONSTRUCTOR]["value"];
            const customer_record = customer_records.find((r) => r[fieldCustomerId_CUSTOMER]["value"] === id);
            record["customer_record"] = customer_record;
        }

        return collect_records;
    };
})();
