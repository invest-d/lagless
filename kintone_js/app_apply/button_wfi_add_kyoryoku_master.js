/*
    Version 1
    WFIの申込レコードに限り、協力会社マスタデータの追加オペレーションを補佐する。
*/

"use strict";

import { CLIENT } from "../util/kintoneAPI";

const ExtensibleCustomError = require("extensible-custom-error");
class ManualAbortProcessError extends ExtensibleCustomError { }

import { getApplyAppSchema, UnknownAppError } from "../util/choiceApplyAppSchema";
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
const applyFields = schema.fields.properties;
const recordNo_APPLY                = applyFields.レコード番号.code;
const builderName_APPLY             = applyFields.billingCompany.code;
const applicantName_APPLY           = applyFields.company.code;
const applicantName_APPLY_D         = applyFields.company.label;
const applicantPhone_APPLY          = applyFields.phone.code;
const applicantPhone_APPLY_D        = applyFields.phone.label;
const applicantEmail_APPLY          = applyFields.mail.code;
const applicantEmail_APPLY_D        = applyFields.mail.label;
const kyoryokuId_APPLY              = applyFields.ルックアップ.code;
const bankName_APPLY                = applyFields.bankName_Form.code;
const bankName_APPLY_D              = applyFields.bankName_Form.label;
const bankCode_APPLY                = applyFields.bankCode_Form.code;
const bankCode_APPLY_D              = applyFields.bankCode_Form.label;
const branchName_APPLY              = applyFields.branchName_Form.code;
const branchName_APPLY_D            = applyFields.branchName_Form.label;
const branchCode_APPLY              = applyFields.branchCode_Form.code;
const branchCode_APPLY_D            = applyFields.branchCode_Form.label;
const depositType_APPLY             = applyFields.deposit_Form.code;
const depositType_APPLY_D           = applyFields.deposit_Form.label;
const accountNumber_APPLY           = applyFields.accountNumber_Form.code;
const accountNumber_APPLY_D         = applyFields.accountNumber_Form.label;
const accountName_APPLY             = applyFields.accountName_Form.code;
const accountName_APPLY_D           = applyFields.accountName_Form.label;

import { schema_88 } from "../88/schema";
const customerFields = schema_88.fields.properties;
const recordNo_KYORYOKU                 = customerFields.レコード番号.code;
const kyoryokuId_KYORYOKU               = customerFields.支払企業No_.code;
const komutenId_KYORYOKU                = customerFields.工務店ID.code;
const companyId_KYORYOKU                = customerFields.取引企業管理No.code;
const kyoryokuName_KYORYOKU             = customerFields.支払先.code;
const kyoryokuName_KYORYOKU_D           = customerFields.支払先.label;
const kyoryokuGeneralName_KYORYOKU      = customerFields.支払先正式名称.code;
const kyoryokuGeneralName_KYORYOKU_D    = customerFields.支払先正式名称.label;
const phoneNumber_KYORYOKU              = customerFields.電話番号.code;
const phoneNumber_KYORYOKU_D            = customerFields.電話番号.label;
const phoneNumber2_KYORYOKU             = customerFields.電話番号２.code;
const email_KYORYOKU                    = customerFields.メールアドレス.code;
const email_KYORYOKU_D                  = customerFields.メールアドレス.label;
const komutenName_KYORYOKU              = customerFields.工務店名.code;
const productName_KYORYOKU              = customerFields.商品名.code;
const productKeban_KYORYOKU             = customerFields.商品名.options["軽バン.com"].label;
const bankName_KYORYOKU                 = customerFields.銀行名.code;
const bankName_KYORYOKU_D               = customerFields.銀行名.label;
const bankCode_KYORYOKU                 = customerFields.金融機関コード.code;
const bankCode_KYORYOKU_D               = customerFields.金融機関コード.label;
const branchName_KYORYOKU               = customerFields.支店名.code;
const branchName_KYORYOKU_D             = customerFields.支店名.label;
const branchCode_KYORYOKU               = customerFields.支店コード.code;
const branchCode_KYORYOKU_D             = customerFields.支店コード.label;
const depositType_KYORYOKU              = customerFields.預金種目.code;
const depositType_KYORYOKU_D            = customerFields.預金種目.label;
const accountNumber_KYORYOKU            = customerFields.口座番号.code;
const accountNumber_KYORYOKU_D          = customerFields.口座番号.label;
const accountName_KYORYOKU              = customerFields.口座名義.code;
const accountName_KYORYOKU_D            = customerFields.口座名義.label;

import { schema_28 } from "../28/schema";

import { KE_BAN_CONSTRUCTORS } from "../96/common";
import {
    getCompanyRecord,
    selectCompanyRecordNumber,
    getSearchInfo,
} from "./button_wfi_antisocial_check";

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.detail.show", (event) => {
        if (needShowButton(event.record[builderName_APPLY].value)) {
            kintone.app.record.getHeaderMenuSpaceElement().appendChild(createButton(event.record));
        }
    });
})();

