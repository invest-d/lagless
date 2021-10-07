export const schema_62 = {
    "fields": {
        "properties": {
            "カテゴリー": {
                "code": "カテゴリー",
                "enabled": false,
                "label": "カテゴリー",
                "type": "CATEGORY"
            },
            "ステータス": {
                "code": "ステータス",
                "enabled": false,
                "label": "ステータス",
                "type": "STATUS"
            },
            "メモ": {
                "align": "HORIZONTAL",
                "code": "メモ",
                "defaultValue": [],
                "label": "メモ",
                "noLabel": false,
                "options": {
                    "取込利用": {
                        "index": "0",
                        "label": "取込利用"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "レコード番号": {
                "code": "レコード番号",
                "label": "レコード番号",
                "noLabel": false,
                "type": "RECORD_NUMBER"
            },
            "代表者氏名1": {
                "code": "代表者氏名1",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者氏名1",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "代表者氏名2": {
                "code": "代表者氏名2",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者氏名2",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "会社設立年月日": {
                "code": "会社設立年月日",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "会社（法人）設立年月日",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "作成日時": {
                "code": "作成日時",
                "label": "作成日時",
                "noLabel": false,
                "type": "CREATED_TIME"
            },
            "作成者": {
                "code": "作成者",
                "label": "作成者",
                "noLabel": false,
                "type": "CREATOR"
            },
            "作業者": {
                "code": "作業者",
                "enabled": false,
                "label": "作業者",
                "type": "STATUS_ASSIGNEE"
            },
            "取引企業管理_No_": {
                "code": "取引企業管理_No_",
                "label": "取引企業管理 No.",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "法人番号",
                            "relatedField": "法人番号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "レコード番号",
                        "法人名・屋号"
                    ],
                    "relatedApp": {
                        "app": "28",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": true,
                "type": "NUMBER"
            },
            "取得日時": {
                "code": "取得日時",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "取得日時",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "商号": {
                "code": "商号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "商号（名称）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "審査アプリレコード番号": {
                "code": "審査アプリレコード番号",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "審査アプリレコード番号",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "役員一覧": {
                "code": "役員一覧",
                "fields": {
                    "役員住所": {
                        "code": "役員住所",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "役員住所",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "役員氏名": {
                        "code": "役員氏名",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "役員氏名",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "役員肩書": {
                        "code": "役員肩書",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "役員肩書",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    }
                },
                "label": "役員一覧",
                "noLabel": true,
                "type": "SUBTABLE"
            },
            "更新日時": {
                "code": "更新日時",
                "label": "更新日時",
                "noLabel": false,
                "type": "UPDATED_TIME"
            },
            "更新者": {
                "code": "更新者",
                "label": "更新者",
                "noLabel": false,
                "type": "MODIFIER"
            },
            "本店住所": {
                "code": "本店住所",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "本店（主たる事務所）住所",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "法人番号": {
                "code": "法人番号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人番号",
                "maxLength": "12",
                "minLength": "12",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "状態": {
                "code": "状態",
                "defaultValue": "lock",
                "label": "状態",
                "noLabel": false,
                "options": {
                    "completed": {
                        "index": "3",
                        "label": "completed"
                    },
                    "failed": {
                        "index": "4",
                        "label": "failed"
                    },
                    "lock": {
                        "index": "0",
                        "label": "lock"
                    },
                    "requested": {
                        "index": "2",
                        "label": "requested"
                    },
                    "wait": {
                        "index": "1",
                        "label": "wait"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "目的": {
                "code": "目的",
                "defaultValue": "",
                "label": "目的",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "資本金の額": {
                "code": "資本金の額",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "資本金の額",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "資産の総額": {
                "code": "資産の総額",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "資産の総額",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            }
        }
    },
    "id": {
        "appId": "62",
        "name": "登記情報取得"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RECORD_NUMBER",
                        "code": "レコード番号",
                        "size": {}
                    },
                    {
                        "type": "CREATED_TIME",
                        "code": "作成日時",
                        "size": {}
                    },
                    {
                        "type": "UPDATED_TIME",
                        "code": "更新日時",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "メモ",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "審査アプリレコード番号",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No_",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人番号",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "状態",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "取得日時",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "商号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "会社設立年月日",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "資本金の額",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "資産の総額",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "本店住所",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "目的",
                        "size": {
                            "innerHeight": "85"
                        }
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "役員一覧",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "役員肩書",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "役員氏名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "役員住所",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者氏名1",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者氏名2",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CREATOR",
                        "code": "作成者",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "completed以外": {
                "fields": [
                    "法人番号",
                    "状態",
                    "作成日時",
                    "更新日時"
                ],
                "filterCond": "状態 not in (\"completed\")",
                "index": "0",
                "name": "completed以外",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "メモあり": {
                "fields": [
                    "メモ",
                    "レコード番号",
                    "法人番号",
                    "状態",
                    "商号",
                    "取得日時",
                    "取引企業管理_No_",
                    "代表者氏名1",
                    "代表者氏名2"
                ],
                "filterCond": "メモ in (\"取込利用\")",
                "index": "1",
                "name": "メモあり",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "今日処理した分": {
                "fields": [
                    "レコード番号",
                    "更新日時",
                    "法人番号",
                    "状態",
                    "商号",
                    "取得日時",
                    "本店住所",
                    "会社設立年月日",
                    "目的",
                    "資本金の額",
                    "取引企業管理_No_",
                    "資産の総額",
                    "代表者氏名1",
                    "代表者氏名2",
                    "メモ"
                ],
                "filterCond": "更新日時 = TODAY()",
                "index": "2",
                "name": "今日処理した分",
                "sort": "更新日時 desc",
                "type": "LIST"
            }
        }
    }
};
