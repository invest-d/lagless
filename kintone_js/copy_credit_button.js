/*
    Version 1
    審査アプリ(79)に記載されている与信枠を工務店マスタ(96)に転記するボタンを設置する。

    審査アプリと工務店マスタの対応付けは下記の通り
        審査Ver2.0側：取引企業管理No_審査対象企業（＝取引企業管理.レコード番号）
        工務店マスタ側：customerCode（＝取引企業管理.レコード番号）

        つまり、二つのアプリがどちらも参照している取引企業管理のレコード番号によって対応付ける。

    審査アプリの転記対象フィールドコード
        付与与信枠_決定金額_標準と高額

    取得条件
        同一企業に対して複数回の審査が存在することを想定。（審査は毎月更新の予定）
        同一の取引企業管理Noのレコードをまとめた中で、
        審査完了日が最も新しいレコードを採用する。
*/

(function (){
    "use strict";

    const APP_ID_EXAM = 79;
    // フィールドコード
    const customerCode_EXAM = "取引企業管理No_審査対象企業";
    const creditAmount_EXAM = "付与与信枠_決定金額_標準と高額";
    const examinedDay_EXAM = "審査完了日";

    const APP_ID_KOMUTEN = 96;
    const recordNo_KOMUTEN = "レコード番号";
    const customerCode_KOMUTEN = "customerCode";
    const creditFacility_KOMUTEN = "creditFacility";
    const fieldGetCreditNextTime_KOMUTEN = "getCreditFacility";
    const statusGetCredit_KOMUTEN = "次回、与信枠を取得する";

    const kintoneRecord = new kintoneJSSDK.Record({connection: new kintoneJSSDK.Connection()});

    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createCopyCreditButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });

    function needShowButton() {
        // 現状は常にボタンを表示する。増殖バグだけ防止
        return document.getElementById("copyCredit") === null;
    }

    function createCopyCreditButton() {
        const copyCredit = document.createElement("button");
        copyCredit.id = "copyCredit";
        copyCredit.innerText = "与信枠を更新";
        copyCredit.addEventListener("click", clickCopyCredit);
        return copyCredit;
    }

    // ボタンクリック時の処理を定義
    async function clickCopyCredit() {
        const clicked_ok = confirm("付与与信枠を最新の額に更新しますか？");
        if (!clicked_ok) {
            alert("処理は中断されました。");
            return;
        }

        try {
            // 審査内容が最新のレコードを取得。判定基準は審査完了日フィールド。
            const latest_exam_records = await getLatestExamRecords()
                .catch((err) => {
                    console.error(err);
                    throw new Error("審査アプリからのレコード取得中にエラーが発生しました。");
                });


            if (latest_exam_records.length === 0) {
                alert("与信枠が入力済みの企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。");
                return;
            }

            const updated_count = await updateKomutenCredits(latest_exam_records)
                .catch((err) => {
                    console.error(err);
                    throw new Error("取得した与信枠を工務店マスタに更新している途中にエラーが発生しました。");
                });

            alert(`更新が完了しました。\n更新されたのは ${updated_count}件 です。`);
            alert("ページを更新します");
            location.reload();
        } catch (err) {
            alert(err);
        }
    }

    async function getLatestExamRecords() {
        console.log("審査アプリの中で審査完了日が最新のレコードを取引企業Noごとにすべて取得する。");

        // 全件取得
        const body_exams = {
            "app": APP_ID_EXAM,
            "fields": [customerCode_EXAM, creditAmount_EXAM, examinedDay_EXAM],
            "query": `${examinedDay_EXAM} != "" and ${creditAmount_EXAM} >= 0`, // ヤバい取引企業は与信枠ゼロにして対応することもあるので、ゼロ円のレコードも取得
            "seek": true
        };

        const all_exam = await kintoneRecord.getAllRecordsByQuery(body_exams);

        // 重複なしの取引企業Noを取得
        const unique_customer_codes = all_exam.records
            .map((record) => record[customerCode_EXAM]["value"])
            .filter((code, i, self) => self.indexOf(code) === i);

        const latest_exams = unique_customer_codes.map((customer_code) => {
            // 取引企業Noごとにfilterして処理する
            const target_exams = all_exam.records.filter((record) => record[customerCode_EXAM]["value"] === customer_code);

            // 日付だけの配列を作って、配列の中の最新の日付を取得する。Math.max.applyの返り値は数値（UNIX時間）なので改めてnew Dateする
            const examined_dates = target_exams.map((record) => getComparableDate(record[examinedDay_EXAM]["value"]));
            const latest_date = new Date(Math.max.apply(null, examined_dates));

            // kintone書式との一致を確認するためにyyyy-mm-ddにフォーマット
            const latest_yyyy_mm_dd = [
                latest_date.getFullYear(),
                (`0${  String(latest_date.getMonth()+1)}`).slice(-2),
                (`0${  String(latest_date.getDate())}`).slice(-2)
            ].join("-");

            // 審査レコードの中で、最新日付を持っているものを取得
            return target_exams.find((record) => record[examinedDay_EXAM]["value"] === latest_yyyy_mm_dd);
        });

        return latest_exams;
    }

    // YYYY-MM-DDの書式のままでは日付の比較ができないので、比較可能な値に変換する
    function getComparableDate(yyyy_mm_dd) {
        const date_info = String(yyyy_mm_dd).split("-");
        return new Date(Number(date_info[0]), Number(date_info[1])-1, Number(date_info[2]));
    }

    async function updateKomutenCredits(latest_exam_records) {
        // 審査アプリの取引企業Noと工務店マスタの取引企業Noを繋いでUPDATE用のリクエストボディを作成
        const body_update_credits = await generateUpdateKomutenReqBody(latest_exam_records);

        if (body_update_credits.records.length === 0) {
            console.log("latest exams are ");
            console.log(latest_exam_records);
            alert("与信枠を取得するよう設定した工務店の中で、審査が行われている企業はありませんでした。\nどの工務店の付与与信枠も更新されていません。");
            return 0;
        }

        console.log("審査アプリから取得した付与与信枠を工務店アプリのレコードに転記する");
        const resp_update = await kintoneRecord.updateAllRecords(body_update_credits);
        return resp_update.results[0].records.length;
    }

    async function generateUpdateKomutenReqBody(latest_exam_records) {
        console.log("工務店マスタからレコードIDと取引企業Noの一覧を取得する");
        // 付与与信枠を取得したくない工務店は除外する
        const body_exams = {
            "app": APP_ID_KOMUTEN,
            "fields": [recordNo_KOMUTEN, customerCode_KOMUTEN],
            "query": `${fieldGetCreditNextTime_KOMUTEN} in ("${statusGetCredit_KOMUTEN}")`,
            "seek": true
        };
        const komuten_info = await kintoneRecord.getAllRecordsByQuery(body_exams);

        console.log("工務店レコードそれぞれについて、審査アプリから取得した与信枠をPUTするオブジェクトを作る");
        const put_records = komuten_info.records.map((komuten) => {
            // 審査レコードの中から、工務店レコードの取引企業Noフィールドと同じ取引企業Noのレコードを探してセット。
            // 工務店レコード1件に対して審査レコードは1件のみなのでfind（n件あるのは逆の場合）
            // 結果、匠和美健などの場合は一つの審査レコードの与信枠が複数の工務店レコードにセットされる。
            const target_exam = latest_exam_records.find((record) => record[customerCode_EXAM]["value"] === komuten[customerCode_KOMUTEN]["value"]);

            // 工務店に対して1件も審査レコードがない場合はnullセット
            const credit = (target_exam === undefined)
                ? null
                : target_exam[creditAmount_EXAM]["value"];

            return {
                "id": komuten[recordNo_KOMUTEN]["value"],
                "record": {
                    [creditFacility_KOMUTEN]: {
                        "value": credit
                    }
                }
            };
        });

        const body_update_credits = {
            "app": APP_ID_KOMUTEN,
            "records": put_records
        };

        console.log(body_update_credits);
        return body_update_credits;
    }
})();