const button_id = "addWfiKyoryokuMaster";
const button_title = "(WFI用)協力会社マスタの確認・追加";
const needShowButton = (builder_name) => {
    const exists_same_button = document.getElementById(button_id) !== null;
    const is_Wfi_apply = builder_name.includes("ワールドフォース");
    return !exists_same_button && is_Wfi_apply;
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
        const kyoryoku_id = await getKyoryokuId(apply_record)
            .catch((err) => { throw new Error(err); });
        if (!kyoryoku_id) { throw new ManualAbortProcessError(); }

        console.log(`協力会社ID${kyoryoku_id}の取得を完了`);

        await updateKyoryokuMaster(kyoryoku_id, apply_record);
        console.log("協力会社マスタとの比較および更新を完了");

        alert(`申込レコードに協力会社ID: ${kyoryoku_id} を入力して、マスタの内容を反映します。`);
        await updateApply(apply_record[recordNo_APPLY]["value"], kyoryoku_id);
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
    const default_id = apply_record[kyoryokuId_APPLY]["value"];
    if (default_id) {
        alert(`申込レコードに協力会社ID: ${default_id}が入力されているため、このIDを使用します。`);
        return default_id;
    }

    alert(`${schema_88.id.name}アプリにレコードが既に存在するか確認します。`);
    const kyoryoku_record = await getMasterRecord({
        name: apply_record[applicantName_APPLY]["value"],
        phone: apply_record[applicantPhone_APPLY]["value"],
        email: apply_record[applicantEmail_APPLY]["value"],
    });
    console.log(`${schema_88.id.name}アプリの取得を完了。`);

    if (kyoryoku_record && kyoryoku_record.records.length === 1) {
        const num = kyoryoku_record.records[0][kyoryokuId_KYORYOKU]["value"];
        alert(`協力会社マスタにレコードが見つかりました。協力会社ID: ${num}`);
        return num;
    } else if (kyoryoku_record && kyoryoku_record.records.length > 1) {
        const nums = kyoryoku_record.records.map((r) => r[kyoryokuId_KYORYOKU]["value"]).join(", ");
        alert("協力会社マスタに、ドライバーが重複して登録されているようです。"
            + "\n今後も利用するレコードを一つだけ残してから再度操作してください。"
            + "\n※既に他のアプリで協力会社IDが使用されている場合はレコードの削除に注意してください。"
            + `\n重複している協力会社ID: ${nums}`);
        throw new ManualAbortProcessError();
    } else {
        alert("レコードが見つからなかったため、新規作成します。"
            + `\n${schema_28.id.name}アプリを検索します。`);
        const company_record = await getCompanyRecord(getSearchInfo(apply_record));
        console.log(`${schema_28.id.name}アプリの取得を完了。`);

        const company_id = selectCompanyRecordNumber(company_record);
        console.log(`レコード番号${company_id}を取得完了`);

        return await createKyoryokuRecord(apply_record, company_id);
    }
};

const getMasterRecord = (info) => {
    // 申込アプリのWFIドライバーが(軽バンの工務店IDを持つ)協力会社マスタの中に存在するか検索する。
    // 検索フィールド：ドライバーID, 支払先, 支払先正式名称, 担当者名, メールアドレス, 電話番号(携帯/固定)
    const queries = [];
    if (info.name) {
        queries.push(`${kyoryokuName_KYORYOKU} = "${info.name}"`);
        queries.push(`${kyoryokuGeneralName_KYORYOKU} = "${info.name}"`);
    }

    if (info.phone) {
        queries.push(`${phoneNumber_KYORYOKU} = "${info.phone}"`);
        queries.push(`${phoneNumber2_KYORYOKU} = "${info.phone}"`);
    }

    if (info.email) {
        queries.push(`${email_KYORYOKU} = "${info.email}"`);
    }

    const in_query = KE_BAN_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
    const is_keban_kyoryoku = `${komutenId_KYORYOKU} in (${in_query})`;

    const query = `(${queries.join(" or ")}) and (${is_keban_kyoryoku})`;

    const body = {
        app: schema_88.id.appId,
        fields: [kyoryokuId_KYORYOKU],
        query: query
    };
    return CLIENT.record.getRecords(body);
};

