"use strict";

import { schema_apply } from "../../161/schema";
import { schema_28 } from "../../28/schema";
import { schema_61 } from "../../61/schema";
import { schema_96 } from "../../96/schema";
import { CLIENT } from "../../util/kintoneAPI";
import { replaceFullWidthNumbers } from "../../util/manipulations";
import { isKeban } from "../../96/common";
import { request } from "./corporateApi";
import { choiceCorporateNumber, cleansedPref, getTransactionType } from "./testableLogics";
import { isGigConstructorID } from "../../util/gig_utils";

const applicantName_APPLY = schema_apply.fields.properties.company.code;
const applicantRepresentative_APPLY = schema_apply.fields.properties.representative.code;
const applicantPhone_APPLY = schema_apply.fields.properties.phone.code;
const applicantEmail_APPLY = schema_apply.fields.properties.mail.code;
const applicantPref_APPLY = schema_apply.fields.properties.prefecture.code;
const applicantAddr_APPLY = schema_apply.fields.properties.address.code;
const applicantSt_APPLY = schema_apply.fields.properties.streetAddress.code;
const applicantZipcode_APPLY = schema_apply.fields.properties.postalCode.code;
const constructorId_APPLY = schema_apply.fields.properties.constructionShopId.code;
const gigOrdererName_APPLY = schema_apply.fields.properties.ordererGig.code;

const recordNo_COMPANY = schema_28.fields.properties.レコード番号.code;
const companyName_COMPANY = schema_28.fields.properties["法人名・屋号"].code;
const corporateNum_COMPANY = schema_28.fields.properties.法人番号.code;
const representative_COMPANY = schema_28.fields.properties.代表者名.code;
const phoneNumber_COMPANY = schema_28.fields.properties.TEL_本店.code;
const email_COMPANY = schema_28.fields.properties.メールアドレス_会社.code;
const address_COMPANY = schema_28.fields.properties.住所_本店.code;
const addressAuto_COMPANY = schema_28.fields.properties.住所_HubSpotより.code;
const transactionType_COMPANY = schema_28.fields.properties.取引区分.code;
const payerCompany = schema_28.fields.properties.取引区分.options.支払企業.label;
const companyType_COMPANY = schema_28.fields.properties.企業形態.code;
const type_person_COMPANY = schema_28.fields.properties.企業形態.options.個人企業.label;
const type_corporate_COMPANY = schema_28.fields.properties.企業形態.options.法人企業.label;
const zipcodeNormal_COMPANY = schema_28.fields.properties.郵便番号_本店.code;
const zipcodeAuto_COMPANY = schema_28.fields.properties.郵便番号_HubSpotより.code;

const constructorApp = {
    fields: {
        constructorId: schema_96.fields.properties.id.code,
        companyId: schema_96.fields.properties.customerCode.code,
    }
};

const WFI_COMPANY_ID = "4736";
const corporateWebApi = "97";
const idField_CREDS = schema_61.fields.properties.ID.code;


export const getFullAddress = (applyRecord) =>
    applyRecord[applicantPref_APPLY]["value"]
    + applyRecord[applicantAddr_APPLY]["value"]
    + applyRecord[applicantSt_APPLY]["value"];

export const searchCompanyRecord = (query) => {
    const body = {
        app: schema_28.id.appId,
        query,
    };
    return CLIENT.record.getRecords(body);
};

export const getOrCreateCompanyId = async (companyRecord, applyRecord) => {
    if (companyRecord && companyRecord.records.length) {
        return selectCompanyRecordNumber(companyRecord);
    } else {
        alert("レコードが見つからなかったため、新規作成します。");
        const corporateNum = await (async () => {
            const cred = await CLIENT.record.getRecord({
                app: schema_61.id.appId,
                id: corporateWebApi
            });
            const conds = {
                "id": cred.record[idField_CREDS].value,
                "name": applyRecord[applicantName_APPLY].value,
                "type": "02",
                "mode": "2",
                "target": "1",
            };

            // 末尾の/(都|道|府|県)$/が省略されている可能性を考慮して、予め取り除く
            const pref = cleansedPref(applyRecord[applicantPref_APPLY].value);
            if (pref) conds.address = jisx0401[pref];

            const { summary, data } = await request(conds);
            return choiceCorporateNumber(summary, data);
        })();

        if (!corporateNum) {
            alert("個人事業主として取引企業管理アプリにレコードを作成します。");
        }

        return await createCompanyRecord(applyRecord, corporateNum);
    }
};

