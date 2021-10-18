/*
    Version 1
    WFIの申込レコードに限り、協力会社マスタデータの追加オペレーションを補佐する。
*/

"use strict";

import { schema_28 } from "../28/schema";
import { schema_88 } from "../88/schema";
import {
    KE_BAN_CONSTRUCTORS,
    normalizedConstructorId,
    productNameMap
} from "../96/common";
import { schema_96 } from "../96/schema";
import { getApplyAppSchema, UnknownAppError } from "../util/choiceApplyAppSchema";
import { isGigConstructorID } from "../util/gig_utils";
import { CLIENT } from "../util/kintoneAPI";
import {
    getSearchQuery,
    searchCompanyRecord,
    selectCompanyRecordNumber
} from "./addKyoryokuMaster/inquiry";
import {
    choiceNotifyMethod, getSameKomutenKyoryokuCond
} from "./logics_add_kyoryoku_master";

const ExtensibleCustomError = require("extensible-custom-error");
class ManualAbortProcessError extends ExtensibleCustomError { }

const schema = (() => {
    try {
        return getApplyAppSchema(kintone.app.getId());
    } catch (e) {
        if (e instanceof UnknownAppError) {
            alert("不明なアプリです。申込アプリで実行してください。");
        } else {
            console.error(e);
            const additional_info = e.message ?? JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
    }
})();
if (!schema) throw new Error();
const applyApp = {
    fields: {
        recordNo: schema.fields.properties.レコード番号.code,
        applicant: {
            id: schema.fields.properties.ルックアップ.code,
            name: {
                code: schema.fields.properties.company.code,
                label: schema.fields.properties.company.label,
            },
            phone: {
                code: schema.fields.properties.phone.code,
                label: schema.fields.properties.phone.label,
            },
            email: {
                code: schema.fields.properties.mail.code,
                label: schema.fields.properties.mail.label,
            },
            bankAccount: {
                bankCode: {
                    code: schema.fields.properties.bankCode_Form.code,
                    label: schema.fields.properties.bankCode_Form.label,
                },
                bankName: {
                    code: schema.fields.properties.bankName_Form.code,
                    label: schema.fields.properties.bankName_Form.label,
                },
                branchCode: {
                    code: schema.fields.properties.branchCode_Form.code,
                    label: schema.fields.properties.branchCode_Form.label,
                },
                branchName: {
                    code: schema.fields.properties.branchName_Form.code,
                    label: schema.fields.properties.branchName_Form.label,
                },
                depositType: {
                    code: schema.fields.properties.deposit_Form.code,
                    label: schema.fields.properties.deposit_Form.label,
                },
                number: {
                    code: schema.fields.properties.accountNumber_Form.code,
                    label: schema.fields.properties.accountNumber_Form.label,
                },
                name: {
                    code: schema.fields.properties.accountName_Form.code,
                    label: schema.fields.properties.accountName_Form.label,
                },
            },
        },
        orderer: {
            id: schema.fields.properties.constructionShopId.code,
        },
    },
};

const laborApp = {
    fields: {
        recordNo: schema_88.fields.properties.レコード番号.code,
        id: schema_88.fields.properties.支払企業No_.code,
        orderer: {
            id: schema_88.fields.properties.工務店ID.code,
            name: schema_88.fields.properties.工務店名.code,
        },
        corporateId: schema_88.fields.properties.取引企業管理No.code,
        name: {
            code: schema_88.fields.properties.支払先.code,
            label: schema_88.fields.properties.支払先.label,
        },
        service: schema_88.fields.properties.商品名.code,
        generalName: {
            code: schema_88.fields.properties.支払先正式名称.code,
            label: schema_88.fields.properties.支払先正式名称.label,
        },
        phone: {
            primary: {
                code: schema_88.fields.properties.電話番号.code,
                label: schema_88.fields.properties.電話番号.label,
            },
            secondary: {
                code: schema_88.fields.properties.電話番号２.code,
                label: schema_88.fields.properties.電話番号２.label,
            },
        },
        email: {
            code: schema_88.fields.properties.メールアドレス.code,
            label: schema_88.fields.properties.メールアドレス.label,
        },
        bankAccount: {
            bankCode: {
                code: schema_88.fields.properties.金融機関コード.code,
                label: schema_88.fields.properties.金融機関コード.label,
            },
            bankName: {
                code: schema_88.fields.properties.銀行名.code,
                label: schema_88.fields.properties.銀行名.label,
            },
            branchCode: {
                code: schema_88.fields.properties.支店コード.code,
                label: schema_88.fields.properties.支店コード.label,
            },
            branchName: {
                code: schema_88.fields.properties.支店名.code,
                label: schema_88.fields.properties.支店名.label,
            },
            depositType: {
                code: schema_88.fields.properties.預金種目.code,
                label: schema_88.fields.properties.預金種目.label,
            },
            number: {
                code: schema_88.fields.properties.口座番号.code,
                label: schema_88.fields.properties.口座番号.label,
            },
            name: {
                code: schema_88.fields.properties.口座名義.code,
                label: schema_88.fields.properties.口座名義.label,
            },
        },
        notify: {
            date: schema_88.fields.properties.申込メール送付日.code,
            method: schema_88.fields.properties.送付方法.code,
        },
    },
};


const ordererApp = {
    fields: {
        id: schema_96.fields.properties.id.code,
        name: schema_96.fields.properties.工務店正式名称.code,
        service: schema_96.fields.properties.service.code,
    },
};


(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton()) {
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(createButton(event.record));
        }
    });
})();

