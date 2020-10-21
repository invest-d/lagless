(function() {
    "use strict";
    const GET_TOKEN_API = "https://us-central1-lagless.cloudfunctions.net/fetch_cloudSign_token";

    const APP_ID_LOGIN = "61";
    const cloud_sign_record_id = "54";
    const fieldID_LOGIN = "ID";

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
        try {
            const client_id = await get_client_id();
            const token = await get_cloudSign_token(client_id);
        } catch (err) {
            console.error(err);
            alert(err);
        }
    }

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
})();
