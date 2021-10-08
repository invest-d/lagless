export const schema_79 = {
    "fields": {
        "properties": {
            "COSMOSNETで特定できない時の判断プロセスの記載": {
                "code": "COSMOSNETで特定できない時の判断プロセスの記載",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "COSMOSNETで特定できない時の判断プロセスの記載",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "Google検索_自動取得": {
                "align": "VERTICAL",
                "code": "Google検索_自動取得",
                "defaultValue": [],
                "label": "Google検索(自動取得)",
                "noLabel": false,
                "options": {
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当し、問題ある可能性あり、保留": {
                        "index": "4",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当し、問題ある可能性あり、保留"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、上場関連会社により問題無し": {
                        "index": "3",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、上場関連会社により問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、当該企業・人物の内容ではなく問題無し": {
                        "index": "1",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、当該企業・人物の内容ではなく問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、認可事業の確認により問題無し": {
                        "index": "2",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、認可事業の確認により問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし（新規ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし）": {
                        "index": "0",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし（新規ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし）"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "HPのURL1": {
                "code": "HPのURL1",
                "defaultValue": "",
                "label": "HPのURL",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "HPのURL_コピー2": {
                "code": "HPのURL_コピー2",
                "defaultValue": "",
                "label": "HPのURL(コピー）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "HP有無": {
                "align": "VERTICAL",
                "code": "HP有無",
                "defaultValue": [],
                "label": "HP有無",
                "noLabel": false,
                "options": {
                    "HP調査不要": {
                        "index": "0",
                        "label": "HP調査不要"
                    },
                    "独自ドメインのHPあり": {
                        "index": "1",
                        "label": "独自ドメインのHPあり"
                    },
                    "独自ドメインのHPなし": {
                        "index": "2",
                        "label": "独自ドメインのHPなし"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "TDBグレード": {
                "align": "HORIZONTAL",
                "code": "TDBグレード",
                "defaultValue": [],
                "label": "TDBグレード",
                "noLabel": false,
                "options": {
                    "G1": {
                        "index": "1",
                        "label": "G1"
                    },
                    "G10": {
                        "index": "10",
                        "label": "G10"
                    },
                    "G2": {
                        "index": "2",
                        "label": "G2"
                    },
                    "G3": {
                        "index": "3",
                        "label": "G3"
                    },
                    "G4": {
                        "index": "4",
                        "label": "G4"
                    },
                    "G5": {
                        "index": "5",
                        "label": "G5"
                    },
                    "G6": {
                        "index": "6",
                        "label": "G6"
                    },
                    "G7": {
                        "index": "7",
                        "label": "G7"
                    },
                    "G8": {
                        "index": "8",
                        "label": "G8"
                    },
                    "G9": {
                        "index": "9",
                        "label": "G9"
                    },
                    "G無し": {
                        "index": "11",
                        "label": "G無し"
                    },
                    "取得不要(上場関連)": {
                        "index": "0",
                        "label": "取得不要(上場関連)"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "TDB情報取得日": {
                "code": "TDB情報取得日",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "TDB情報取得日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "TDB評点": {
                "code": "TDB評点",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "TDB評点(参考)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "点",
                "unitPosition": "AFTER"
            },
            "boxのURL": {
                "code": "boxのURL",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "boxのURL",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "creditInfoRecordNo": {
                "code": "creditInfoRecordNo",
                "label": "与信取得レコード番号",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "付与与信枠_自動算出",
                            "relatedField": "creditEarly"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "companyNumber",
                        "companyName"
                    ],
                    "relatedApp": {
                        "app": "173",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "カテゴリー": {
                "code": "カテゴリー",
                "enabled": false,
                "label": "カテゴリー",
                "type": "CATEGORY"
            },
            "コメント_審査リーダー": {
                "code": "コメント_審査リーダー",
                "defaultValue": "",
                "label": "コメント（審査リーダー） (※保留事項がある場合は内容を記入)",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "コメント_審査担当者": {
                "code": "コメント_審査担当者",
                "defaultValue": "",
                "label": "コメント（審査担当者）　 (※保留事項がある場合は内容を記入)",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "コメント_審査管理者": {
                "code": "コメント_審査管理者",
                "defaultValue": "",
                "label": "コメント（審査管理者）　 (※保留事項がある場合は内容を記入)",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "コメント_確認者1": {
                "code": "コメント_確認者1",
                "defaultValue": "",
                "label": "コメント（確認者1）　　     (※保留事項がある場合は内容を記入)",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "コメント_確認者2": {
                "code": "コメント_確認者2",
                "defaultValue": "",
                "label": "コメント（確認者2）　　     (※保留事項がある場合は内容を記入)",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "コールコネクト通話履歴_架電1回目": {
                "code": "コールコネクト通話履歴_架電1回目",
                "label": "コールコネクト通話履歴（架電1回目）",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "録音URL_架電1回目",
                            "relatedField": "URL"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
                    "relatedApp": {
                        "app": "58",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "コールコネクト通話履歴_架電2回目": {
                "code": "コールコネクト通話履歴_架電2回目",
                "label": "コールコネクト通話履歴（架電2回目）",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "録音URL_架電2回目",
                            "relatedField": "URL"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
                    "relatedApp": {
                        "app": "58",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "コールコネクト通話履歴_架電3回目": {
                "code": "コールコネクト通話履歴_架電3回目",
                "label": "コールコネクト通話履歴（架電3回目）",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "録音URL_架電3回目",
                            "relatedField": "URL"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
                    "relatedApp": {
                        "app": "58",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "ステータス": {
                "code": "ステータス",
                "enabled": true,
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
            "モニタリング終了日": {
                "code": "モニタリング終了日",
                "displayScale": "",
                "expression": "審査完了日 + (60 * 60 * 24 * 365)",
                "format": "DATE",
                "hideExpression": false,
                "label": "モニタリング終了日（審査完了日+365日)",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "モニタリング開始可能日": {
                "code": "モニタリング開始可能日",
                "displayScale": "",
                "expression": "審査完了日 + (60 * 60 * 24 * 330)",
                "format": "DATE",
                "hideExpression": false,
                "label": "モニタリング開始可能日（審査完了日+330日)",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "リーダー確認済_TDBからの情報": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済_TDBからの情報",
                "defaultValue": [],
                "label": "リーダー確認済（TDBからの情報）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "リーダー確認済＿HPの有無等情報": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済＿HPの有無等情報",
                "defaultValue": [],
                "label": "リーダー確認済（HPの有無等情報）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "リーダー確認済＿TDBからの情報": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済＿TDBからの情報",
                "defaultValue": [],
                "label": "リーダー確認済（TDBからの情報）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "リーダー確認済＿上場関連の情報": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済＿上場関連の情報",
                "defaultValue": [],
                "label": "リーダー確認済（上場関連の情報）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "リーダー確認済＿事前審査項目の概要": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済＿事前審査項目の概要",
                "defaultValue": [],
                "label": "リーダー確認済（事前審査項目の概要）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "リーダー確認済＿業種の特定": {
                "align": "HORIZONTAL",
                "code": "リーダー確認済＿業種の特定",
                "defaultValue": [],
                "label": "リーダー確認済（業種の特定）",
                "noLabel": true,
                "options": {
                    "リーダー確認済": {
                        "index": "0",
                        "label": "リーダー確認済"
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
            "上場関連か否か": {
                "align": "VERTICAL",
                "code": "上場関連か否か",
                "defaultValue": [],
                "label": "上場関連か否か",
                "noLabel": false,
                "options": {
                    "上場企業": {
                        "index": "1",
                        "label": "上場企業"
                    },
                    "非上場企業": {
                        "index": "0",
                        "label": "非上場企業"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "上場関連の場合_確認時に使用したURLを記載": {
                "code": "上場関連の場合_確認時に使用したURLを記載",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "上場関連の場合（確認時に使用したURLを記載）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "与信付与条件": {
                "code": "与信付与条件",
                "defaultValue": "",
                "label": "与信付与条件",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "付与与信枠_審査リーダー": {
                "code": "付与与信枠_審査リーダー",
                "defaultValue": "",
                "label": "付与与信枠(審査リーダー)",
                "noLabel": false,
                "options": {
                    "0円": {
                        "index": "1",
                        "label": "0円"
                    },
                    "1,000,000円": {
                        "index": "11",
                        "label": "1,000,000円"
                    },
                    "10,000円": {
                        "index": "2",
                        "label": "10,000円"
                    },
                    "100,000円": {
                        "index": "6",
                        "label": "100,000円"
                    },
                    "20,000円": {
                        "index": "3",
                        "label": "20,000円"
                    },
                    "200,000円": {
                        "index": "7",
                        "label": "200,000円"
                    },
                    "30,000円": {
                        "index": "4",
                        "label": "30,000円"
                    },
                    "300,000円": {
                        "index": "8",
                        "label": "300,000円"
                    },
                    "50,000円": {
                        "index": "5",
                        "label": "50,000円"
                    },
                    "500,000円": {
                        "index": "9",
                        "label": "500,000円"
                    },
                    "700,000円": {
                        "index": "10",
                        "label": "700,000円"
                    },
                    "事前審査の為無し": {
                        "index": "0",
                        "label": "事前審査の為無し"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "付与与信枠_審査管理者": {
                "code": "付与与信枠_審査管理者",
                "defaultValue": "",
                "label": "付与与信枠(審査管理者)",
                "noLabel": false,
                "options": {
                    "0円": {
                        "index": "1",
                        "label": "0円"
                    },
                    "1,000,000円": {
                        "index": "11",
                        "label": "1,000,000円"
                    },
                    "10,000円": {
                        "index": "2",
                        "label": "10,000円"
                    },
                    "100,000円": {
                        "index": "6",
                        "label": "100,000円"
                    },
                    "20,000円": {
                        "index": "3",
                        "label": "20,000円"
                    },
                    "200,000円": {
                        "index": "7",
                        "label": "200,000円"
                    },
                    "30,000円": {
                        "index": "4",
                        "label": "30,000円"
                    },
                    "300,000円": {
                        "index": "8",
                        "label": "300,000円"
                    },
                    "50,000円": {
                        "index": "5",
                        "label": "50,000円"
                    },
                    "500,000円": {
                        "index": "9",
                        "label": "500,000円"
                    },
                    "700,000円": {
                        "index": "10",
                        "label": "700,000円"
                    },
                    "事前審査の為無し": {
                        "index": "0",
                        "label": "事前審査の為無し"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "付与与信枠_手動入力_標準と高額": {
                "code": "付与与信枠_手動入力_標準と高額",
                "defaultValue": "",
                "digit": true,
                "displayScale": "",
                "label": "付与与信枠(手動入力)(標準＆高額)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "付与与信枠_決定金額_事前と少額": {
                "code": "付与与信枠_決定金額_事前と少額",
                "defaultValue": "",
                "label": "付与与信枠(決定金額)(事前＆少額)",
                "noLabel": false,
                "options": {
                    "0円": {
                        "index": "2",
                        "label": "0円"
                    },
                    "1,000,000円": {
                        "index": "12",
                        "label": "1,000,000円"
                    },
                    "10,000円": {
                        "index": "3",
                        "label": "10,000円"
                    },
                    "100,000円": {
                        "index": "7",
                        "label": "100,000円"
                    },
                    "20,000円": {
                        "index": "4",
                        "label": "20,000円"
                    },
                    "200,000円": {
                        "index": "8",
                        "label": "200,000円"
                    },
                    "30,000円": {
                        "index": "5",
                        "label": "30,000円"
                    },
                    "300,000円": {
                        "index": "9",
                        "label": "300,000円"
                    },
                    "50,000円": {
                        "index": "6",
                        "label": "50,000円"
                    },
                    "500,000円": {
                        "index": "10",
                        "label": "500,000円"
                    },
                    "700,000円": {
                        "index": "11",
                        "label": "700,000円"
                    },
                    "事前審査NG": {
                        "index": "1",
                        "label": "事前審査NG"
                    },
                    "事前審査OK(事前審査の為無し)": {
                        "index": "0",
                        "label": "事前審査OK(事前審査の為無し)"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "付与与信枠_確認者1": {
                "code": "付与与信枠_確認者1",
                "defaultValue": "",
                "label": "付与与信枠(確認者1)",
                "noLabel": false,
                "options": {
                    "0円": {
                        "index": "1",
                        "label": "0円"
                    },
                    "1,000,000円": {
                        "index": "11",
                        "label": "1,000,000円"
                    },
                    "10,000円": {
                        "index": "2",
                        "label": "10,000円"
                    },
                    "100,000円": {
                        "index": "6",
                        "label": "100,000円"
                    },
                    "20,000円": {
                        "index": "3",
                        "label": "20,000円"
                    },
                    "200,000円": {
                        "index": "7",
                        "label": "200,000円"
                    },
                    "30,000円": {
                        "index": "4",
                        "label": "30,000円"
                    },
                    "300,000円": {
                        "index": "8",
                        "label": "300,000円"
                    },
                    "50,000円": {
                        "index": "5",
                        "label": "50,000円"
                    },
                    "500,000円": {
                        "index": "9",
                        "label": "500,000円"
                    },
                    "700,000円": {
                        "index": "10",
                        "label": "700,000円"
                    },
                    "事前審査の為無し": {
                        "index": "0",
                        "label": "事前審査の為無し"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "付与与信枠_確認者2": {
                "code": "付与与信枠_確認者2",
                "defaultValue": "",
                "label": "付与与信枠(確認者2)",
                "noLabel": false,
                "options": {
                    "0円": {
                        "index": "1",
                        "label": "0円"
                    },
                    "1,000,000円": {
                        "index": "11",
                        "label": "1,000,000円"
                    },
                    "10,000円": {
                        "index": "2",
                        "label": "10,000円"
                    },
                    "100,000円": {
                        "index": "6",
                        "label": "100,000円"
                    },
                    "20,000円": {
                        "index": "3",
                        "label": "20,000円"
                    },
                    "200,000円": {
                        "index": "7",
                        "label": "200,000円"
                    },
                    "30,000円": {
                        "index": "4",
                        "label": "30,000円"
                    },
                    "300,000円": {
                        "index": "8",
                        "label": "300,000円"
                    },
                    "50,000円": {
                        "index": "5",
                        "label": "50,000円"
                    },
                    "500,000円": {
                        "index": "9",
                        "label": "500,000円"
                    },
                    "700,000円": {
                        "index": "10",
                        "label": "700,000円"
                    },
                    "事前審査の為無し": {
                        "index": "0",
                        "label": "事前審査の為無し"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "付与与信枠_自動算出": {
                "code": "付与与信枠_自動算出",
                "defaultValue": "",
                "digit": true,
                "displayScale": "",
                "label": "付与与信枠(自動算出)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "代表者": {
                "code": "代表者",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "代表者備考": {
                "code": "代表者備考",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者備考(複数存在する場合等に記載)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "代表者役職": {
                "code": "代表者役職",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者役職",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
            "企業形態": {
                "code": "企業形態",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "企業形態",
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
                "label": "会社設立年月日",
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
                "enabled": true,
                "label": "作業者",
                "type": "STATUS_ASSIGNEE"
            },
            "取引企業管理No_審査対象企業": {
                "code": "取引企業管理No_審査対象企業",
                "label": "取引企業管理 No.(審査対象企業)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "法人名・屋号",
                            "relatedField": "法人名・屋号"
                        },
                        {
                            "field": "代表者",
                            "relatedField": "代表者名"
                        },
                        {
                            "field": "代表者役職",
                            "relatedField": "代表者名_役職"
                        },
                        {
                            "field": "代表者備考",
                            "relatedField": "代表者備考"
                        },
                        {
                            "field": "企業形態",
                            "relatedField": "企業形態"
                        },
                        {
                            "field": "取得した住所＿HubSpotの場合",
                            "relatedField": "住所_HubSpotより"
                        },
                        {
                            "field": "HPのURL1",
                            "relatedField": "WEBサイト_コーポレートサイト"
                        },
                        {
                            "field": "HPのURL_コピー2",
                            "relatedField": "WEBサイト_コーポレートサイト"
                        },
                        {
                            "field": "取得した企業名＿HubSpotの場合",
                            "relatedField": "法人名・屋号_HubSpotより"
                        },
                        {
                            "field": "取得した担当者_HubSpotの場合",
                            "relatedField": "文字列__1行_"
                        },
                        {
                            "field": "取得した企業名＿HubSpotの場合_0",
                            "relatedField": "代表者名"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No__関係会社2": {
                "code": "取引企業管理_No__関係会社2",
                "label": "取引企業管理 No.(関係会社2)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "審査対象企業の関係会社2",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No__関係会社3": {
                "code": "取引企業管理_No__関係会社3",
                "label": "取引企業管理 No.(関係会社3)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "審査対象企業の関係会社3",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No_支払企業2": {
                "code": "取引企業管理_No_支払企業2",
                "label": "取引企業管理 No.(支払企業)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "案件関連企業_支払企業",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No_譲渡企業": {
                "code": "取引企業管理_No_譲渡企業",
                "label": "取引企業管理 No.(譲渡企業)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "案件関連企業_譲渡企業",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No_関係会社1": {
                "code": "取引企業管理_No_関係会社1",
                "label": "取引企業管理 No.(関係会社1)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "審査対象企業の関係会社1",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引企業管理_No_関係者": {
                "code": "取引企業管理_No_関係者",
                "label": "取引企業管理 No.(関係者)",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "案件関連企業_関係者",
                            "relatedField": "法人名・屋号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
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
            "取引区分": {
                "align": "HORIZONTAL",
                "code": "取引区分",
                "defaultValue": [],
                "label": "取引区分",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "3",
                        "label": "その他"
                    },
                    "パートナー企業": {
                        "index": "2",
                        "label": "パートナー企業"
                    },
                    "支払企業": {
                        "index": "1",
                        "label": "支払企業"
                    },
                    "譲渡企業": {
                        "index": "0",
                        "label": "譲渡企業"
                    }
                },
                "required": true,
                "type": "CHECK_BOX"
            },
            "取得した代表者名＿手入力の場合": {
                "code": "取得した代表者名＿手入力の場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した代表者名(手入力の場合)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した企業名＿HubSpotの場合": {
                "code": "取得した企業名＿HubSpotの場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した企業名(取引企業管理から自動取得)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した企業名＿HubSpotの場合_0": {
                "code": "取得した企業名＿HubSpotの場合_0",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した代表者名(取引企業管理から自動取得)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した企業名＿手入力の場合": {
                "code": "取得した企業名＿手入力の場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した企業名(手入力の場合)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した住所＿HubSpotの場合": {
                "code": "取得した住所＿HubSpotの場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した住所(取引企業管理から自動取得)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した住所＿手入力の場合": {
                "code": "取得した住所＿手入力の場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した住所(手入力の場合)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得した担当者_HubSpotの場合": {
                "code": "取得した担当者_HubSpotの場合",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "取得した担当者(HubSpotの場合)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "取得情報と登記情報の一致確認": {
                "align": "VERTICAL",
                "code": "取得情報と登記情報の一致確認",
                "defaultValue": [],
                "label": "取得情報と登記情報の一致確認",
                "noLabel": false,
                "options": {
                    "一致": {
                        "index": "1",
                        "label": "一致"
                    },
                    "不一致あるもHP等で解消済": {
                        "index": "2",
                        "label": "不一致あるもHP等で解消済"
                    },
                    "不一致（未解消）": {
                        "index": "3",
                        "label": "不一致（未解消）"
                    },
                    "取得情報無し(ﾓﾆﾀﾘﾝｸﾞ)": {
                        "index": "5",
                        "label": "取得情報無し(ﾓﾆﾀﾘﾝｸﾞ)"
                    },
                    "登記無し(個人事業主)": {
                        "index": "4",
                        "label": "登記無し(個人事業主)"
                    },
                    "確認中": {
                        "index": "0",
                        "label": "確認中"
                    }
                },
                "required": true,
                "type": "CHECK_BOX"
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
            "取得経路": {
                "align": "HORIZONTAL",
                "code": "取得経路",
                "defaultValue": [],
                "label": "取得経路",
                "noLabel": false,
                "options": {
                    "HRFの申込フォーム": {
                        "index": "1",
                        "label": "HRFの申込フォーム"
                    },
                    "HRFの請求データ": {
                        "index": "3",
                        "label": "HRFの請求データ"
                    },
                    "サービス導入の申込フォーム（発注企業）": {
                        "index": "2",
                        "label": "サービス導入の申込フォーム（発注企業）"
                    },
                    "営業担当(HPのURLの場合も含む)": {
                        "index": "0",
                        "label": "営業担当(HPのURLの場合も含む)"
                    },
                    "早払い・遅払い申込フォーム（協力会社）": {
                        "index": "4",
                        "label": "早払い・遅払い申込フォーム（協力会社）"
                    }
                },
                "required": true,
                "type": "CHECK_BOX"
            },
            "審査リーダー": {
                "code": "審査リーダー",
                "defaultValue": [],
                "entities": [
                    {
                        "type": "USER",
                        "code": "takahashi@invest-d.com"
                    },
                    {
                        "type": "USER",
                        "code": "sawada@invest-d.com"
                    },
                    {
                        "type": "GROUP",
                        "code": "Administrators"
                    },
                    {
                        "type": "USER",
                        "code": "imura@invest-d.com"
                    },
                    {
                        "type": "USER",
                        "code": "inomata@invest-d.com"
                    }
                ],
                "label": "審査リーダー(一部決裁可)",
                "noLabel": false,
                "required": false,
                "type": "USER_SELECT"
            },
            "審査依頼者": {
                "code": "審査依頼者",
                "defaultValue": "",
                "label": "審査依頼者",
                "noLabel": false,
                "options": {
                    "HRFの申込フォーム": {
                        "index": "0",
                        "label": "HRFの申込フォーム"
                    },
                    "クラフトバンク成約先": {
                        "index": "2",
                        "label": "クラフトバンク成約先"
                    },
                    "システムによる自動審査": {
                        "index": "12",
                        "label": "システムによる自動審査"
                    },
                    "ラグレス関係の申込フォーム": {
                        "index": "1",
                        "label": "ラグレス関係の申込フォーム"
                    },
                    "中川渡": {
                        "index": "3",
                        "label": "中川渡"
                    },
                    "井村一也": {
                        "index": "10",
                        "label": "井村一也"
                    },
                    "比嘉真未": {
                        "index": "8",
                        "label": "比嘉真未"
                    },
                    "江口小都乃": {
                        "index": "11",
                        "label": "江口小都乃"
                    },
                    "澤田有里": {
                        "index": "6",
                        "label": "澤田有里"
                    },
                    "猪俣和貴": {
                        "index": "7",
                        "label": "猪俣和貴"
                    },
                    "神庭晶": {
                        "index": "5",
                        "label": "神庭晶"
                    },
                    "高田悠一": {
                        "index": "4",
                        "label": "高田悠一"
                    },
                    "髙橋望": {
                        "index": "9",
                        "label": "髙橋望"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "審査完了日": {
                "code": "審査完了日",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "審査完了日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "審査対象企業の関係会社1": {
                "code": "審査対象企業の関係会社1",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "審査対象企業の関係会社1",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "審査対象企業の関係会社2": {
                "code": "審査対象企業の関係会社2",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "審査対象企業の関係会社2",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "審査対象企業の関係会社3": {
                "code": "審査対象企業の関係会社3",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "審査対象企業の関係会社3",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "審査担当者_作成者": {
                "code": "審査担当者_作成者",
                "defaultValue": [],
                "entities": [
                    {
                        "type": "USER",
                        "code": "sawada@invest-d.com"
                    },
                    {
                        "type": "USER",
                        "code": "takahashi@invest-d.com"
                    },
                    {
                        "type": "USER",
                        "code": "inomata@invest-d.com"
                    },
                    {
                        "type": "USER",
                        "code": "imura@invest-d.com"
                    }
                ],
                "label": "審査担当者(作成者)",
                "noLabel": false,
                "required": true,
                "type": "USER_SELECT"
            },
            "審査目的": {
                "code": "審査目的",
                "defaultValue": "",
                "label": "審査目的",
                "noLabel": false,
                "options": {
                    "FidenPay譲渡企業(譲渡企業)": {
                        "index": "5",
                        "label": "FidenPay譲渡企業(譲渡企業)"
                    },
                    "LagLess支払企業(発注企業等)": {
                        "index": "2",
                        "label": "LagLess支払企業(発注企業等)"
                    },
                    "LagLess譲渡企業(協力会社等)": {
                        "index": "3",
                        "label": "LagLess譲渡企業(協力会社等)"
                    },
                    "その他（神庭に声かけて下さい）": {
                        "index": "7",
                        "label": "その他（神庭に声かけて下さい）"
                    },
                    "クラフトバンク案件": {
                        "index": "6",
                        "label": "クラフトバンク案件"
                    },
                    "システムによる自動審査": {
                        "index": "8",
                        "label": "システムによる自動審査"
                    },
                    "パートナー企業": {
                        "index": "4",
                        "label": "パートナー企業"
                    },
                    "支払企業(HRF申込企業)": {
                        "index": "0",
                        "label": "支払企業(HRF申込企業)"
                    },
                    "支払企業(HRF申込企業以外)": {
                        "index": "1",
                        "label": "支払企業(HRF申込企業以外)"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "審査種類": {
                "code": "審査種類",
                "defaultValue": "",
                "label": "審査名称",
                "noLabel": false,
                "options": {
                    "事前審査": {
                        "index": "0",
                        "label": "事前審査"
                    },
                    "少額審査": {
                        "index": "1",
                        "label": "少額審査"
                    },
                    "標準審査": {
                        "index": "2",
                        "label": "標準審査"
                    },
                    "自動審査": {
                        "index": "4",
                        "label": "自動審査"
                    },
                    "高額審査": {
                        "index": "3",
                        "label": "高額審査"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "審査管理者": {
                "code": "審査管理者",
                "defaultValue": [],
                "entities": [],
                "label": "審査管理者",
                "noLabel": false,
                "required": false,
                "type": "USER_SELECT"
            },
            "意見_審査リーダー": {
                "code": "意見_審査リーダー",
                "defaultValue": "",
                "label": "意見（審査リーダー）",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "4",
                        "label": "その他"
                    },
                    "事前審査：問題ある可能性あり": {
                        "index": "1",
                        "label": "事前審査：問題ある可能性あり"
                    },
                    "事前審査：問題無しと思料": {
                        "index": "0",
                        "label": "事前審査：問題無しと思料"
                    },
                    "問題なし（システムによる自動審査）": {
                        "index": "5",
                        "label": "問題なし（システムによる自動審査）"
                    },
                    "少額審査：事前審査に問題ある可能性あり": {
                        "index": "3",
                        "label": "少額審査：事前審査に問題ある可能性あり"
                    },
                    "少額審査：右記与信枠付与致したい": {
                        "index": "2",
                        "label": "少額審査：右記与信枠付与致したい"
                    },
                    "要確認（システムによる自動審査）": {
                        "index": "6",
                        "label": "要確認（システムによる自動審査）"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "意見_審査担当者": {
                "code": "意見_審査担当者",
                "defaultValue": "",
                "label": "意見（審査担当者）",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "6",
                        "label": "その他"
                    },
                    "事前審査：問題ある可能性あり": {
                        "index": "2",
                        "label": "事前審査：問題ある可能性あり"
                    },
                    "事前審査：問題無しと思料": {
                        "index": "1",
                        "label": "事前審査：問題無しと思料"
                    },
                    "保留": {
                        "index": "5",
                        "label": "保留"
                    },
                    "問題なし（システムによる自動審査）": {
                        "index": "7",
                        "label": "問題なし（システムによる自動審査）"
                    },
                    "審査待ち": {
                        "index": "0",
                        "label": "審査待ち"
                    },
                    "少額審査：与信枠付与致したい": {
                        "index": "3",
                        "label": "少額審査：与信枠付与致したい"
                    },
                    "少額審査：事前審査に問題ある可能性あり": {
                        "index": "4",
                        "label": "少額審査：事前審査に問題ある可能性あり"
                    },
                    "要確認（システムによる自動審査）": {
                        "index": "8",
                        "label": "要確認（システムによる自動審査）"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "意見_審査管理者": {
                "code": "意見_審査管理者",
                "defaultValue": "",
                "label": "意見（審査管理者）",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "4",
                        "label": "その他"
                    },
                    "事前審査：問題ある可能性あり": {
                        "index": "1",
                        "label": "事前審査：問題ある可能性あり"
                    },
                    "事前審査：問題無しと思料": {
                        "index": "0",
                        "label": "事前審査：問題無しと思料"
                    },
                    "少額審査：事前審査に問題ある可能性あり": {
                        "index": "3",
                        "label": "少額審査：事前審査に問題ある可能性あり"
                    },
                    "少額審査：右記与信枠付与致したい": {
                        "index": "2",
                        "label": "少額審査：右記与信枠付与致したい"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "意見_確認者1": {
                "code": "意見_確認者1",
                "defaultValue": "",
                "label": "意見（確認者1）",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "4",
                        "label": "その他"
                    },
                    "事前審査：問題ある可能性あり": {
                        "index": "1",
                        "label": "事前審査：問題ある可能性あり"
                    },
                    "事前審査：問題無しと思料": {
                        "index": "0",
                        "label": "事前審査：問題無しと思料"
                    },
                    "少額審査：事前審査に問題ある可能性あり": {
                        "index": "3",
                        "label": "少額審査：事前審査に問題ある可能性あり"
                    },
                    "少額審査：右記与信枠付与致したい": {
                        "index": "2",
                        "label": "少額審査：右記与信枠付与致したい"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "意見_確認者2": {
                "code": "意見_確認者2",
                "defaultValue": "",
                "label": "意見（確認者2）",
                "noLabel": false,
                "options": {
                    "その他": {
                        "index": "4",
                        "label": "その他"
                    },
                    "事前審査：問題ある可能性あり": {
                        "index": "1",
                        "label": "事前審査：問題ある可能性あり"
                    },
                    "事前審査：問題無しと思料": {
                        "index": "0",
                        "label": "事前審査：問題無しと思料"
                    },
                    "少額審査：事前審査に問題ある可能性あり": {
                        "index": "3",
                        "label": "少額審査：事前審査に問題ある可能性あり"
                    },
                    "少額審査：右記与信枠付与致したい": {
                        "index": "2",
                        "label": "少額審査：右記与信枠付与致したい"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "日経テレコン検索": {
                "code": "日経テレコン検索",
                "label": "日経テレコン検索",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "作成中_審査Ver2"
                    },
                    "displayFields": [
                        "レコード番号",
                        "更新日時",
                        "状態",
                        "キーワード"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "67",
                        "code": ""
                    },
                    "size": "10",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "日経テレコン検索_自動取得": {
                "align": "VERTICAL",
                "code": "日経テレコン検索_自動取得",
                "defaultValue": [],
                "label": "日経テレコン検索_自動取得(2019.5.17より取得せず)",
                "noLabel": false,
                "options": {
                    "取得済": {
                        "index": "0",
                        "label": "取得済"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "暴力団wiki検索_自動取得": {
                "align": "VERTICAL",
                "code": "暴力団wiki検索_自動取得",
                "defaultValue": [],
                "label": "暴力団wiki検索(自動取得)",
                "noLabel": false,
                "options": {
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当し、問題ある可能性あり、保留": {
                        "index": "4",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当し、問題ある可能性あり、保留"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、上場関連会社により問題無し": {
                        "index": "3",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、上場関連会社により問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、当該企業・人物の内容ではなく問題無し": {
                        "index": "1",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、当該企業・人物の内容ではなく問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、認可事業の確認により問題無し": {
                        "index": "2",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当するも、認可事業の確認により問題無し"
                    },
                    "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし（新規ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし）": {
                        "index": "0",
                        "label": "ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし（新規ﾈｶﾞﾃｨﾌﾞﾜｰﾄﾞ該当なし）"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
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
            "最新フラグ": {
                "align": "HORIZONTAL",
                "code": "最新フラグ",
                "defaultValue": [],
                "label": "最新フラグ（入力不要）",
                "noLabel": false,
                "options": {
                    "最新": {
                        "index": "0",
                        "label": "最新"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "架電日時_1回目": {
                "code": "架電日時_1回目",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "架電日時（1回目）",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "架電日時_2回目": {
                "code": "架電日時_2回目",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "架電日時（2回目）",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "架電日時_3回目": {
                "code": "架電日時_3回目",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "架電日時（3回目）",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "架電状況_1回目": {
                "align": "VERTICAL",
                "code": "架電状況_1回目",
                "defaultValue": [],
                "label": "架電状況（1回目）",
                "noLabel": false,
                "options": {
                    "架電不要先": {
                        "index": "0",
                        "label": "架電不要先"
                    },
                    "繋がらない（「現在使われていない」）": {
                        "index": "4",
                        "label": "繋がらない（「現在使われていない」）"
                    },
                    "繋がらない（コールするが出ない）": {
                        "index": "3",
                        "label": "繋がらない（コールするが出ない）"
                    },
                    "繋がるも名乗らない": {
                        "index": "2",
                        "label": "繋がるも名乗らない"
                    },
                    "電話が繋がり且つ名乗った": {
                        "index": "1",
                        "label": "電話が繋がり且つ名乗った"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "架電状況_2回目": {
                "align": "VERTICAL",
                "code": "架電状況_2回目",
                "defaultValue": [],
                "label": "架電状況（2回目）",
                "noLabel": false,
                "options": {
                    "架電不要先": {
                        "index": "0",
                        "label": "架電不要先"
                    },
                    "繋がらない（「現在使われていない」）": {
                        "index": "4",
                        "label": "繋がらない（「現在使われていない」）"
                    },
                    "繋がらない（コールするが出ない）": {
                        "index": "3",
                        "label": "繋がらない（コールするが出ない）"
                    },
                    "繋がるも名乗らない": {
                        "index": "2",
                        "label": "繋がるも名乗らない"
                    },
                    "電話が繋がり且つ名乗った": {
                        "index": "1",
                        "label": "電話が繋がり且つ名乗った"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "架電状況_3回目": {
                "align": "VERTICAL",
                "code": "架電状況_3回目",
                "defaultValue": [],
                "label": "架電状況（3回目）",
                "noLabel": false,
                "options": {
                    "架電不要先": {
                        "index": "0",
                        "label": "架電不要先"
                    },
                    "繋がらない（「現在使われていない」）": {
                        "index": "4",
                        "label": "繋がらない（「現在使われていない」）"
                    },
                    "繋がらない（コールするが出ない）": {
                        "index": "3",
                        "label": "繋がらない（コールするが出ない）"
                    },
                    "繋がるも名乗らない": {
                        "index": "2",
                        "label": "繋がるも名乗らない"
                    },
                    "電話が繋がり且つ名乗った": {
                        "index": "1",
                        "label": "電話が繋がり且つ名乗った"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "案件関連企業_支払企業": {
                "code": "案件関連企業_支払企業",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "案件関連企業(支払企業)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "案件関連企業_譲渡企業": {
                "code": "案件関連企業_譲渡企業",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "案件関連企業(譲渡企業)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "案件関連企業_関係者": {
                "code": "案件関連企業_関係者",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "案件関連企業(関係者)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "業種の特定": {
                "align": "VERTICAL",
                "code": "業種の特定",
                "defaultValue": [],
                "label": "業種の特定",
                "noLabel": false,
                "options": {
                    "COSMOSNETで特定不可(他情報で特定。右記にプロセス記載)": {
                        "index": "1",
                        "label": "COSMOSNETで特定不可(他情報で特定。右記にプロセス記載)"
                    },
                    "COSMOSNETで特定済": {
                        "index": "0",
                        "label": "COSMOSNETで特定済"
                    },
                    "特定保留": {
                        "index": "2",
                        "label": "特定保留"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
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
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "法人番号": {
                "code": "法人番号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_中分類": {
                "code": "特定した業種_中分類",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "特定した業種(中分類)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_中分類コピー": {
                "code": "特定した業種_中分類コピー",
                "defaultValue": "",
                "expression": "特定した業種_中分類",
                "hideExpression": false,
                "label": "特定した業種(中分類コピー)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_大分類": {
                "code": "特定した業種_大分類",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "特定した業種(大分類)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_大分類コピー": {
                "code": "特定した業種_大分類コピー",
                "defaultValue": "",
                "expression": "特定した業種_大分類",
                "hideExpression": false,
                "label": "特定した業種(大分類コピー)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_小分類": {
                "code": "特定した業種_小分類",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "特定した業種(小分類)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "特定した業種_小分類コピー": {
                "code": "特定した業種_小分類コピー",
                "defaultValue": "",
                "expression": "特定した業種_小分類",
                "hideExpression": false,
                "label": "特定した業種(小分類コピー)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "登記上の代表者名_手入力": {
                "code": "登記上の代表者名_手入力",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "登記上の代表者名(手入力)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "登記上の商号": {
                "code": "登記上の商号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "登記上の商号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "登記上の本店": {
                "code": "登記上の本店",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "登記上の本店",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "登記情報取得No_": {
                "code": "登記情報取得No_",
                "label": "登記情報取得No.",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "登記上の商号",
                            "relatedField": "商号"
                        },
                        {
                            "field": "登記上の本店",
                            "relatedField": "本店住所"
                        },
                        {
                            "field": "取得日時",
                            "relatedField": "取得日時"
                        },
                        {
                            "field": "会社設立年月日",
                            "relatedField": "会社設立年月日"
                        },
                        {
                            "field": "資本金の額",
                            "relatedField": "資本金の額"
                        },
                        {
                            "field": "資産の総額",
                            "relatedField": "資産の総額"
                        },
                        {
                            "field": "目的",
                            "relatedField": "目的"
                        },
                        {
                            "field": "代表者氏名1",
                            "relatedField": "代表者氏名1"
                        },
                        {
                            "field": "代表者氏名2",
                            "relatedField": "代表者氏名2"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [],
                    "relatedApp": {
                        "app": "62",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "目的": {
                "code": "目的",
                "defaultValue": "",
                "label": "目的",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "確認者1": {
                "code": "確認者1",
                "defaultValue": [],
                "entities": [],
                "label": "(確認者1）",
                "noLabel": false,
                "required": false,
                "type": "USER_SELECT"
            },
            "確認者2": {
                "code": "確認者2",
                "defaultValue": [],
                "entities": [],
                "label": "(確認者2）",
                "noLabel": false,
                "required": false,
                "type": "USER_SELECT"
            },
            "記事取得タスク": {
                "code": "記事取得タスク",
                "label": "記事取得タスク",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "作成中_審査Ver2"
                    },
                    "displayFields": [
                        "レコード番号",
                        "更新日時",
                        "検索ワード",
                        "検索ワード種別",
                        "媒体01",
                        "媒体02"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "65",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
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
            },
            "録音URL_架電1回目": {
                "code": "録音URL_架電1回目",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "録音URL（架電1回目）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "録音URL_架電2回目": {
                "code": "録音URL_架電2回目",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "録音URL（架電2回目）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "録音URL_架電3回目": {
                "code": "録音URL_架電3回目",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "録音URL（架電3回目）",
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
        "appId": "79",
        "name": "審査Ver2.0"
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
                        "type": "CREATOR",
                        "code": "作成者",
                        "size": {}
                    },
                    {
                        "type": "CREATED_TIME",
                        "code": "作成日時",
                        "size": {}
                    },
                    {
                        "type": "MODIFIER",
                        "code": "更新者",
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
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">審査対象</font><font size=\"2\">-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- </font></b></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "最新フラグ",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理No_審査対象企業",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人名・屋号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "企業形態",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者役職",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者備考",
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
                        "type": "NUMBER",
                        "code": "登記情報取得No_",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "取引区分",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_大分類コピー",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_中分類コピー",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_小分類コピー",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "HPのURL1",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "boxのURL",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No_譲渡企業",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "案件関連企業_譲渡企業",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No_支払企業2",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "案件関連企業_支払企業",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No_関係者",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "案件関連企業_関係者",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No_関係会社1",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "審査対象企業の関係会社1",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No__関係会社2",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "審査対象企業の関係会社2",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理_No__関係会社3",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "審査対象企業の関係会社3",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">審査結果</font><font size=\"2\">-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- </font></b></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DATE",
                        "code": "審査完了日",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "付与与信枠_決定金額_事前と少額",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>与信枠の金額は手動入力欄を優先して利用します</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "付与与信枠_手動入力_標準と高額",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "creditInfoRecordNo",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "付与与信枠_自動算出",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "与信付与条件",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CALC",
                        "code": "モニタリング開始可能日",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "モニタリング終了日",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">審査意見</font><font size=\"2\">-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- </font></b></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "審査種類",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "審査依頼者",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "審査目的",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "USER_SELECT",
                        "code": "審査管理者",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "意見_審査管理者",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "付与与信枠_審査管理者",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "コメント_審査管理者",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "USER_SELECT",
                        "code": "確認者2",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "意見_確認者2",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "付与与信枠_確認者2",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "コメント_確認者2",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "USER_SELECT",
                        "code": "確認者1",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "意見_確認者1",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "付与与信枠_確認者1",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "コメント_確認者1",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "USER_SELECT",
                        "code": "審査リーダー",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "意見_審査リーダー",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "付与与信枠_審査リーダー",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "コメント_審査リーダー",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "USER_SELECT",
                        "code": "審査担当者_作成者",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "意見_審査担当者",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "コメント_審査担当者",
                        "size": {
                            "innerHeight": "91"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">審査担当者調査項目</font><font size=\"2\">------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></b></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\" color=\"#ff0000\">【事前審査】</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">  事前審査項目の概要</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済＿事前審査項目の概要",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"2\">----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "取得情報と登記情報の一致確認",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "Google検索_自動取得",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "暴力団wiki検索_自動取得",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "日経テレコン検索_自動取得",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　</font><font size=\"4\">事前審査の調査項目</font><font size=\"2\">--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"4\">取得からの情報</font><font size=\"2\">------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "取得経路",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した企業名＿手入力の場合",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した代表者名＿手入力の場合",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した住所＿手入力の場合",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した企業名＿HubSpotの場合",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した企業名＿HubSpotの場合_0",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した住所＿HubSpotの場合",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "取得した担当者_HubSpotの場合",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"4\">登記情報</font><font size=\"2\">---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "取得日時",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "登記上の商号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者氏名1",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "登記上の本店",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "会社設立年月日",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "資本金の額",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者氏名2",
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
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "登記上の代表者名_手入力",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "目的",
                        "size": {
                            "innerHeight": "132"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "記事取得タスク"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "日経テレコン検索"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\" color=\"#ff0000\">【少額審査】</font></div>",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">&#xff08;※個人事業主は少額審査のプロセスは不要&#xff09;</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　</font><font size=\"4\">少額審査の調査項目</font><font size=\"2\">--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">　 架電の結果</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済_TDBからの情報",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"2\">----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "架電状況_1回目",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "架電日時_1回目",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "コールコネクト通話履歴_架電1回目",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "録音URL_架電1回目",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "架電状況_2回目",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "架電日時_2回目",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "コールコネクト通話履歴_架電2回目",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "録音URL_架電2回目",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "架電状況_3回目",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "架電日時_3回目",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "コールコネクト通話履歴_架電3回目",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "録音URL_架電3回目",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">　 業種の特定</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済＿業種の特定",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>&#xff08;https://cnet.tdb.ne.jp/cnet/ta111p01/ta111pInit.do&#xff09;<br /></div>",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>&#xff08;https://docs.google.com/spreadsheets/d/1AaZqF8KJRA1YUcF1qhsJB8cNy-WnZ1knBomJ9U62s70/edit#gid&#61;1784579852&#xff09;<br /></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_大分類",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_中分類",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "特定した業種_小分類",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "業種の特定",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "COSMOSNETで特定できない時の判断プロセスの記載",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">　 上場関連の情報</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済＿上場関連の情報",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>&#xff08;https://shikiho.jp/&#xff09;<br /></div>",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">----------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "上場関連か否か",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "上場関連の場合_確認時に使用したURLを記載",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">　 TDBからの情報</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済＿TDBからの情報",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"2\">----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "TDB情報取得日",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "TDBグレード",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "TDB評点",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\">　 HPの有無等情報</font></div>",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "リーダー確認済＿HPの有無等情報",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"2\">　　</font><font size=\"2\">----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "HP有無",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "HPのURL_コピー2",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "HRF 入力必須項目一覧": {
                "fields": [
                    "ステータス",
                    "レコード番号",
                    "作成日時",
                    "法人名・屋号",
                    "企業形態",
                    "取引区分",
                    "取引企業管理_No_譲渡企業",
                    "審査完了日",
                    "付与与信枠_決定金額_事前と少額",
                    "審査種類",
                    "審査依頼者",
                    "審査目的",
                    "審査担当者_作成者",
                    "意見_審査担当者",
                    "コメント_審査担当者",
                    "審査リーダー",
                    "意見_審査リーダー",
                    "リーダー確認済＿事前審査項目の概要",
                    "取得情報と登記情報の一致確認",
                    "Google検索_自動取得",
                    "暴力団wiki検索_自動取得",
                    "取得経路",
                    "架電状況_1回目",
                    "架電日時_1回目",
                    "コールコネクト通話履歴_架電1回目"
                ],
                "filterCond": "",
                "index": "1",
                "name": "HRF 入力必須項目一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧1": {
                "fields": [
                    "最新フラグ",
                    "レコード番号",
                    "更新者",
                    "更新日時",
                    "作成者",
                    "作成日時",
                    "ステータス",
                    "作業者",
                    "取引企業管理No_審査対象企業",
                    "法人名・屋号",
                    "企業形態",
                    "審査種類",
                    "TDBグレード",
                    "付与与信枠_決定金額_事前と少額",
                    "付与与信枠_手動入力_標準と高額",
                    "与信付与条件",
                    "審査完了日",
                    "特定した業種_大分類",
                    "特定した業種_中分類",
                    "特定した業種_小分類",
                    "業種の特定",
                    "案件関連企業_関係者",
                    "案件関連企業_譲渡企業",
                    "案件関連企業_支払企業",
                    "審査管理者",
                    "コメント_審査管理者",
                    "確認者2",
                    "確認者1",
                    "審査リーダー",
                    "コメント_審査リーダー",
                    "審査担当者_作成者",
                    "コメント_審査担当者"
                ],
                "filterCond": "",
                "index": "2",
                "name": "一覧1",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧2": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "更新日時",
                    "企業形態",
                    "法人名・屋号",
                    "作業者",
                    "ステータス",
                    "審査種類",
                    "審査担当者_作成者",
                    "審査リーダー",
                    "リーダー確認済＿事前審査項目の概要",
                    "審査完了日",
                    "付与与信枠_決定金額_事前と少額",
                    "付与与信枠_手動入力_標準と高額",
                    "案件関連企業_譲渡企業",
                    "案件関連企業_支払企業",
                    "案件関連企業_関係者",
                    "審査対象企業の関係会社1"
                ],
                "filterCond": "",
                "index": "0",
                "name": "一覧2",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧3": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "作成者",
                    "取引企業管理No_審査対象企業",
                    "法人名・屋号",
                    "登記情報取得No_",
                    "登記上の商号",
                    "登記上の本店",
                    "代表者氏名1",
                    "代表者氏名2"
                ],
                "filterCond": "",
                "index": "4",
                "name": "一覧3",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "飯田さんへ(事前審査) 2019.4.5": {
                "fields": [
                    "メモ",
                    "レコード番号",
                    "更新者",
                    "更新日時",
                    "作成者",
                    "作成日時",
                    "作業者",
                    "取引企業管理No_審査対象企業",
                    "法人名・屋号",
                    "ステータス"
                ],
                "filterCond": "メモ in (\"取込利用\")",
                "index": "5",
                "name": "飯田さんへ(事前審査) 2019.4.5",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "（作業者が自分）": {
                "builtinType": "ASSIGNEE",
                "fields": [
                    "レコード番号",
                    "取引企業管理No_審査対象企業",
                    "法人名・屋号",
                    "審査種類",
                    "取引企業管理_No_譲渡企業",
                    "案件関連企業_譲渡企業",
                    "取引企業管理_No_支払企業2",
                    "案件関連企業_支払企業",
                    "取引企業管理_No_関係会社1",
                    "審査対象企業の関係会社1",
                    "取引企業管理_No__関係会社2",
                    "審査対象企業の関係会社2",
                    "取引企業管理_No__関係会社3",
                    "審査対象企業の関係会社3",
                    "審査完了日",
                    "付与与信枠_決定金額_事前と少額",
                    "与信付与条件",
                    "審査管理者",
                    "コメント_審査管理者",
                    "確認者2",
                    "コメント_確認者2",
                    "確認者1",
                    "コメント_確認者1",
                    "審査リーダー",
                    "コメント_審査リーダー",
                    "審査担当者_作成者",
                    "意見_審査担当者",
                    "コメント_審査担当者",
                    "意見_審査管理者",
                    "付与与信枠_審査管理者",
                    "意見_確認者2",
                    "付与与信枠_確認者2",
                    "意見_確認者1",
                    "付与与信枠_確認者1",
                    "意見_審査リーダー",
                    "付与与信枠_審査リーダー",
                    "取得した企業名＿手入力の場合",
                    "取得した代表者名＿手入力の場合",
                    "取得した住所＿手入力の場合",
                    "登記情報取得No_",
                    "登記上の商号",
                    "登記上の代表者名_手入力",
                    "登記上の本店",
                    "取得日時",
                    "会社設立年月日",
                    "資本金の額",
                    "資産の総額",
                    "目的",
                    "代表者",
                    "代表者役職",
                    "代表者備考",
                    "企業形態",
                    "取引区分",
                    "上場関連の場合_確認時に使用したURLを記載",
                    "TDB情報取得日",
                    "TDB評点",
                    "COSMOSNETで特定できない時の判断プロセスの記載",
                    "架電日時_1回目",
                    "コールコネクト通話履歴_架電1回目",
                    "録音URL_架電1回目",
                    "コールコネクト通話履歴_架電2回目",
                    "架電日時_2回目",
                    "録音URL_架電2回目",
                    "コールコネクト通話履歴_架電3回目",
                    "架電日時_3回目",
                    "録音URL_架電3回目",
                    "ステータス",
                    "作業者"
                ],
                "filterCond": "作業者 in (LOGINUSER())",
                "index": "3",
                "name": "（作業者が自分）",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};