const button_id = "addKyoryokuMaster";
const button_title = "協力会社マスタの確認・追加";
const needShowButton = () => {
    const exists_same_button = document.getElementById(button_id) !== null;
    return !exists_same_button;
};

const createButton = (record) => {
    const button = document.createElement("button");
    button.id = button_id;
    button.innerText = button_title;
    button.addEventListener("click", clickButton.bind(null, record));
    return button;
};

const confirmBeforeExec = () => {
    const before_process = "このレコードについて、協力会社マスタとの紐付けを行いますか？";
    return window.confirm(before_process);
};

const clickButton = async (apply_record) => {
    if (!confirmBeforeExec()) {
        alert("処理は中断されました。");
        return;
    }

    document.getElementById(button_id).innerText = "処理中...";

    try {
        // 本スクリプトは協力会社マスタのレコードの新規作成を目的としている。
        // 従って協力会社IDも新規に決定するが、そのためには工務店IDが必須となる。
        // よって工務店IDが未入力のレコードは処理できない
        if (!apply_record[applyApp.fields.orderer.id]["value"]) {
            alert("工務店IDが空欄です。\n工務店IDを入力してからもう一度実行してください。");
            throw new ManualAbortProcessError();
        }

        const kyoryoku_id = await getKyoryokuId(apply_record)
            .catch((err) => { throw new Error(err); });
        if (!kyoryoku_id) { throw new ManualAbortProcessError(); }

        console.log(`協力会社ID${kyoryoku_id}の取得を完了`);

        await updateKyoryokuMaster(kyoryoku_id, apply_record);
        console.log("協力会社マスタとの比較および更新を完了");

        alert(`申込レコードに協力会社ID: ${kyoryoku_id} を入力して、マスタの内容を反映します。`);
        await updateApply(apply_record[applyApp.fields.recordNo]["value"], kyoryoku_id);
        alert("完了しました。");
        window.location.reload();
    } catch (e) {
        if (e instanceof ManualAbortProcessError) {
            alert("処理を中断しました");
        } else {
            console.error(e);
            const additional_info = e.message
                ? e.message
                : JSON.stringify(e);
            alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                + "\n追加の情報: "
                + `\n${additional_info}`);
        }
    } finally {
        alert("処理を終了します。");
        document.getElementById(button_id).innerText = button_title;
    }
};

