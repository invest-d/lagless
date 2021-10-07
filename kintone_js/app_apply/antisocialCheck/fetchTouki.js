"use strict";

import { schema_28 } from "../../28/schema";
import { schema_62 } from "../../62/schema";
import { schema_79 } from "../../79/schema";
import { CLIENT } from "../../util/kintoneAPI";
const companyApp = {
    fields: {
        recordId: schema_28.fields.properties.レコード番号.code,
    }
};

const examApp = {
    fields: {
        recordId: schema_79.fields.properties.レコード番号.code,
    }
};

const toukiApp = {
    id: schema_62.id.appId,
    fields: {
        examId: schema_62.fields.properties.審査アプリレコード番号.code,
        companyId: schema_62.fields.properties.取引企業管理_No_.code,
        state: {
            code: schema_62.fields.properties.状態.code,
            options: {
                lock: schema_62.fields.properties.状態.options.lock.label,
                wait: schema_62.fields.properties.状態.options.wait.label,
            }
        }
    }
};

export const buildToukiRecord = (companyRecord, examRecord) => {
    const record = {
        [toukiApp.fields.examId]: examRecord[examApp.fields.recordId].value,
        [toukiApp.fields.companyId]: companyRecord[companyApp.fields.recordId].value,
        [toukiApp.fields.state.code]: toukiApp.fields.state.options.wait,
    };

    Object.keys(record).forEach((k) => record[k] = { value: record[k] });
    return record;
};

export const addToukiRecord = async (newToukiRecord) => {
    const body = {
        app: toukiApp.id,
        record: newToukiRecord
    };
    const result = await CLIENT.record.addRecord(body);
    return result.id;
};
