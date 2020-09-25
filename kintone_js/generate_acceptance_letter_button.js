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
    const fieldAccount_COLLECT = "account";
    const fieldSendDate_COLLECT = "cloudSignSendDate";
    const fieldClosing_COLLECT = "closingDate";
    const fieldSubtableCS_COLLECT = "cloudSignApplies";

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
                    throw new Error("レコードの取得中にエラーが発生しました。");
                });

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
                fieldSubtableCS_COLLECT
            ],
            "condition": `${fieldStatus_COLLECT} in ("${statusReadyToGenerate_COLLECT}")`
        };

        return client.record.getAllRecords(request_body);
    }

})();
