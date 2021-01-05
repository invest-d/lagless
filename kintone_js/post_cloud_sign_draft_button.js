const dayjs = require("dayjs");
dayjs.locale("ja");

import { get_contractor_name } from "./util_forms";

(function() {
    "use strict";
    const CLOUDSIGN_API_SERVER = "https://api.cloudsign.jp";
    const GET_TOKEN_API = "https://us-central1-lagless.cloudfunctions.net/fetch_cloudSign_token";

    const APP_ID_LOGIN = "61";
    const cloud_sign_record_id = "54";
    const fieldClientId_LOGIN = "パスワード";

    const APP_ID_COLLECT = kintone.app.getId();
    const fieldRecordId_COLLECT = "レコード番号";
    const fieldCollectStatus_COLLECT = "collectStatus";
    const statusReady_COLLECT = "クラウドサイン作成待ち";
    const statusCreated_COLLECT = "クラウドサイン発射待ち";
    const fieldConstructorId_COLLECT = "constructionShopId";
    const fieldConstructorName_COLLECT = "constructionShopName";
    const fieldClosingDate_COLLECT = "closingDate";
    const fieldCloudSignAmount_COLLECT = "scheduledCollectableAmount";
    const fieldAcceptanceLetter_COLLECT = "cloudSignPdf";
    const tableCloudSignApplies_COLLECT = "cloudSignApplies";
    const tableFieldAttachmentFileKey_COLLECT = "attachmentFileKeyCS";
    const tableFieldApplicantOfficialNameCS_COLLECT = "applicantOfficialNameCS";
    const fieldCloudSignUrl_COLLECT = "cloudSignUrl";
    const fieldAccount_COLLECT = "account";
    const fieldDaysLater_COLLECT = "daysLater";

    const APP_ID_CONSTRUCTOR = "96";
    const fieldConstructorId_CONSTRUCTOR = "id";
    const fieldCustomerId_CONSTRUCTOR = "customerCode";
    const tableParticipants_CONSTRUCTOR = "participants";
    const tableFieldParticipantOrder_CONSTRUCTOR = "participantOrder";
    const tableFieldParticipantEmail_CONSTRUCTOR = "participantEmail";
    const tableFieldParticipantCompany_CONSTRUCTOR = "participantCompany";
    const tableFieldParticipantTitle_CONSTRUCTOR = "participantTitle";
    const tableFieldParticipantName_CONSTRUCTOR = "participantName";
    const tableFieldParticipantBorder_CONSTRUCTOR = "participantBorder";
    const tableReportees_CONSTRUCTOR = "reportees";
    const tableFieldReporteeEmail_CONSTRUCTOR = "reporteeEmail";
    const tableFieldReporteeCompany_CONSTRUCTOR = "reporteeCompany";
    const tableFieldReporteeTitle_CONSTRUCTOR = "reporteeTitle";
    const tableFieldReporteeName_CONSTRUCTOR = "reporteeName";

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
            const failed_collect_ids = [];
            const should_update_records = [];
            const generating_documents = [];
            for (const record of target_records) {
                // 各レコードについて、一連の処理が失敗しても次のレコードの処理を行う
                const posted_document = await post_cloudSign_document(token, record)
                    .catch((err) => {
                        console.error(err);
                        failed_collect_ids.push(record[fieldRecordId_COLLECT]["value"]);
                        return null;
                    });

                if (!posted_document) {
                    continue;
                }

                const api_requests = [
                    post_document_participants(token, posted_document.id, record),
                    post_document_reportees(token, posted_document.id, record),
                    attach_files(token, posted_document.id, record),
                ];

                const process = Promise.all(api_requests)
                    .then(() => {
                        // 作成した書類へのURLをkintoneのレコードに保存し、状態フィールドを更新する。
                        const posted_url = `https://www.cloudsign.jp/document/${posted_document.id}/summary`;
                        should_update_records.push({
                            id: record[fieldRecordId_COLLECT]["value"],
                            record: {
                                [fieldCollectStatus_COLLECT]: {
                                    "value": statusCreated_COLLECT
                                },
                                [fieldCloudSignUrl_COLLECT]: {
                                    "value": posted_url
                                }
                            }
                        });
                    })
                    .catch(async () => {
                        // クラウドサインに書類を作成することに失敗した場合、作りかけの書類を削除
                        await delete_document(token, posted_document.id);

                        // 失敗したレコード番号を保持する
                        failed_collect_ids.push(record[fieldRecordId_COLLECT]["value"]);
                    });

                generating_documents.push(process);
            }

            await Promise.all(generating_documents);
            const succeeded_records = await update_suceeded_records(should_update_records);

            alert(`${succeeded_records.length}件のレコードについて、クラウドサインの下書き作成を完了しました。\n`
                + "作成した下書きは、各レコードの「クラウドサインURL」から確認してください。");

            if (failed_collect_ids.length > 0) {
                alert("処理に失敗したレコードがあります。\n\n"
                    + `レコード番号：${failed_collect_ids.join(", ")}`);
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
        return result["record"][fieldClientId_LOGIN]["value"];
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
        const title = `${dayjs(record[fieldClosingDate_COLLECT]["value"]).format("YYYY年M月D日")}締め分 債権譲渡承諾書（${customer_name} 様）`;
        const params = {
            "title": title,
            "note": customer_name,
            "can_transfer": true
        };
        const response = await request_post_API_with_urlencoded(token, url, params);
        const result = await response.json();
        return result;
    };

    const post_document_participants = async (token, document_id, record) => {
        const url = `${CLOUDSIGN_API_SERVER}/documents/${document_id}/participants`;

        const get_cloudSign_offerers = () => {
            // インベストデザイン等、身内の従業員を回付先として定義する
            const offerers = [];

            offerers.push({
                "email": "inomata@invest-d.com",
                "name": "猪俣 和貴",
                // それぞれのorganizationはcontractorによらず固定
                "organization": "インベストデザイン株式会社",
                "language_code": "ja"
            });

            offerers.push({
                "email": "takada@invest-d.com",
                "name": "代表取締役　髙田 悠一",
                "organization": "インベストデザイン株式会社",
                "language_code": "ja"
            });

            let contractor;
            try {
                contractor = get_contractor_name(
                    record[fieldAccount_COLLECT]["value"],
                    record[fieldDaysLater_COLLECT]["value"],
                    record[fieldConstructorId_COLLECT]["value"]
                );
            } catch (e) {
                if (e instanceof TypeError) {
                    throw new Error("会社名を確定できませんでした。\n"
                        + "【支払元口座】および【遅払い日数】を工務店マスタに正しく入力してください。\n\n"
                        + `工務店ID：${record[fieldConstructorId_COLLECT]["value"]}\n`
                        + `工務店名：${record[fieldConstructorName_COLLECT]["value"]}`);
                } else {
                    throw new Error(`不明なエラーです。追加の情報：${e}`);
                }
            }
            if (contractor === "ラグレス合同会社") {
                offerers.push({
                    "email": "h.kanemoto@shine-artist.com",
                    "name": "田口勝富",
                    "organization": "ラグレス合同会社　代表社員　ラグレス一般社団法人　職務執行者",
                    "language_code": "ja"
                });
            }

            return offerers;
        };
        const participants = get_cloudSign_offerers();

        const accepters = get_filtered_subtable(record["constructor_record"][tableParticipants_CONSTRUCTOR]["value"]);

        // 数値型「回付順」フィールドの値が小さい順に並べ替える
        accepters.sort((a, b) => {
            const order_a = a["value"][tableFieldParticipantOrder_CONSTRUCTOR]["value"] === ""
                ? 0
                : Number(a["value"][tableFieldParticipantOrder_CONSTRUCTOR]["value"]);

            const order_b = b["value"][tableFieldParticipantOrder_CONSTRUCTOR]["value"] === ""
                ? 0
                : Number(b["value"][tableFieldParticipantOrder_CONSTRUCTOR]["value"]);

            return order_a - order_b;
        });

        // APIのリクエストに使えるよう、kintoneの保存内容を整える
        accepters.forEach((row) => {
            const accepter = row["value"];

            // borderは、債権譲渡契約の価格が一定以上の大きさの場合にのみ決裁フローに入るための設定
            const border = accepter[tableFieldParticipantBorder_CONSTRUCTOR]["value"] === ""
                ? 0
                : Number(accepter[tableFieldParticipantBorder_CONSTRUCTOR]["value"]);

            if (border > Number(record[fieldCloudSignAmount_COLLECT]["value"])) {
                // 価格が小さいので決裁フローに入らない
                return;
            }

            // 回付者への[様]等の敬称は、回付依頼のメールで勝手に追加される。従って不要
            let name = `${accepter[tableFieldParticipantName_CONSTRUCTOR]["value"]}`;

            // 役職があれば追加
            if (accepter.hasOwnProperty(tableFieldParticipantTitle_CONSTRUCTOR)
                && accepter[tableFieldParticipantTitle_CONSTRUCTOR]["value"] !== "") {
                name = `${accepter[tableFieldParticipantTitle_CONSTRUCTOR]["value"]}　${name}`;
            }

            // 回付者の配列に追加していく
            participants.push({
                "email": accepter[tableFieldParticipantEmail_CONSTRUCTOR]["value"],
                "name": name,
                "organization": accepter[tableFieldParticipantCompany_CONSTRUCTOR]["value"],
                "language_code": "ja"
            });
        });

        for (const participant of participants) {
            // 回付者が複数いたとしても、一度のAPIリクエストにつき一人しか追加できない
            const params = {
                "email": participant.email,
                "name": participant.name,
                "organization": participant.organization,
                "language_code": participant.language_code,
            };

            // 回付者として登録する順番が重要なので、ループの外でPromise.allなどはせず、毎回awaitする
            await request_post_API_with_urlencoded(token, url, params);
        }

        return Promise.resolve();
    };

    const post_document_reportees = async (token, document_id, record) => {
        const url = `${CLOUDSIGN_API_SERVER}/documents/${document_id}/reportees`;

        const adding_reportee = [];

        const reportees = get_filtered_subtable(record["constructor_record"][tableReportees_CONSTRUCTOR]["value"]);
        // 敬称は自動的に追加される
        reportees.forEach((row) => {
            const reportee = row["value"];

            let name = `${reportee[tableFieldReporteeName_CONSTRUCTOR]["value"]}`;

            // 役職があれば追加
            if (reportee.hasOwnProperty(tableFieldReporteeTitle_CONSTRUCTOR)
                && reportee[tableFieldReporteeTitle_CONSTRUCTOR]["value"] !== "") {
                name = `${reportee[tableFieldReporteeTitle_CONSTRUCTOR]["value"]}　${name}`;
            }

            // 最後に元のプロパティの値に上書きする
            reportee[tableFieldReporteeName_CONSTRUCTOR]["value"] = name;
        });

        for (const row of reportees) {
            // 共有先が複数いたとしても、一度のAPIリクエストにつき一人しか追加できない
            const reportee = row["value"];
            const params = {
                "email": reportee[tableFieldReporteeEmail_CONSTRUCTOR]["value"],
                "name": reportee[tableFieldReporteeName_CONSTRUCTOR]["value"],
                "organization": reportee[tableFieldReporteeCompany_CONSTRUCTOR]["value"]
            };

            adding_reportee.push(request_post_API_with_urlencoded(token, url, params));
        }

        return Promise.all(adding_reportee);
    };

    const createFormData = (data) => {
        const form = new FormData();
        Object
            .keys(data)
            .forEach((key) => form.append(key, data[key]));
        return form;
    };

    const attach_files = async (token, document_id, record) => {
        const download_files_as_arrayBuffer = async (record) => {
            // ①回収レコードから債権譲渡承諾書PDFファイルをダウンロードする。
            // ②回収レコードに紐づく申込レコードから、それぞれの請求書PDFファイルをダウンロードする。
            // ③1番および2番のデータを配列にして返す。インデックス0が債権譲渡承諾書、1以降が請求書
            // 制限事項：申込レコードに添付してあるファイルはPDFファイルであることを前提とする。
            const targets = [];

            const acceptance_letter = {
                name: record[fieldAcceptanceLetter_COLLECT]["value"][0]["name"],
                fileKey: record[fieldAcceptanceLetter_COLLECT]["value"][0]["fileKey"]
            };
            targets.push(acceptance_letter);

            record[tableCloudSignApplies_COLLECT]["value"].forEach((row) => {
                const applicant = row["value"][tableFieldApplicantOfficialNameCS_COLLECT]["value"];
                const closing_date = record[fieldClosingDate_COLLECT]["value"];
                const invoice = {
                    name: `${dayjs(closing_date).format("YYYY年M月D日")}締め分請求書（${applicant}様）.pdf`,
                    fileKey: row["value"][tableFieldAttachmentFileKey_COLLECT]["value"]
                };
                targets.push(invoice);
            });

            const download_processes = targets.map(async (obj) => {
                const data = await client.file.downloadFile({ fileKey: obj.fileKey });
                return {
                    name: obj.name,
                    data: data
                };
            });
            return Promise.all(download_processes);
        };
        const file_buffers = await download_files_as_arrayBuffer(record);

        const url = `${CLOUDSIGN_API_SERVER}/documents/${document_id}/files`;
        // 最初に債権譲渡承諾書を添付するのが重要なので、一つずつawaitする
        for (const buffer of file_buffers) {
            const file = new File([ buffer.data ], buffer.name, { type: "application/pdf" });
            const params = {
                name: buffer.name,
                uploadfile: file
            };
            // form-dataで送信する
            await fetch(url, {
                method: "POST",
                headers: {
                    "accept": "application/json",
                    "Authorization": `${token.token_type} ${token.access_token}`
                },
                body: createFormData(params)
            });
        }
    };

    const delete_document = (token, document_id) => {
        const url = `${CLOUDSIGN_API_SERVER}/documents/${document_id}`;
        return fetch(url, {
            method: "DELETE",
            headers: {
                "accept": "*/*",
                "Authorization": `${token.token_type} ${token.access_token}`
            }
        });
    };

    const get_filtered_subtable = (table) => {
        // kintoneの見かけ上は何も登録されていないように見えて、全フィールド空文字のサブテーブル行が登録されている場合があるため、その行を弾く
        return table.filter((row) => Object.values(row["value"]).some((field) => field["value"] !== ""));
    };

    const get_target_records = async () => {
        // 回収アプリのレコードを取得 ＆ それぞれの回収レコードに紐づく工務店の登記情報を取得
        const get_collect_records = async () => {
            const body = {
                app: APP_ID_COLLECT,
                fields: [
                    fieldRecordId_COLLECT,
                    fieldConstructorId_COLLECT,
                    fieldConstructorName_COLLECT,
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

    const update_suceeded_records = async (update_records) => {
        const body = {
            app: APP_ID_COLLECT,
            records: update_records
        };

        const result = await client.record.updateRecords(body);
        return result.records;
    };
})();
