/*
    Version 3
    通常払いレコードを集計対象外にした

    Version 2
    未回収金額のうち、早払いの申込金額と遅払いの申込金額を分けて集計するように変更

    Version 1
    回収アプリのレコードのうち、回収予定のレコードを取得し、
    取引企業Noごとに回収予定金額を合計し、工務店マスタの未回収金額にセットする。
*/

import { schema_apply } from "../161/schema";
import { schema_96 } from "../96/schema";
import { schema_collect } from "../162/schema";

const statusPaymentTimingUndefined_APPLY    = schema_apply.fields.properties.paymentTiming.options.未設定.label;
const statusPaymentTimingEarly_APPLY        = schema_apply.fields.properties.paymentTiming.options.早払い.label;
const statusPaymentTimingLate_APPLY         = schema_apply.fields.properties.paymentTiming.options.遅払い.label;

const APP_ID_KOMUTEN                        = schema_96.id.appId;
const fieldConstructionShopId_KOMUTEN       = schema_96.fields.properties.id.code;
const fieldCustomerCode_KOMUTEN             = schema_96.fields.properties.customerCode.code;
const fieldCollectableAmount_KOMUTEN        = schema_96.fields.properties.uncollectedAmount.code;
const fieldCollectableAmount_late_KOMUTEN   = schema_96.fields.properties.uncollectedAmount_late.code;

const APP_ID_COLLECT                        = kintone.app.getId();
const fieldConstructionShopId_COLLECT       = schema_collect.fields.properties.constructionShopId.code;
const fieldCustomerCode_COLLECT             = schema_collect.fields.properties.customerCode.code;
const fieldTableCloudSign_COLLECT           = schema_collect.fields.properties.cloudSignApplies.code;
const tableFieldReceivableCS_COLLECT        = schema_collect.fields.properties.cloudSignApplies.fields.receivableCS.code;
const tableFieldPaymentTimingCS_COLLECT     = schema_collect.fields.properties.cloudSignApplies.fields.paymentTimingCS.code;
const fieldStatus_COLLECT                   = schema_collect.fields.properties.collectStatus.code;
const statusCollected_COLLECT               = schema_collect.fields.properties.collectStatus.options.回収済み.label;
const statusRejected_COLLECT                = schema_collect.fields.properties.collectStatus.options["クラウドサイン却下・再作成待ち"].label;

function needShowButton() {
    // 一旦は常にボタンを表示する。増殖バグだけ防止
    return document.getElementById("getCollectable") === null;
}

function createGetCollectableAmountButton() {
    const getCollectable = document.createElement("button");
    getCollectable.id = "getCollectable";
    getCollectable.innerText = "各工務店の未回収金額を更新";
    getCollectable.addEventListener("click", clickGetCollectableAmount);
    return getCollectable;
}

// ボタンクリック時の処理を定義
async function clickGetCollectableAmount() {
    const clicked_ok = confirm("回収アプリの未回収金額を合計して取得します。");
    if (!clicked_ok) {
        alert("処理は中断されました。");
        return;
    }

    // 対象となるレコードを回収アプリから全件取得
    let updated_count = 0;
    try {
        // 回収アプリの中で今後回収予定のレコードを全て取得
        const collectable = await getCollectableRecords()
            .catch((err) => {
                console.log(err);
                throw new Error("未回収レコードの読み込み中にエラーが発生しました。");
            });
        console.log("collectable records");
        console.log(collectable.records);

        // 取引企業Noごとに未回収金額を合計
        const sum_by_customer = await sumCollectableAmountByCustomer(collectable.records)
            .catch((err) => {
                console.log(err);
                throw new Error("未回収金額の計算中にエラーが発生しました。");
            });
        console.log("sum result");
        console.log(sum_by_customer);

        // 工務店マスタに未回収金額をPUT
        const updated_ids = await updateKomutenTotalCollectableAmount(sum_by_customer)
            .catch((err) => {
                console.log(err);
                throw new Error("計算した未回収金額を工務店マスタに上書き中にエラーが発生しました。");
            });
        console.log("updated record ids of remaining collectable amount");
        console.log(updated_ids);
        updated_count += updated_ids.length;

        // 未回収金額がゼロになった工務店レコードを更新
        const updated = await updateKomutenCollectableZero(updated_ids)
            .catch((err) => {
                console.log(err);
                throw new Error("未回収金額がゼロになった工務店の更新中にエラーが発生しました。");
            });
        console.log("record ids of updated collectable amount to zero");
        console.log(updated.records);
        updated_count += updated.records.length;

        alert(`${updated_count}件 の工務店の未回収金額を更新しました。`);
        alert("ページを更新します。");
        window.location.reload();
    } catch(err) {
        alert(err);
    }
}