const getKyoryokuId = async (apply_record) => {
    // 最初から協力会社IDが申込レコードに入っている場合はそれを信用する
    const default_id = apply_record[applyApp.fields.applicant.id]["value"];
    if (default_id) {
        alert(`申込レコードに協力会社ID: ${default_id}が入力されているため、このIDを使用します。`);
        return default_id;
    }

    alert(`${schema_88.id.name}アプリにレコードが既に存在するか確認します。`);
    const conds = getCustomerMasterConditions({
        customerName: apply_record[applyApp.fields.applicant.name.code]["value"],
        customerPhone: apply_record[applyApp.fields.applicant.phone.code]["value"],
        customerEmail: apply_record[applyApp.fields.applicant.email.code]["value"],
    });
    const kyoryoku_record = await getMasterRecord({ conds });
    console.log(`${schema_88.id.name}アプリの取得を完了。`);

    if (kyoryoku_record && kyoryoku_record.records.length === 1) {
        const num = kyoryoku_record.records[0][laborApp.fields.id]["value"];
        alert(`協力会社マスタにレコードが見つかりました。協力会社ID: ${num}`);
        return num;
    } else if (kyoryoku_record && kyoryoku_record.records.length > 1) {
        const nums = kyoryoku_record.records.map((r) => r[laborApp.fields.id]["value"]).join(", ");
        alert("協力会社マスタに、このレコードの申込者が重複して登録されているようです。"
            + "\n今後も利用するレコードを一つだけ残してから再度操作してください。"
            + "\n※既に他のアプリで協力会社IDが使用されている場合はレコードの削除に注意してください。"
            + `\n重複している協力会社ID: ${nums}`);
        throw new ManualAbortProcessError();
    } else {
        alert("レコードが見つからなかったため、新規作成します。"
            + `\n${schema_28.id.name}アプリを検索します。`);
        const company_record = await searchCompanyRecord(getSearchQuery(apply_record));
        console.log(`${schema_28.id.name}アプリの取得を完了。`);

        const company_id = selectCompanyRecordNumber(company_record);
        console.log(`レコード番号${company_id}を取得完了`);

        return await createKyoryokuRecord(apply_record, company_id);
    }
};
/**
* @summary 協力会社マスタ検索時に指定する検索条件の配列を取得する。
* @param {string?} customerName - ファクタリングの申込者名。
* @param {string?} customerPhone - ファクタリングの申込者の電話番号。
* @param {string?} customerEmail - ファクタリングの申込者のメールアドレス。
* @return {string[]} kintone REST APIの検索条件として使用可能な文字列の配列。
*/

export const getCustomerMasterConditions = ({ customerName, customerPhone, customerEmail }) => {
    const queries = [];
    if (customerName) {
        queries.push(`${laborApp.fields.name.code} = "${customerName}"`);
        queries.push(`${laborApp.fields.generalName.code} = "${customerName}"`);
    }

    if (customerPhone) {
        queries.push(`${laborApp.fields.phone.primary.code} = "${customerPhone}"`);
        queries.push(`${laborApp.fields.phone.secondary.code} = "${customerPhone}"`);
    }

    if (customerEmail) {
        queries.push(`${laborApp.fields.email.code} = "${customerEmail}"`);
    }
    return queries;
};

const getMasterRecord = ({ conds }) => {
    // 申込アプリのレコードの申込者が既に協力会社マスタの中に存在するか検索する。
    // 検索フィールド：支払先, 支払先正式名称, 担当者名, メールアドレス, 電話番号(携帯/固定)
    const body = {
        app: schema_88.id.appId,
        fields: [laborApp.fields.id],
        query: `${conds.join(" or ")}`,
    };
    return CLIENT.record.getRecords(body);
};