const jisx0401 = {
    "群馬": "10",
    "埼玉": "11",
    "千葉": "12",
    "東京": "13",
    "神奈川": "14",
    "新潟": "15",
    "富山": "16",
    "石川": "17",
    "福井": "18",
    "山梨": "19",
    "長野": "20",
    "岐阜": "21",
    "静岡": "22",
    "愛知": "23",
    "三重": "24",
    "滋賀": "25",
    "京都": "26",
    "大阪": "27",
    "兵庫": "28",
    "奈良": "29",
    "和歌山": "30",
    "鳥取": "31",
    "島根": "32",
    "岡山": "33",
    "広島": "34",
    "山口": "35",
    "徳島": "36",
    "香川": "37",
    "愛媛": "38",
    "高知": "39",
    "福岡": "40",
    "佐賀": "41",
    "長崎": "42",
    "熊本": "43",
    "大分": "44",
    "宮崎": "45",
    "鹿児島": "46",
    "沖縄": "47",
    "北海": "01",
    "青森": "02",
    "岩手": "03",
    "宮城": "04",
    "秋田": "05",
    "山形": "06",
    "福島": "07",
    "茨城": "08",
    "栃木": "09",
};

export const selectCompanyRecordNumber = (companyRecord) => {
    // companyRecordが存在する場合。nullもしくは数値のレコード番号を返す
    const returnAsNumber = (input) => Number(replaceFullWidthNumbers(input));
    const recordRepr = (record) => `レコードNo: ${record[recordNo_COMPANY]["value"]}, `
        + `会社名: ${record[companyName_COMPANY]["value"]}, `
        + `所在地: ${record[address_COMPANY]["value"]}`;

    if (companyRecord.records.length === 1) {
        const num = companyRecord.records[0][recordNo_COMPANY]["value"];
        const message = "レコードが見つかりました。"
            + `\n${recordRepr(companyRecord.records[0])}`
            + "\nこのレコードを使って進めますか？";

        if (confirm(message)) return Number(num);

        const input = prompt("使用するレコード番号を手入力してください");
        if (input) return returnAsNumber(input);

        return null;
    } else {
        const reprs = companyRecord.records.map((r) => recordRepr(r)).join("\n");
        const message = `複数のレコードが見つかりました。\n${reprs}`
            + "\nどのレコード番号で進めますか？";
        const input = prompt(message);
        if (input) return returnAsNumber(input);
        return null;
    }
};

const createCompanyRecord = async (apply, corporateNum) => {
    const /** @type {"譲渡企業"|"支払企業"} */ transactionType = getTransactionType({
        constructorId: apply[constructorId_APPLY]["value"],
    });

    const companyType = corporateNum ? type_corporate_COMPANY : type_person_COMPANY;

    const new_record = {
        [companyName_COMPANY]: apply[applicantName_APPLY]["value"],
        [transactionType_COMPANY]: [transactionType],
        [companyType_COMPANY]: companyType,
        [representative_COMPANY]: apply[applicantRepresentative_APPLY]["value"],
        [zipcodeNormal_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [zipcodeAuto_COMPANY]: apply[applicantZipcode_APPLY]["value"],
        [address_COMPANY]: getFullAddress(apply),
        [addressAuto_COMPANY]: getFullAddress(apply),
        [phoneNumber_COMPANY]: apply[applicantPhone_APPLY]["value"],
        [email_COMPANY]: apply[applicantEmail_APPLY]["value"]
    };

    // 取引企業管理アプリに登録する法人番号は、上一桁のチェックデジットを除く12桁
    if (corporateNum) new_record[corporateNum_COMPANY] = corporateNum.slice(-12);

    Object.keys(new_record).forEach((k) => new_record[k] = { value: new_record[k] });
    const body = {
        app: schema_28.id.appId,
        record: new_record
    };
    const result = await CLIENT.record.addRecord(body);
    alert(`レコード(${result.id})を新規作成しました。`);
    return result.id;
};

/**
* @summary 工務店IDを元にして、ファクタリングをしない場合にお金を支払う本来の企業の取引企業管理アプリにおけるレコード番号を取得する
* @param {string} constructorId
* @return {string|undefined}
*/
export const getPayerCompanyId = async (applyRecord) => {
    const constructorId = applyRecord[constructorId_APPLY].value;

    // 既知の工務店はAPIを利用せずにそのまま返す
    if (isKeban(constructorId)) return WFI_COMPANY_ID;

    if (isGigConstructorID(constructorId)) {
        // 工務店IDを手がかりに当たるのではなく、発注企業名から当たる
        const ordererName = applyRecord[gigOrdererName_APPLY].value;
        const conds = {
            app: schema_28.id.appId,
            query: `${companyName_COMPANY} like "${ordererName}"
            and ${transactionType_COMPANY} = "${payerCompany}"`,
        };
        const company = await CLIENT.record.getRecords(conds);
        if (company.records.length === 0) {
            alert(`${ordererName} が取引企業管理アプリに存在しません`);
            return undefined;
        }
        // 1件だけが引っかかる前提
        return company.records[0][recordNo_COMPANY].value;
    } else {
        // 一般の工務店の場合は工務店マスタ→取引企業管理アプリで辿れる
        const conds = {
            app: schema_96.id.appId,
            query: `${constructorApp.fields.constructorId} = "${constructorId}"`,
        };
        const constructor = await CLIENT.record.getRecords(conds);
        // 存在する前提
        const companyId = constructor.records[0][constructorApp.fields.companyId].value;
        if (!companyId) alert("工務店マスタに取引企業管理Noを入力していません。");
        return companyId;
    }
};
