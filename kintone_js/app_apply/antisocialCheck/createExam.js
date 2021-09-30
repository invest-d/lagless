"use strict";

import { schema_79 } from "../../79/schema";
const selectableUserIds_EXAM    = schema_79.fields.properties.審査担当者_作成者.entities.map((e) => e.code);

export const getExaminator = () => {
    let message = `${schema_79.id.name}アプリに新規レコードを作成します。`
        + "\n審査担当者のIDを入力してください"
        + `\n選択可能なID: ${selectableUserIds_EXAM.map((i) => i.replace("@invest-d.com", "")).join(", ")}`;
    let user = prompt(message);
    // promptでキャンセルするとnull、入力なしでOKすると空文字列を返す
    if (user === null) {
        return null;
    }

    let userid = `${user}@invest-d.com`;
    while (!selectableUserIds_EXAM.includes(userid)) {
        message = `選択可能なIDではありません: ${user} もう一度入力してください。`
            + `\n選択可能なID: ${selectableUserIds_EXAM.map((i) => i.replace("@invest-d.com", "")).join(", ")}`;
        user = prompt(message);
        if (user === null) {
            return null;
        }
        userid = `${user}@invest-d.com`;
    }
    return userid;
};
