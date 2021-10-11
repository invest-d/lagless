/* eslint-disable no-undef */
import {
    confirmBeforeExec,
    getBody,
    putBody,
} from "../logic";

test("そもそも対象レコードがない", () => {
    global.alert = jest.fn();
    global.confirm = jest.fn().mockImplementation(() => true);

    expect(confirmBeforeExec({
        targetNum: 0,
        targetState: "テスト状態",
        newState: "テスト更新後状態",
    })).toBe(false);

    global.confirm.mockRestore();
    global.alert.mockRestore();
});

test("対象レコードがある", () => {
    global.alert = jest.fn();
    global.confirm = jest.fn().mockImplementation(() => true);

    expect(confirmBeforeExec({
        targetNum: 1,
        targetState: "テスト状態",
        newState: "テスト更新後状態",
    })).toBe(true);

    global.confirm.mockRestore();
    global.alert.mockRestore();
});

test("get body", () => {
    expect(getBody({
        app: 999,
        statusFieldCode: "statusField",
        targetStatus: "s1",
    })).toEqual({
        app: 999,
        condition: 'statusField in ("s1")',
    });
});

test("put body", () => {
    expect(putBody({
        app: 999,
        targetRecords: [
            { idField: { value: 10 } },
            { idField: { value: 20 } },
        ],
        idFieldCode: "idField",
        statusFieldCode: "statusField",
        newStatusValue: "s1",
    })).toEqual({
        app: 999,
        records: [
            {
                id: 10,
                record: { "statusField": { value: "s1" } }
            },
            {
                id: 20,
                record: { "statusField": { value: "s1" } }
            },
        ]
    });
});
