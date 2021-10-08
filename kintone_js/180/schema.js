export const schema_180 = {
    "fields": {
        "properties": {
            "FAX_本店": {
                "code": "FAX_本店",
                "defaultValue": "",
                "label": "FAX(本店)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "CALL",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "TEL_HRF請求データより": {
                "code": "TEL_HRF請求データより",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "TEL(HRF請求データより)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "TEL_HubSpotより": {
                "code": "TEL_HubSpotより",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "TEL(HubSpotより)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "TEL_本店": {
                "code": "TEL_本店",
                "defaultValue": "",
                "label": "TEL",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "CALL",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "Table": {
                "code": "Table",
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
                "label": "Table",
                "noLabel": true,
                "type": "SUBTABLE"
            },
            "WEBサイト_コーポレートサイト": {
                "code": "WEBサイト_コーポレートサイト",
                "defaultValue": "",
                "label": "WEBサイト（コーポレートサイト）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "カテゴリー": {
                "code": "カテゴリー",
                "enabled": false,
                "label": "カテゴリー",
                "type": "CATEGORY"
            },
            "キーマン": {
                "code": "キーマン",
                "label": "キーマン",
                "lookup": {
                    "fieldMappings": [],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "氏名",
                        "法人名・屋号_1",
                        "法人名・屋号_2",
                        "法人名・屋号_3"
                    ],
                    "relatedApp": {
                        "app": "29",
                        "code": ""
                    },
                    "relatedKeyField": "氏名",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT"
            },
            "キーマンメモ": {
                "code": "キーマンメモ",
                "defaultValue": "",
                "label": "キーマンメモ",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "キーマン顔写真": {
                "code": "キーマン顔写真",
                "label": "キーマン顔写真",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "150",
                "type": "FILE"
            },
            "コールコネクト通話履歴": {
                "code": "コールコネクト通話履歴",
                "label": "コールコネクト通話履歴",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "TEL_本店",
                        "relatedField": "TEL"
                    },
                    "displayFields": [
                        "作成日時",
                        "Status",
                        "Duration",
                        "Memo",
                        "URL"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "58",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "ステータス": {
                "code": "ステータス",
                "enabled": false,
                "label": "ステータス",
                "type": "STATUS"
            },
            "テーブル_支店": {
                "code": "テーブル_支店",
                "fields": {
                    "FAX_支店": {
                        "code": "FAX_支店",
                        "defaultValue": "",
                        "label": "FAX(支店)",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "protocol": "CALL",
                        "required": false,
                        "type": "LINK",
                        "unique": false
                    },
                    "TEL_支店": {
                        "code": "TEL_支店",
                        "defaultValue": "",
                        "label": "TEL(支店)",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "protocol": "CALL",
                        "required": false,
                        "type": "LINK",
                        "unique": false
                    },
                    "住所_支店": {
                        "code": "住所_支店",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "住所(支店)",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "備考_支店・支社名": {
                        "code": "備考_支店・支社名",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "備考（支店・支社名）",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "郵便番号_支店": {
                        "code": "郵便番号_支店",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "郵便番号(支店)",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    }
                },
                "label": "テーブル_支店",
                "noLabel": true,
                "type": "SUBTABLE"
            },
            "テーブル_締め支払い": {
                "code": "テーブル_締め支払い",
                "fields": {
                    "締め支払い": {
                        "code": "締め支払い",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "締め支払い",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "説明_締め支払い": {
                        "code": "説明_締め支払い",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "説明（締め支払い）",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    }
                },
                "label": "テーブル_締め支払い",
                "noLabel": true,
                "type": "SUBTABLE"
            },
            "ペイメント": {
                "align": "HORIZONTAL",
                "code": "ペイメント",
                "defaultValue": [],
                "label": "ペイメント",
                "noLabel": false,
                "options": {
                    "稼働先": {
                        "index": "0",
                        "label": "稼働先"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
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
            "メルマガ用チェック": {
                "align": "HORIZONTAL",
                "code": "メルマガ用チェック",
                "defaultValue": [],
                "label": "メルマガ用チェック",
                "noLabel": false,
                "options": {
                    "メルマガ送信先": {
                        "index": "0",
                        "label": "メルマガ送信先"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "メールアドレス_会社": {
                "code": "メールアドレス_会社",
                "defaultValue": "",
                "label": "メールアドレス(会社)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "MAIL",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "レコード番号": {
                "code": "レコード番号",
                "label": "レコード番号",
                "noLabel": false,
                "type": "RECORD_NUMBER"
            },
            "主な事業内容": {
                "code": "主な事業内容",
                "defaultValue": "",
                "label": "主な事業内容",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "代表者備考": {
                "code": "代表者備考",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者備考",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "代表者名": {
                "code": "代表者名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "代表者名_役職": {
                "code": "代表者名_役職",
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
            "企業形態": {
                "code": "企業形態",
                "defaultValue": "",
                "label": "企業形態",
                "noLabel": false,
                "options": {
                    "個人企業": {
                        "index": "1",
                        "label": "個人企業"
                    },
                    "未確認": {
                        "index": "2",
                        "label": "未確認"
                    },
                    "法人企業": {
                        "index": "0",
                        "label": "法人企業"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
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
            "住所_HubSpotより": {
                "code": "住所_HubSpotより",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "住所(自動入力用)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "住所_本店": {
                "code": "住所_本店",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "住所(本店)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "住所_請求書送付先": {
                "code": "住所_請求書送付先",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "住所(請求書送付先)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "作成中_審査Ver2": {
                "code": "作成中_審査Ver2",
                "label": "審査Ver2.0",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理No_審査対象企業"
                    },
                    "displayFields": [
                        "最新フラグ",
                        "ステータス",
                        "取引区分",
                        "審査種類",
                        "審査完了日",
                        "付与与信枠_決定金額_事前と少額",
                        "付与与信枠_手動入力_標準と高額",
                        "与信付与条件",
                        "TDBグレード",
                        "モニタリング開始可能日",
                        "モニタリング終了日"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "79",
                        "code": ""
                    },
                    "size": "10",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
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
                "label": "備考",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
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
                "required": false,
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
            "口座名義": {
                "code": "口座名義",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座名義",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "口座名義_カナ": {
                "code": "口座名義_カナ",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座名義(カナ)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "口座番号": {
                "code": "口座番号",
                "defaultValue": "",
                "digit": true,
                "displayScale": "",
                "label": "口座番号",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "商号": {
                "code": "商号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "商号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "営業案件管理": {
                "code": "営業案件管理",
                "label": "営業案件管理",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号"
                    },
                    "displayFields": [
                        "レコード番号",
                        "ステータス",
                        "案件化日",
                        "案件名",
                        "営業担当者",
                        "ステータス",
                        "案件種別"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "35",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "営業活動履歴": {
                "code": "営業活動履歴",
                "label": "営業活動履歴",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号"
                    },
                    "displayFields": [
                        "対応日",
                        "営業案件管理レコード番号",
                        "案件名",
                        "営業担当者",
                        "営業活動内容"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "36",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "契約書１": {
                "code": "契約書１",
                "label": "契約書１",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_契約相手1_"
                    },
                    "displayFields": [
                        "処理状況",
                        "契約開始日",
                        "契約書タイトル",
                        "法人名・屋号_契約相手2_",
                        "法人名・屋号_契約相手3_"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "37",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "契約書２": {
                "code": "契約書２",
                "label": "契約書２",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_契約相手2_"
                    },
                    "displayFields": [
                        "処理状況",
                        "契約開始日",
                        "契約書タイトル",
                        "法人名・屋号_契約相手1_",
                        "法人名・屋号_契約相手3_"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "37",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "契約書３": {
                "code": "契約書３",
                "label": "契約書３",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_契約相手3_"
                    },
                    "displayFields": [
                        "処理状況",
                        "契約開始日",
                        "契約書タイトル",
                        "法人名・屋号_契約相手2_",
                        "法人名・屋号_契約相手3_"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "37",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "小額簡易与信_個人事業": {
                "code": "小額簡易与信_個人事業",
                "label": "小額簡易与信（個人事業）",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理_No_"
                    },
                    "displayFields": [
                        "取引区分",
                        "処理状況",
                        "作成日時",
                        "審査完了日",
                        "付与与信枠",
                        "与信付与条件"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "51",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "小額簡易与信_法人企業": {
                "code": "小額簡易与信_法人企業",
                "label": "小額簡易与信（法人企業）",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理_No_"
                    },
                    "displayFields": [
                        "取引区分",
                        "処理状況",
                        "作成日時",
                        "審査完了日",
                        "付与与信枠",
                        "与信付与条件"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "30",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "役員・社員・関係者_1": {
                "code": "役員・社員・関係者_1",
                "label": "役員・社員・関係者①",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_1"
                    },
                    "displayFields": [
                        "氏名",
                        "部署・役職_1",
                        "備考_1",
                        "メールアドレス_1"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "29",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "役員・社員・関係者_2": {
                "code": "役員・社員・関係者_2",
                "label": "役員・社員・関係者②",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_2"
                    },
                    "displayFields": [
                        "氏名",
                        "部署・役職_2",
                        "備考_2",
                        "メールアドレス_2"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "29",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "役員・社員・関係者_3": {
                "code": "役員・社員・関係者_3",
                "label": "役員・社員・関係者③",
                "noLabel": true,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理レコード番号_3"
                    },
                    "displayFields": [
                        "氏名",
                        "部署・役職_3",
                        "備考_3",
                        "メールアドレス_3"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "29",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "支店名": {
                "code": "支店名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支店名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "文字列__1行_": {
                "code": "文字列__1行_",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "HubSpot記載の担当者",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
                "label": "本店住所",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "業種": {
                "code": "業種",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "業種",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "法人名・屋号": {
                "code": "法人名・屋号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人名・屋号",
                "maxLength": "64",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": true
            },
            "法人名・屋号_HubSpotより": {
                "code": "法人名・屋号_HubSpotより",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人名・屋号(自動入力用)",
                "maxLength": "64",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "法人名・屋号_カナ": {
                "code": "法人名・屋号_カナ",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人名・屋号(カナ)",
                "maxLength": "64",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": true
            },
            "法人番号": {
                "code": "法人番号",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "法人番号(12桁ハイフンなし)",
                "maxLength": "14",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": true
            },
            "消費税取扱い": {
                "code": "消費税取扱い",
                "defaultValue": "不明",
                "label": "消費税取扱い",
                "noLabel": false,
                "options": {
                    "不明": {
                        "index": "3",
                        "label": "不明"
                    },
                    "切上げ": {
                        "index": "0",
                        "label": "切上げ"
                    },
                    "切捨て": {
                        "index": "1",
                        "label": "切捨て"
                    },
                    "四捨五入": {
                        "index": "2",
                        "label": "四捨五入"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "登記情報取得_No_": {
                "code": "登記情報取得_No_",
                "label": "登記情報取得 No.",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "取得日時",
                            "relatedField": "取得日時"
                        },
                        {
                            "field": "商号",
                            "relatedField": "商号"
                        },
                        {
                            "field": "本店住所",
                            "relatedField": "本店住所"
                        },
                        {
                            "field": "会社設立年月日",
                            "relatedField": "会社設立年月日"
                        },
                        {
                            "field": "目的",
                            "relatedField": "目的"
                        },
                        {
                            "field": "資本金の額",
                            "relatedField": "資本金の額"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "取得日時",
                        "法人番号",
                        "商号"
                    ],
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
            "督促管理用": {
                "code": "督促管理用",
                "label": "督促管理用",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理_No_"
                    },
                    "displayFields": [
                        "更新日時",
                        "いつ時点の情報か",
                        "ステータス_1",
                        "未入金_金額合計",
                        "未入金_月数合計_",
                        "救援が必要な先"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "77",
                        "code": ""
                    },
                    "size": "10",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "絞り込み用": {
                "align": "HORIZONTAL",
                "code": "絞り込み用",
                "defaultValue": [],
                "label": "絞り込み用",
                "noLabel": false,
                "options": {
                    "HRF2018年10月セミナー": {
                        "index": "3",
                        "label": "HRF2018年10月セミナー"
                    },
                    "HRF2018年9月セミナー": {
                        "index": "2",
                        "label": "HRF2018年9月セミナー"
                    },
                    "船井 会計研": {
                        "index": "1",
                        "label": "船井 会計研"
                    },
                    "船井総研ロジ": {
                        "index": "0",
                        "label": "船井総研ロジ"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "設立年月": {
                "code": "設立年月",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "設立年月",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
            "連絡方法": {
                "code": "連絡方法",
                "defaultValue": "ex. 請求については経理の〇〇さんに電話で連絡する",
                "label": "連絡方法",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "郵便番号_HubSpotより": {
                "code": "郵便番号_HubSpotより",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "郵便番号(自動入力用)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "郵便番号_本店": {
                "code": "郵便番号_本店",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "郵便番号(本店)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "郵便番号_請求書送付先": {
                "code": "郵便番号_請求書送付先",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "郵便番号(請求書送付先)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "金融機関": {
                "code": "金融機関",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "関連レコード一覧": {
                "code": "関連レコード一覧",
                "label": "関連レコード一覧",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "レコード番号",
                        "relatedField": "取引企業管理_No_"
                    },
                    "displayFields": [
                        "レコード番号",
                        "取得日時",
                        "本店住所",
                        "資本金の額",
                        "資産の総額"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "62",
                        "code": ""
                    },
                    "size": "5",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "預金種目": {
                "code": "預金種目",
                "defaultValue": "",
                "label": "預金種目",
                "noLabel": false,
                "options": {
                    "当座": {
                        "index": "1",
                        "label": "当座"
                    },
                    "普通": {
                        "index": "0",
                        "label": "普通"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            }
        }
    },
    "id": {
        "appId": "180",
        "name": "DEV_取引企業管理"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\" color=\"#000000\">取引企業管理</font></b></div>",
                        "size": {}
                    }
                ]
            },
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
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人番号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人名・屋号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人名・屋号_カナ",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>https://www.houjin-bangou.nta.go.jp/</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "取引区分",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "企業形態",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "設立年月",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者名_役職",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "代表者備考",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "郵便番号_本店",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "住所_本店",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "郵便番号_請求書送付先",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "住所_請求書送付先",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "郵便番号_HubSpotより",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "住所_HubSpotより",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "文字列__1行_",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "法人名・屋号_HubSpotより",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "TEL_HubSpotより",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "TEL_HRF請求データより",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "TEL_本店",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "FAX_本店",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "メールアドレス_会社",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "WEBサイト_コーポレートサイト",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "ペイメント",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "備考",
                        "size": {
                            "innerHeight": "101"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "業種",
                        "size": {}
                    },
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "主な事業内容",
                        "size": {
                            "innerHeight": "84"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">登記情報</font></b><br /></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "登記情報取得_No_",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "取得日時",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "資本金の額",
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
                        "code": "商号",
                        "size": {}
                    },
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
                            "innerHeight": "84"
                        }
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "Table",
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
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">支店・支社</font></b></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "テーブル_支店",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "郵便番号_支店",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "住所_支店",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "TEL_支店",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "FAX_支店",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "備考_支店・支社名",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">役員・社員・関係者&#xff08;取引個人管理&#xff09;</font></b></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "役員・社員・関係者_1"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "役員・社員・関係者_2"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "役員・社員・関係者_3"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "連絡方法",
                        "size": {
                            "innerHeight": "84"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>登記情報取得</b></font><br /></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "関連レコード一覧"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>与信審査</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "作成中_審査Ver2"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "小額簡易与信_法人企業"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "小額簡易与信_個人事業"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "督促管理用"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>営業活動</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "営業案件管理"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "営業活動履歴"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>契約書管理</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "契約書１"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "契約書２"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "契約書３"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">口座情報</font>&#xff08;インベストからの振込先口座&#xff09;</b><span></span></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "金融機関",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支店名",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "預金種目",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "口座番号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "口座名義",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "口座名義_カナ",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "テーブル_締め支払い",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "締め支払い",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "説明_締め支払い",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "消費税取扱い",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>支払企業債権管理</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>関連会社</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>コールコネクト通話記録</b></font></div>",
                        "size": {}
                    },
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "コールコネクト通話履歴"
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "HR",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "メルマガ用チェック",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "キーマン",
                        "size": {}
                    },
                    {
                        "type": "FILE",
                        "code": "キーマン顔写真",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "キーマンメモ",
                        "size": {
                            "innerHeight": "84"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "絞り込み用",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "すべての取引企業": {
                "fields": [
                    "レコード番号",
                    "法人名・屋号",
                    "住所_本店",
                    "取引区分",
                    "企業形態",
                    "代表者名",
                    "代表者備考"
                ],
                "filterCond": "",
                "index": "1",
                "name": "すべての取引企業",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "メモあり": {
                "fields": [
                    "メモ",
                    "レコード番号",
                    "法人名・屋号",
                    "登記情報取得_No_",
                    "取得日時",
                    "商号",
                    "代表者名",
                    "更新日時",
                    "更新者",
                    "作成日時",
                    "作成者"
                ],
                "filterCond": "メモ in (\"取込利用\")",
                "index": "3",
                "name": "メモあり",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧": {
                "fields": [
                    "メモ",
                    "レコード番号",
                    "更新者",
                    "更新日時",
                    "作成者",
                    "作成日時",
                    "法人名・屋号",
                    "登記情報取得_No_"
                ],
                "filterCond": "",
                "index": "4",
                "name": "一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "入力項目一覧": {
                "fields": [
                    "レコード番号",
                    "法人番号",
                    "法人名・屋号",
                    "取引区分",
                    "企業形態",
                    "郵便番号_HubSpotより",
                    "住所_HubSpotより",
                    "法人名・屋号_HubSpotより",
                    "文字列__1行_",
                    "TEL_HubSpotより",
                    "TEL_本店",
                    "WEBサイト_コーポレートサイト",
                    "備考",
                    "メールアドレス_会社"
                ],
                "filterCond": "",
                "index": "0",
                "name": "入力項目一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "営業用": {
                "fields": [
                    "絞り込み用",
                    "法人名・屋号",
                    "住所_本店",
                    "キーマン顔写真",
                    "キーマン",
                    "キーマンメモ"
                ],
                "filterCond": "",
                "index": "2",
                "name": "営業用",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "稼働先": {
                "fields": [
                    "ペイメント",
                    "レコード番号",
                    "法人名・屋号",
                    "備考"
                ],
                "filterCond": "ペイメント in (\"稼働先\")",
                "index": "5",
                "name": "稼働先",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};