const createKyoryokuRecord = async (apply, company_id) => {
    const komutenId = apply[applyApp.fields.orderer.id]["value"];
    const new_kyoryoku_id = await (async () => {
        const has_same_komuten = getSameKomutenKyoryokuCond(komutenId);
        const is_not_test = `${laborApp.fields.generalName.code} not like "テスト"\
            and ${laborApp.fields.generalName.code} not like "test"\
            and ${laborApp.fields.orderer.name} not like "テスト"\
            and ${laborApp.fields.orderer.name} not like "test"`;
        // 連番で新たな協力会社IDを取得する。
        const allKyoryoku = {
            app: schema_88.id.appId,
            fields: [laborApp.fields.id],
            condition: `(${has_same_komuten}) and (${is_not_test})`,
            orderBy: `${laborApp.fields.id} desc`
        };
        const result = await CLIENT.record.getAllRecords(allKyoryoku);
        const latest_id = Number(result[0][laborApp.fields.id]["value"]);
        return latest_id + 1;
    })();

    const komuten = await CLIENT.record.getRecords({
        app: schema_96.id.appId,
        fields: [
            ordererApp.fields.id,
            ordererApp.fields.name,
            ordererApp.fields.service,
        ],
        query: `${ordererApp.fields.id} = "${normalizedConstructorId(apply[applyApp.fields.orderer.id]["value"])}"`
    });

    const new_record = {
        [laborApp.fields.id]: new_kyoryoku_id,
        [laborApp.fields.orderer.id]: normalizedConstructorId(apply[applyApp.fields.orderer.id]["value"]),
        [laborApp.fields.corporateId]: company_id,
        [laborApp.fields.name.code]: apply[applyApp.fields.applicant.name.code]["value"],
        [laborApp.fields.generalName.code]: apply[applyApp.fields.applicant.name.code]["value"],
        [laborApp.fields.orderer.name]: komuten.records[0][ordererApp.fields.name].value,
        [laborApp.fields.service]: productNameMap.fromKomuten[komuten.records[0][ordererApp.fields.service].value],
        [laborApp.fields.bankAccount.bankName.code]: apply[applyApp.fields.applicant.bankAccount.bankName.code]["value"],
        [laborApp.fields.bankAccount.bankCode.code]: apply[applyApp.fields.applicant.bankAccount.bankCode.code]["value"],
        [laborApp.fields.bankAccount.branchName.code]: apply[applyApp.fields.applicant.bankAccount.branchName.code]["value"],
        [laborApp.fields.bankAccount.branchCode.code]: apply[applyApp.fields.applicant.bankAccount.branchCode.code]["value"],
        [laborApp.fields.bankAccount.depositType.code]: apply[applyApp.fields.applicant.bankAccount.depositType.code]["value"],
        [laborApp.fields.bankAccount.number.code]: apply[applyApp.fields.applicant.bankAccount.number.code]["value"],
        [laborApp.fields.bankAccount.name.code]: apply[applyApp.fields.applicant.bankAccount.name.code]["value"],
        [laborApp.fields.email.code]: apply[applyApp.fields.applicant.email.code]["value"],
        [laborApp.fields.phone.primary.code]: apply[applyApp.fields.applicant.phone.code]["value"],
    };

    if (!KE_BAN_CONSTRUCTORS.includes(komutenId) && !isGigConstructorID(komutenId)) {
        // 案内メールの送付設定を行う
        new_record[laborApp.fields.notify.date] = 20;
        const method = choiceNotifyMethod({
            emailAddress: apply[applyApp.fields.applicant.email.code].value,
            phoneNumber: apply[applyApp.fields.applicant.phone.code].value
        });
        new_record[laborApp.fields.notify.method] = method;
    }

    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_88.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    alert(`協力会社マスタに新規レコード(レコード番号: ${result.id})を新規作成しました。`);
    return new_kyoryoku_id;
};

