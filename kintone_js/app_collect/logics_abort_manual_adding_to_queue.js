/*
    Version 1
    前提：振込依頼書の送信をするにあたってレコードの状態フィールドを特定の値に更新する必要がある。
    しかし送信にあたっての状態フィールドの編集はシステム上で管理するため、手動で編集するとシステムが上手く回らなくなってしまう。

    そのため、間違って手動で編集してしまわないように、本スクリプトでエラーを表示する。
    1. レコード一覧画面において、インライン編集時にエラーを表示。
    2. レコード詳細画面において、手動での編集時にエラーを表示。
*/
import { schema_collect } from "../162/schema";

export const STATUS_FIELD = schema_collect.fields.properties.collectStatus.code;
const STATUS_DICT = {
    "ReadyToSend": schema_collect.fields.properties.collectStatus.options.振込依頼書送信可.label
};

export const shouldNotChangeStatus = (status) => status === STATUS_DICT.ReadyToSend;

export const setErrorMessageOnDetailEdit = (event) => {
    // errorをセットして、このフィールドの編集処理をキャンセルする
    event.record[STATUS_FIELD].error = "振込依頼書を送信する場合、レコード詳細画面のボタンから処理してください。";
    return event;
};

export const setErrorMessageOnInlineEdit = (event) => {
    // errorをセットして、このフィールドの編集処理をキャンセルする
    event.record[STATUS_FIELD].error = "振込依頼書を送信する場合、レコード詳細画面のボタンから処理してください。";
    return event;
};