async function getCollectableRecords() {
    console.log("回収アプリの中でステータスが(回収済み||却下)以外の全てのレコードを取得する");

    const request_body = {
        "app": APP_ID_COLLECT,
        "fields": [
            fieldConstructionShopId_COLLECT,
            fieldCustomerCode_COLLECT,
            fieldTableCloudSign_COLLECT
        ],
        "query": `${fieldStatus_COLLECT} not in ("${statusCollected_COLLECT}", "${statusRejected_COLLECT}") order by レコード番号 asc`
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
}

async function sumCollectableAmountByCustomer(collectable_records) {
    console.log("取引企業Noごとに未回収金額を合計する。");

    // 取引企業Noの配列を作る
    const customer_codes_collect = collectable_records.map((collectable_record) => {
        return collectable_record[fieldCustomerCode_COLLECT]["value"];
    });

    // 取引企業Noの重複を削除する
    const unique_customers = customer_codes_collect.filter((id, index, self) => {
        return self.indexOf(id) === index;
    });

    // ①工務店ID、②取引企業Noごとの未回収金額の合計、という2つの情報を持つオブジェクトを作っていく。
    // まず各取引企業Noごとに、{取引企業No: {合計金額}}のオブジェクトを作る。
    const sum_by_customers = {};
    for (const customer_code of unique_customers) {
        const total_by_customer = {
            early: 0,
            late: 0
        };

        collectable_records
            .filter((record) => record[fieldCustomerCode_COLLECT]["value"] === customer_code)
            .forEach((record) => {
                // 一つの回収レコード内にあるサブテーブルで小計
                const subtotal = {
                    early: 0,
                    late: 0
                };

                record[fieldTableCloudSign_COLLECT]["value"].forEach((row) => {
                    if (row["value"][tableFieldPaymentTimingCS_COLLECT]["value"] === statusPaymentTimingLate_APPLY) {
                        subtotal.late += Number(row["value"][tableFieldReceivableCS_COLLECT]["value"]);
                    } if (row["value"][tableFieldPaymentTimingCS_COLLECT]["value"] === statusPaymentTimingUndefined_APPLY
                        || row["value"][tableFieldPaymentTimingCS_COLLECT]["value"] === statusPaymentTimingEarly_APPLY) {
                        subtotal.early += Number(row["value"][tableFieldReceivableCS_COLLECT]["value"]);
                    }
                    // その他は通常払いなので回収金額算出の対象外
                });

                total_by_customer.early += subtotal.early;
                total_by_customer.late += subtotal.late;
            });

        sum_by_customers[customer_code] = total_by_customer;
    }

    // 次に、取引企業Noに対応する工務店IDの組み合わせを取得する。
    const komuten_customer_pairs = await getKomutenCustomerPairs(unique_customers);

    // 最後に、sum_by_customersの取引企業Noの値を、対応する工務店IDで記述したオブジェクトを作成する。
    // 取引企業Noと工務店IDは1:n対応なので、対応する工務店IDが複数ある場合は、同じ未回収金額のオブジェクトを複数作成する。
    const sum_by_constructors = komuten_customer_pairs.records.map((pair) => {
        return {
            [fieldConstructionShopId_COLLECT]: pair[fieldConstructionShopId_KOMUTEN]["value"],
            early: sum_by_customers[pair[fieldCustomerCode_KOMUTEN]["value"]].early,
            late: sum_by_customers[pair[fieldCustomerCode_KOMUTEN]["value"]].late
        };
    });

    return sum_by_constructors;
}

function getKomutenCustomerPairs(customer_codes_collect) {
    console.log("工務店IDと取引企業Noの組み合わせを取得。回収アプリの取引企業Noのみ");

    const in_query = `("${  customer_codes_collect.join('","')  }")`;

    const request_body = {
        "app": APP_ID_KOMUTEN,
        "fields": [fieldConstructionShopId_KOMUTEN, fieldCustomerCode_KOMUTEN],
        "query": `${fieldCustomerCode_KOMUTEN} in ${in_query}`
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "GET", request_body);
}

async function updateKomutenTotalCollectableAmount(sum_result) {
    console.log("計算結果を工務店マスタにPUTする");

    const request_body = {
        "app": APP_ID_KOMUTEN,
        "records": sum_result.map((sum) => {
            return {
                "updateKey": {
                    "field": fieldConstructionShopId_KOMUTEN,
                    "value": sum[fieldConstructionShopId_COLLECT]
                },
                "record": {
                    [fieldCollectableAmount_KOMUTEN]: {
                        "value": sum.early
                    },
                    [fieldCollectableAmount_late_KOMUTEN]: {
                        "value": sum.late
                    }
                }
            };
        })
    };

    const resp = await kintone.api(kintone.api.url("/k/v1/records", true), "PUT", request_body);
    // 更新に成功した工務店IDの配列を返す
    return resp.records.map((record) => record["id"]);
}

async function updateKomutenCollectableZero(updated_record_ids) {
    console.log("未回収金額がゼロになった工務店の金額をゼロに更新する");

    // updated_record_ids（回収アプリで回収予定の金額がある工務店ID）に含まれていないのに、未回収金額がゼロでない工務店IDを取得。
    const in_query = `("${  updated_record_ids.join('","')  }")`;
    const body_remaining_collectable = {
        "app": APP_ID_KOMUTEN,
        "fields": [fieldConstructionShopId_KOMUTEN],
        "query": `$id not in ${in_query} and (${fieldCollectableAmount_KOMUTEN} > 0 or ${fieldCollectableAmount_late_KOMUTEN} > 0)`
    };
    const komuten_records = await kintone.api(kintone.api.url("/k/v1/records", true), "GET", body_remaining_collectable);

    // ゼロ円になった工務店の一覧を更新する
    const body_put_zero = {
        "app": APP_ID_KOMUTEN,
        "records": komuten_records.records.map((record) => {
            return {
                "updateKey": {
                    "field": fieldConstructionShopId_KOMUTEN,
                    "value": record[fieldConstructionShopId_KOMUTEN]["value"]
                },
                "record": {
                    [fieldCollectableAmount_KOMUTEN]: {
                        "value": 0
                    },
                    [fieldCollectableAmount_late_KOMUTEN]: {
                        "value": 0
                    }
                }
            };
        })
    };

    return kintone.api(kintone.api.url("/k/v1/records", true), "PUT", body_put_zero);
}

(function () {
    "use strict";

    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.index.show", (event) => {
        if (needShowButton()) {
            const button = createGetCollectableAmountButton();
            kintone.app.getHeaderMenuSpaceElement().appendChild(button);
        }
    });
})();
