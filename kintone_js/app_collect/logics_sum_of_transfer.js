/*
    Version 1
    WFIの回収レコードに限り、アプリ内のスペース（空白）に下記情報を表示する。
    クラウドサイン対象レコードの合計件数
    同・それぞれの対象債権金額からファクタリング手数料と振込手数料を引いた合計金額
*/

const consumption_tax_rate = 0.1;

import { CLIENT } from "../util/kintoneAPI";
import { Decimal } from "decimal.js";

import { KE_BAN_CONSTRUCTORS } from "../96/common";
import { schema_96 } from "../96/schema";
const appId_CONSTRUCTOR = schema_96.id.appId;
const constructorIdField_CONSTRUCTOR = schema_96.fields.properties.id.code;
const transferFeeField_CONSTRUCTOR = schema_96.fields.properties.tmptransferFee.code;
const factoringFeeField_CONSTRUCTOR = schema_96.fields.properties.tmpcommissionRate.code;

import { addComma } from "../util/util_forms";

import { schema_collect } from "../162/schema";
const constructorIdField_COLLECT = schema_collect.fields.properties.constructionShopId.code;
// FIXME: スキーマからスペースIDを取得したいけど、良いやり方が思いつかなかった
const sumSpaceId_COLLECT = "sumOfCloudSignSpace";
const csRecordsField_COLLECT = schema_collect.fields.properties.cloudSignApplies.code;
const receivableCs_COLLECT = schema_collect.fields.properties.cloudSignApplies.fields.receivableCS.code;

export const needShow = (record) => {
    const constructor_id = record[constructorIdField_COLLECT]["value"];
    return KE_BAN_CONSTRUCTORS.includes(constructor_id);
};

export const displaySum = async (record) => {
    const text = await generateText(record);
    const space = kintone.app.record.getSpaceElement(sumSpaceId_COLLECT);
    space.innerText = text;
};

const generateText = async (record) => {
    const cloudSignRecords = record[csRecordsField_COLLECT]["value"];
    const fees = await getConstructorFees(record[constructorIdField_COLLECT]["value"])
    const { len, amount } = sumTransferAmounts(cloudSignRecords, fees);
    return `合計件数: ${addComma(len)}件、合計金額: ${addComma(amount)}円`;
};

const getConstructorFees = async (constructor_id) => {
    const body = {
        app: appId_CONSTRUCTOR,
        query: `${constructorIdField_CONSTRUCTOR} = "${constructor_id}"`
    };
    const resp = await CLIENT.record.getRecords(body);
    if (resp.records.length === 0) {
        throw new Error(`工務店マスタにレコードが見つかりません。${JSON.stringify(body)}`);
    }

    const record = resp.records[0];
    return {
        transfer: Number(record[transferFeeField_CONSTRUCTOR]["value"]),
        factoring: Number(record[factoringFeeField_CONSTRUCTOR]["value"]),
    };
};

const sumTransferAmounts = (records, fees) => {
    const len = records.length;
    const sum = records.reduce((sum, record) => {
        const receivable = new Decimal(Number(record["value"][receivableCs_COLLECT]["value"]));

        const factoring_fee = receivable.times(fees.factoring).floor();
        const transfer_fee = (new Decimal(fees.transfer)).times(consumption_tax_rate).floor().add(fees.transfer);
        const transfer = receivable.sub(factoring_fee).sub(transfer_fee).toNumber();
        return sum + transfer;
    }, 0);

    return { len: len, amount: sum };
};
