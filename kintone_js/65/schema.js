export const schema_65 = {
    "fields": {
        "properties": {
            "_01__Google結果": {
                "code": "_01__Google結果",
                "label": "01: Google結果",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "記事取得タスクID"
                    },
                    "displayFields": [
                        "記事見出し",
                        "リンク",
                        "ネガティブワード個数"
                    ],
                    "filterCond": "媒体名称 in (\"Google\")",
                    "relatedApp": {
                        "app": "64",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "_02__暴力団Wiki結果": {
                "code": "_02__暴力団Wiki結果",
                "label": "関連レコード一覧",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "記事取得タスクID"
                    },
                    "displayFields": [
                        "記事見出し",
                        "リンク",
                        "ネガティブワード個数"
                    ],
                    "filterCond": "媒体名称 in (\"暴力団Wiki\")",
                    "relatedApp": {
                        "app": "64",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
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
            "メモ_2": {
                "align": "HORIZONTAL",
                "code": "メモ_2",
                "defaultValue": [],
                "label": "メモ②",
                "noLabel": false,
                "options": {
                    "紐づけ未済": {
                        "index": "0",
                        "label": "紐づけ未済"
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
            "作成中_審査Ver2": {
                "code": "作成中_審査Ver2",
                "label": "作成中（審査Ver2.0)",
                "lookup": {
                    "fieldMappings": [],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "レコード番号",
                        "法人名・屋号"
                    ],
                    "relatedApp": {
                        "app": "79",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
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
            "備考": {
                "code": "備考",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "備考",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取引企業管理_No": {
                "code": "取引企業管理_No",
                "label": "取引企業管理 No.",
                "lookup": {
                    "fieldMappings": [],
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
                "required": false,
                "type": "NUMBER"
            },
            "媒体01": {
                "code": "媒体01",
                "defaultValue": "未処理",
                "label": "01: Google",
                "noLabel": false,
                "options": {
                    "処理済・目視判定済（問題有り）": {
                        "index": "5",
                        "label": "処理済・目視判定済（問題有り）"
                    },
                    "処理済・目視判定済（問題無し）": {
                        "index": "4",
                        "label": "処理済・目視判定済（問題無し）"
                    },
                    "処理済・自動判定済（ネガティブワード有り）": {
                        "index": "7",
                        "label": "処理済・自動判定済（ネガティブワード有り）"
                    },
                    "処理済・自動判定済（過去に目視確認済みのため問題無し）": {
                        "index": "6",
                        "label": "処理済・自動判定済（過去に目視確認済みのため問題無し）"
                    },
                    "処理済（ネガティブワード有り）": {
                        "index": "3",
                        "label": "処理済（ネガティブワード有り）"
                    },
                    "処理済（ネガティブワード無し）": {
                        "index": "2",
                        "label": "処理済（ネガティブワード無し）"
                    },
                    "処理済（記事該当無し）": {
                        "index": "1",
                        "label": "処理済（記事該当無し）"
                    },
                    "未処理": {
                        "index": "0",
                        "label": "未処理"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "媒体02": {
                "code": "媒体02",
                "defaultValue": "未処理",
                "label": "02: 暴力団Wiki",
                "noLabel": false,
                "options": {
                    "処理済・目視判定済（問題有り）": {
                        "index": "5",
                        "label": "処理済・目視判定済（問題有り）"
                    },
                    "処理済・目視判定済（問題無し）": {
                        "index": "4",
                        "label": "処理済・目視判定済（問題無し）"
                    },
                    "処理済・自動判定済（ネガティブワード有り）": {
                        "index": "7",
                        "label": "処理済・自動判定済（ネガティブワード有り）"
                    },
                    "処理済・自動判定済（過去に目視確認済みのため問題無し）": {
                        "index": "6",
                        "label": "処理済・自動判定済（過去に目視確認済みのため問題無し）"
                    },
                    "処理済（ネガティブワード有り）": {
                        "index": "3",
                        "label": "処理済（ネガティブワード有り）"
                    },
                    "処理済（ネガティブワード無し）": {
                        "index": "2",
                        "label": "処理済（ネガティブワード無し）"
                    },
                    "処理済（記事該当無し）": {
                        "index": "1",
                        "label": "処理済（記事該当無し）"
                    },
                    "未処理": {
                        "index": "0",
                        "label": "未処理"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "小額簡易与信_個人事業_No": {
                "code": "小額簡易与信_個人事業_No",
                "label": "小額簡易与信（個人事業） No.",
                "lookup": {
                    "fieldMappings": [],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "レコード番号",
                        "作成日時",
                        "法人名・屋号"
                    ],
                    "relatedApp": {
                        "app": "51",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "小額簡易与信_法人企業_No_": {
                "code": "小額簡易与信_法人企業_No_",
                "label": "小額簡易与信（法人企業） No.",
                "lookup": {
                    "fieldMappings": [],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "レコード番号",
                        "作成日時",
                        "法人名・屋号"
                    ],
                    "relatedApp": {
                        "app": "30",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
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
            "検索ワード": {
                "code": "検索ワード",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "検索ワード",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "検索ワード種別": {
                "code": "検索ワード種別",
                "defaultValue": "",
                "label": "検索ワード種別",
                "noLabel": false,
                "options": {
                    "その他役員氏名": {
                        "index": "2",
                        "label": "その他役員氏名"
                    },
                    "不明": {
                        "index": "3",
                        "label": "不明"
                    },
                    "代表者氏名": {
                        "index": "1",
                        "label": "代表者氏名"
                    },
                    "法人名": {
                        "index": "0",
                        "label": "法人名"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "法人名・屋号": {
                "code": "法人名・屋号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人名・屋号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "確認者": {
                "align": "HORIZONTAL",
                "code": "確認者",
                "defaultValue": [],
                "label": "確認者",
                "noLabel": false,
                "options": {
                    "システムによる自動処理": {
                        "index": "9",
                        "label": "システムによる自動処理"
                    },
                    "三宅翼": {
                        "index": "10",
                        "label": "三宅翼"
                    },
                    "井村一也": {
                        "index": "5",
                        "label": "井村一也"
                    },
                    "八木原一世": {
                        "index": "12",
                        "label": "八木原一世"
                    },
                    "大堂果林": {
                        "index": "3",
                        "label": "大堂果林"
                    },
                    "山崎阿弥": {
                        "index": "8",
                        "label": "山崎阿弥"
                    },
                    "山崎魁仁": {
                        "index": "11",
                        "label": "山崎魁仁"
                    },
                    "比嘉真未": {
                        "index": "6",
                        "label": "比嘉真未"
                    },
                    "江口小都乃": {
                        "index": "7",
                        "label": "江口小都乃"
                    },
                    "澤田友里": {
                        "index": "0",
                        "label": "澤田友里"
                    },
                    "猪俣和貴": {
                        "index": "1",
                        "label": "猪俣和貴"
                    },
                    "畔上有里": {
                        "index": "4",
                        "label": "畔上有里"
                    },
                    "髙橋望": {
                        "index": "2",
                        "label": "髙橋望"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            }
        }
    },
    "id": {
        "appId": "65",
        "name": "記事取得タスク"
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
                        "type": "CREATOR",
                        "code": "作成者",
                        "size": {}
                    },
                    {
                        "type": "UPDATED_TIME",
                        "code": "更新日時",
                        "size": {}
                    },
                    {
                        "type": "MODIFIER",
                        "code": "更新者",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "作成中_審査Ver2",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "小額簡易与信_法人企業_No_",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "小額簡易与信_個人事業_No",
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
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "メモ_2",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人名・屋号",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "備考",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "検索ワード種別",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "検索ワード",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "確認者",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "媒体01",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "_01__Google結果"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "媒体02",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "_02__暴力団Wiki結果"
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "ネガティブ(Google）": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "法人名・屋号",
                    "検索ワード種別",
                    "検索ワード",
                    "媒体01",
                    "媒体02",
                    "作成中_審査Ver2",
                    "小額簡易与信_法人企業_No_",
                    "取引企業管理_No"
                ],
                "filterCond": "_01__Google結果.ネガティブワード個数 >= \"1\"",
                "index": "2",
                "name": "ネガティブ(Google）",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "ネガティブ(いずれかに該当)": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "法人名・屋号",
                    "検索ワード種別",
                    "検索ワード",
                    "媒体01",
                    "媒体02",
                    "作成中_審査Ver2",
                    "小額簡易与信_法人企業_No_",
                    "取引企業管理_No"
                ],
                "filterCond": "_01__Google結果.ネガティブワード個数 >= \"1\" or 媒体02 in (\"処理済（ネガティブワード無し）\", \"処理済（ネガティブワード有り）\", \"処理済・目視判定済（問題無し）\", \"処理済・目視判定済（問題有り）\")",
                "index": "1",
                "name": "ネガティブ(いずれかに該当)",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "ネガティブ(暴力団wiki)": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "法人名・屋号",
                    "検索ワード種別",
                    "検索ワード",
                    "媒体01",
                    "媒体02",
                    "作成中_審査Ver2",
                    "小額簡易与信_法人企業_No_",
                    "取引企業管理_No"
                ],
                "filterCond": "媒体02 in (\"処理済（ネガティブワード無し）\", \"処理済（ネガティブワード有り）\", \"処理済・目視判定済（問題無し）\", \"処理済・目視判定済（問題有り）\")",
                "index": "3",
                "name": "ネガティブ(暴力団wiki)",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧": {
                "fields": [
                    "レコード番号",
                    "更新者",
                    "更新日時",
                    "作成者",
                    "作成日時",
                    "法人名・屋号",
                    "検索ワード種別",
                    "検索ワード",
                    "媒体01",
                    "媒体02"
                ],
                "filterCond": "",
                "index": "0",
                "name": "一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "紐づけ未済分": {
                "fields": [
                    "レコード番号",
                    "更新者",
                    "更新日時",
                    "作成者",
                    "作成日時",
                    "法人名・屋号",
                    "検索ワード種別",
                    "検索ワード",
                    "媒体01",
                    "媒体02",
                    "取引企業管理_No",
                    "作成中_審査Ver2",
                    "メモ",
                    "メモ_2",
                    "備考"
                ],
                "filterCond": "メモ_2 in (\"紐づけ未済\")",
                "index": "4",
                "name": "紐づけ未済分",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};