const updateKyoryokuMaster = async (kyoryoku_id, apply_record) => {
    // 申込レコードとマスタの情報が異なる場合、それぞれのフィールドについて上書きするかどうか尋ねる
    const resp = await CLIENT.record.getRecords({
        app: schema_88.id.appId,
        query: `${laborApp.fields.id} = ${kyoryoku_id}`
    });
    const kyoryoku = resp.records[0];

    const compare_fields = [
        { apply: applyApp.fields.applicant.name.code,                   a_dsp: applyApp.fields.applicant.name.label,                    kyoryoku: laborApp.fields.name.code,        k_dsp: laborApp.fields.name.label,          do_update: false },
        { apply: applyApp.fields.applicant.name.code,                   a_dsp: applyApp.fields.applicant.name.label,                    kyoryoku: laborApp.fields.generalName.code, k_dsp: laborApp.fields.generalName.label,   do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.bankName.code,   a_dsp: applyApp.fields.applicant.bankAccount.bankName.label,    kyoryoku: laborApp.fields.bankAccount.bankName.code,    k_dsp: laborApp.fields.bankAccount.bankName.label,  do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.bankCode.code,   a_dsp: applyApp.fields.applicant.bankAccount.bankCode.label,    kyoryoku: laborApp.fields.bankAccount.bankCode.code,    k_dsp: laborApp.fields.bankAccount.bankCode.label,  do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.branchName.code, a_dsp: applyApp.fields.applicant.bankAccount.branchName.label,  kyoryoku: laborApp.fields.bankAccount.branchName.code,  k_dsp: laborApp.fields.bankAccount.branchName.label,    do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.branchCode.code, a_dsp: applyApp.fields.applicant.bankAccount.branchCode.label,  kyoryoku: laborApp.fields.bankAccount.branchCode.code,  k_dsp: laborApp.fields.bankAccount.branchCode.label,    do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.depositType.code,a_dsp: applyApp.fields.applicant.bankAccount.depositType.label, kyoryoku: laborApp.fields.bankAccount.depositType.code, k_dsp: laborApp.fields.bankAccount.depositType.label,   do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.number.code,     a_dsp: applyApp.fields.applicant.bankAccount.number.label,      kyoryoku: laborApp.fields.bankAccount.number.code,      k_dsp: laborApp.fields.bankAccount.number.label,        do_update: false },
        { apply: applyApp.fields.applicant.bankAccount.name.code,       a_dsp: applyApp.fields.applicant.bankAccount.name.label,        kyoryoku: laborApp.fields.bankAccount.name.code,        k_dsp: laborApp.fields.bankAccount.name.label,          do_update: false },
        { apply: applyApp.fields.applicant.email.code,                  a_dsp: applyApp.fields.applicant.email.label,                   kyoryoku: laborApp.fields.email.code,           k_dsp: laborApp.fields.email.label,         do_update: false },
        { apply: applyApp.fields.applicant.phone.code,                  a_dsp: applyApp.fields.applicant.phone.label,                   kyoryoku: laborApp.fields.phone.primary.code,   k_dsp: laborApp.fields.phone.primary.label, do_update: false },
    ];
    for (const fields of compare_fields) {
        const apply_val = apply_record[fields.apply]["value"];
        const kyoryoku_val = kyoryoku[fields.kyoryoku]["value"];
        if (String(apply_val) !== String(kyoryoku_val)) {
            const message = "申込とマスタの登録内容が異なります。マスタを変更して上書きしますか？"
                + `\n申込(${fields.a_dsp}): ${apply_val}`
                + `\nマスタ(${fields.k_dsp}): ${kyoryoku_val}`;
            fields.do_update = confirm(message);
        }
    }

    if (compare_fields.some((f) => f.do_update)) {
        alert("申込の内容を使って、マスタの一部分を上書きします。");
        const record = {};
        compare_fields
            .filter((f) => f.do_update)
            .forEach((f) => {
                record[f.kyoryoku] = { value: apply_record[f.apply]["value"] };
            });

        await CLIENT.record.updateRecord({
            app: schema_88.id.appId,
            id: kyoryoku[laborApp.fields.recordNo]["value"],
            record: record
        });

        alert("マスタの上書きが完了しました。");
    }
};

const updateApply = (apply_id, kyoryoku_id) => {
    const body = {
        app: kintone.app.getId(),
        id: apply_id,
        record: { [applyApp.fields.applicant.id]: { value: kyoryoku_id } }
    };
    return CLIENT.record.updateRecord(body);
};