const createKyoryokuRecord = async (apply, company_id) => {
    const new_kyoryoku_id = await (async () => {
        const in_query = KE_BAN_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        const is_keban_kyoryoku = `${komutenId_KYORYOKU} in (${in_query})`;
        const is_not_test = `${kyoryokuGeneralName_KYORYOKU} not like "テスト"\
            and ${kyoryokuGeneralName_KYORYOKU} not like "test"\
            and ${komutenName_KYORYOKU} not like "テスト"\
            and ${komutenName_KYORYOKU} not like "test"`;
        // 連番で新たな協力会社IDを取得する。
        const all_keban = {
            app: schema_88.id.appId,
            fields: [kyoryokuId_KYORYOKU],
            condition: `(${is_keban_kyoryoku}) and (${is_not_test})`,
            orderBy: `${kyoryokuId_KYORYOKU} desc`
        };
        const result = await CLIENT.record.getAllRecords(all_keban);
        const latest_id = Number(result[0][kyoryokuId_KYORYOKU]["value"]);
        return latest_id + 1;
    })();

    const new_record = {
        [kyoryokuId_KYORYOKU]: new_kyoryoku_id,
        [komutenId_KYORYOKU]: "400",
        [companyId_KYORYOKU]: company_id,
        [kyoryokuName_KYORYOKU]: apply[applicantName_APPLY]["value"],
        [kyoryokuGeneralName_KYORYOKU]: apply[applicantName_APPLY]["value"],
        [komutenName_KYORYOKU]: "株式会社ワールドフォースインターナショナル",
        [productName_KYORYOKU]: productKeban_KYORYOKU,
        [bankName_KYORYOKU]: apply[bankName_APPLY]["value"],
        [bankCode_KYORYOKU]: apply[bankCode_APPLY]["value"],
        [branchName_KYORYOKU]: apply[branchName_APPLY]["value"],
        [branchCode_KYORYOKU]: apply[branchCode_APPLY]["value"],
        [depositType_KYORYOKU]: apply[depositType_APPLY]["value"],
        [accountNumber_KYORYOKU]: apply[accountNumber_APPLY]["value"],
        [accountName_KYORYOKU]: apply[accountName_APPLY]["value"],
        [email_KYORYOKU]: apply[applicantEmail_APPLY]["value"],
        [phoneNumber_KYORYOKU]: apply[applicantPhone_APPLY]["value"],
    };
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
        query: `${kyoryokuId_KYORYOKU} = ${kyoryoku_id}`
    });
    const kyoryoku = resp.records[0];

    const compare_fields = [
        { apply: applicantName_APPLY,   a_dsp: applicantName_APPLY_D,   kyoryoku: kyoryokuName_KYORYOKU,        k_dsp: kyoryokuName_KYORYOKU_D,         do_update: false },
        { apply: applicantName_APPLY,   a_dsp: applicantName_APPLY_D,   kyoryoku: kyoryokuGeneralName_KYORYOKU, k_dsp: kyoryokuGeneralName_KYORYOKU_D,  do_update: false },
        { apply: bankName_APPLY,        a_dsp: bankName_APPLY_D,        kyoryoku: bankName_KYORYOKU,            k_dsp: bankName_KYORYOKU_D,             do_update: false },
        { apply: bankCode_APPLY,        a_dsp: bankCode_APPLY_D,        kyoryoku: bankCode_KYORYOKU,            k_dsp: bankCode_KYORYOKU_D,             do_update: false },
        { apply: branchName_APPLY,      a_dsp: branchName_APPLY_D,      kyoryoku: branchName_KYORYOKU,          k_dsp: branchName_KYORYOKU_D,           do_update: false },
        { apply: branchCode_APPLY,      a_dsp: branchCode_APPLY_D,      kyoryoku: branchCode_KYORYOKU,          k_dsp: branchCode_KYORYOKU_D,           do_update: false },
        { apply: depositType_APPLY,     a_dsp: depositType_APPLY_D,     kyoryoku: depositType_KYORYOKU,         k_dsp: depositType_KYORYOKU_D,          do_update: false },
        { apply: accountNumber_APPLY,   a_dsp: accountNumber_APPLY_D,   kyoryoku: accountNumber_KYORYOKU,       k_dsp: accountNumber_KYORYOKU_D,        do_update: false },
        { apply: accountName_APPLY,     a_dsp: accountName_APPLY_D,     kyoryoku: accountName_KYORYOKU,         k_dsp: accountName_KYORYOKU_D,          do_update: false },
        { apply: applicantEmail_APPLY,  a_dsp: applicantEmail_APPLY_D,  kyoryoku: email_KYORYOKU,               k_dsp: email_KYORYOKU_D,                do_update: false },
        { apply: applicantPhone_APPLY,  a_dsp: applicantPhone_APPLY_D,  kyoryoku: phoneNumber_KYORYOKU,         k_dsp: phoneNumber_KYORYOKU_D,          do_update: false },
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
            id: kyoryoku[recordNo_KYORYOKU]["value"],
            record: record
        });

        alert("マスタの上書きが完了しました。");
    }
};

const updateApply = (apply_id, kyoryoku_id) => {
    const body = {
        app: kintone.app.getId(),
        id: apply_id,
        record: { [kyoryokuId_APPLY]: { value: kyoryoku_id } }
    };
    return CLIENT.record.updateRecord(body);
};
