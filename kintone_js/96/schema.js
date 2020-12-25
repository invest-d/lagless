export const schema_96 = {
    "fields": {
        "properties": {
            "applicationLimit": {
                "code": "applicationLimit",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "年間回数制限",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "回",
                "unitPosition": "AFTER"
            },
            "ceo": {
                "code": "ceo",
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
            "ceoTitle": {
                "code": "ceoTitle",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表者役職名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "closing": {
                "code": "closing",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "締日",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "commissionRate_late": {
                "code": "commissionRate_late",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "遅払い手数料割合",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "%",
                "unitPosition": "AFTER"
            },
            "cost": {
                "code": "cost",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "早払手数料",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "creditFacility": {
                "code": "creditFacility",
                "defaultValue": "0",
                "digit": true,
                "displayScale": "",
                "label": "早払い付与与信枠（審査2.0から取得）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "customerCode": {
                "code": "customerCode",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "取引企業No.",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "daysLater": {
                "code": "daysLater",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "",
                "label": "遅払い日数",
                "maxValue": "",
                "minValue": "0",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "日",
                "unitPosition": "AFTER"
            },
            "deadline": {
                "code": "deadline",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "申込期限",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "defaultPaymentResponsible": {
                "align": "HORIZONTAL",
                "code": "defaultPaymentResponsible",
                "defaultValue": "工務店",
                "label": "通常払いの担当",
                "noLabel": false,
                "options": {
                    "インベストデザイン": {
                        "index": "1",
                        "label": "インベストデザイン"
                    },
                    "工務店": {
                        "index": "0",
                        "label": "工務店"
                    }
                },
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "default_pay_date_list": {
                "code": "default_pay_date_list",
                "fields": {
                    "closing_date": {
                        "code": "closing_date",
                        "defaultNowValue": false,
                        "defaultValue": "",
                        "label": "締日",
                        "noLabel": false,
                        "required": false,
                        "type": "DATE",
                        "unique": false
                    },
                    "default_pay_date": {
                        "code": "default_pay_date",
                        "defaultNowValue": false,
                        "defaultValue": "",
                        "label": "通常支払日",
                        "noLabel": false,
                        "required": false,
                        "type": "DATE",
                        "unique": false
                    }
                },
                "label": "通常支払日一覧",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "early": {
                "code": "early",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "早期支払日",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "effect": {
                "code": "effect",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "短縮日数",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "emailAddressToSendInvoice": {
                "code": "emailAddressToSendInvoice",
                "fields": {
                    "emailForInvoice": {
                        "code": "emailForInvoice",
                        "defaultValue": "",
                        "label": "送信先メールアドレス",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "protocol": "MAIL",
                        "required": false,
                        "type": "LINK",
                        "unique": false
                    }
                },
                "label": "振込依頼書送信先一覧（1行目がTo、2行目以降Cc）",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "handleForHolidays": {
                "code": "handleForHolidays",
                "defaultValue": "",
                "label": "休日の取扱",
                "noLabel": false,
                "options": {
                    "前営業日": {
                        "index": "0",
                        "label": "前営業日"
                    },
                    "翌営業日": {
                        "index": "1",
                        "label": "翌営業日"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "id": {
                "code": "id",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工務店ID",
                "maxLength": "64",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": true
            },
            "invoiceAddressee": {
                "code": "invoiceAddressee",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "振込依頼書送付メール 本文上の宛先（役職＋氏名）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "lag": {
                "code": "lag",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "タイムラグ",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "limit": {
                "code": "limit",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "年間回数制限（コピー元：営業案件管理）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "link": {
                "code": "link",
                "defaultValue": "",
                "label": "詳しくはこちら（リンク先）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "mail": {
                "code": "mail",
                "defaultValue": "",
                "label": "問い合わせ先メールアドレス",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "MAIL",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "nextCheckStatus": {
                "align": "HORIZONTAL",
                "code": "nextCheckStatus",
                "defaultValue": [],
                "label": "次回の反社チェック・与信審査",
                "noLabel": false,
                "options": {
                    "与信枠を審査・取得する": {
                        "index": "1",
                        "label": "与信枠を審査・取得する"
                    },
                    "反社チェックを行う": {
                        "index": "0",
                        "label": "反社チェックを行う"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "original": {
                "code": "original",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "通常の支払日",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "participants": {
                "code": "participants",
                "fields": {
                    "participantBorder": {
                        "code": "participantBorder",
                        "defaultValue": "0",
                        "digit": true,
                        "displayScale": "",
                        "label": "この金額以上の場合に回付者となる",
                        "maxValue": "",
                        "minValue": "0",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "",
                        "unitPosition": "BEFORE"
                    },
                    "participantCompany": {
                        "code": "participantCompany",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "所属企業名",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "participantEmail": {
                        "code": "participantEmail",
                        "defaultValue": "",
                        "label": "メールアドレス",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "protocol": "MAIL",
                        "required": false,
                        "type": "LINK",
                        "unique": false
                    },
                    "participantName": {
                        "code": "participantName",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "氏名",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "participantOrder": {
                        "code": "participantOrder",
                        "defaultValue": "",
                        "digit": false,
                        "displayScale": "",
                        "label": "回付順",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "",
                        "unitPosition": "BEFORE"
                    },
                    "participantTitle": {
                        "code": "participantTitle",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "役職",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    }
                },
                "label": "クラウドサイン回付者一覧",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "pattern": {
                "code": "pattern",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支払パターン",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "remainingCreditFacility": {
                "code": "remainingCreditFacility",
                "displayScale": "",
                "expression": "creditFacility - uncollectedAmount",
                "format": "NUMBER_DIGIT",
                "hideExpression": true,
                "label": "早払い与信枠残高",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "reportees": {
                "code": "reportees",
                "fields": {
                    "reporteeCompany": {
                        "code": "reporteeCompany",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "所属企業名",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "reporteeEmail": {
                        "code": "reporteeEmail",
                        "defaultValue": "",
                        "label": "メールアドレス",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "protocol": "MAIL",
                        "required": false,
                        "type": "LINK",
                        "unique": false
                    },
                    "reporteeName": {
                        "code": "reporteeName",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "氏名",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "reporteeTitle": {
                        "code": "reporteeTitle",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "役職",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    }
                },
                "label": "クラウドサイン共有先一覧",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "service": {
                "code": "service",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "商品名（コピー元：営業案件管理）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "startMailScheduled": {
                "code": "startMailScheduled",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "スタートメール送信予定日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "tmpcommissionRate": {
                "code": "tmpcommissionRate",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "早払い手数料割合",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "%",
                "unitPosition": "AFTER"
            },
            "tmptransferFee": {
                "code": "tmptransferFee",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "（一時的・計算用）税別振込手数料",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transfer_fee": {
                "code": "transfer_fee",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "振込手数料",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "uncollectedAmount": {
                "code": "uncollectedAmount",
                "defaultValue": "0",
                "digit": true,
                "displayScale": "",
                "label": "早払い未回収金額（ボタンで計算）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "uncollectedAmount_late": {
                "code": "uncollectedAmount_late",
                "defaultValue": "0",
                "digit": true,
                "displayScale": "",
                "label": "遅払い未回収金額（ボタンで計算）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "yield": {
                "code": "yield",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "遅払手数料",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "カテゴリー": {
                "code": "カテゴリー",
                "enabled": false,
                "label": "カテゴリー",
                "type": "CATEGORY"
            },
            "スケジュール": {
                "code": "スケジュール",
                "label": "スケジュール",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "pattern",
                        "relatedField": "pattern"
                    },
                    "displayFields": [
                        "closing",
                        "deadline",
                        "early",
                        "late"
                    ],
                    "filterCond": "deadline >= TODAY()",
                    "relatedApp": {
                        "app": "95",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "deadline asc"
                },
                "type": "REFERENCE_TABLE"
            },
            "ステータス": {
                "code": "ステータス",
                "enabled": false,
                "label": "ステータス",
                "type": "STATUS"
            },
            "レコード番号": {
                "code": "レコード番号",
                "label": "レコード番号",
                "noLabel": false,
                "type": "RECORD_NUMBER"
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
            "協力会社一覧": {
                "code": "協力会社一覧",
                "label": "協力会社一覧",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "id",
                        "relatedField": "工務店ID"
                    },
                    "displayFields": [
                        "支払企業No_",
                        "支払先",
                        "開始日"
                    ],
                    "filterCond": "",
                    "relatedApp": {
                        "app": "88",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "営業案件管理": {
                "code": "営業案件管理",
                "label": "営業案件管理",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "service",
                            "relatedField": "商品名"
                        },
                        {
                            "field": "limit",
                            "relatedField": "年間回数制限"
                        },
                        {
                            "field": "customerCode",
                            "relatedField": "取引企業管理レコード番号"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "法人名・屋号",
                        "商品名",
                        "年間回数制限"
                    ],
                    "relatedApp": {
                        "app": "35",
                        "code": ""
                    },
                    "relatedKeyField": "レコード番号",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
            },
            "工務店名": {
                "code": "工務店名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工務店名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "工務店正式名称": {
                "code": "工務店正式名称",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工務店正式名称",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "支払元口座": {
                "code": "支払元口座",
                "defaultValue": "",
                "label": "支払元口座",
                "noLabel": false,
                "options": {
                    "ID": {
                        "index": "0",
                        "label": "ID"
                    },
                    "LAGLESS": {
                        "index": "1",
                        "label": "LAGLESS"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
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
            "説明ページ": {
                "code": "説明ページ",
                "defaultValue": "",
                "label": "説明ページ（WEB画面）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
                "unique": false
            }
        }
    },
    "id": {
        "appId": "96",
        "name": "工務店マスタ"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "id",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "工務店名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "工務店正式名称",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "customerCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "ceoTitle",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "ceo",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "営業案件管理",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "支払元口座",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>■WEB画面に反映するデータ</b>---------------------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "説明ページ",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "service",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "limit",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "applicationLimit",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>数値型の年間回数制限について&#xff1a;<div>制限なしの場合は0。未記入の場合は0として扱う。<br /></div><div>将来的には数値型のフィールドだけに統一したい。</div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "daysLater",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>←0日の場合、案内メールで送信するのは旧LAGLESSの申込フォームになる。<div>←1日以上の場合、案内メールで送信するのは新LAGLESSの申込フォームになる。</div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "defaultPaymentResponsible",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "cost",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "tmpcommissionRate",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "yield",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "commissionRate_late",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "transfer_fee",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "tmptransferFee",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "link",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "mail",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "closing",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "original",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "lag",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "deadline",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "early",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "effect",
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
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "pattern",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "handleForHolidays",
                        "size": {}
                    },
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "スケジュール"
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "default_pay_date_list",
                "fields": [
                    {
                        "type": "DATE",
                        "code": "closing_date",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "default_pay_date",
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
                "type": "ROW",
                "fields": [
                    {
                        "type": "REFERENCE_TABLE",
                        "code": "協力会社一覧"
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
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>■スタートメール</b></font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DATE",
                        "code": "startMailScheduled",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>設定した日の午前10時に、協力会社マスタで「送信する」設定になっている協力会社にスタートメールを送信する予定です。</div><div>つまり、ここで設定する他に、協力会社マスタのレコードの「スタートメール送信設定」も個別に設定する必要があります。</div>",
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
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\"><b>■反社・与信審査設定</b></font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "nextCheckStatus",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "creditFacility",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "uncollectedAmount",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "remainingCreditFacility",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "uncollectedAmount_late",
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
                "code": "participants",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "participantOrder",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "participantEmail",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "participantCompany",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "participantTitle",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "participantName",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "participantBorder",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>※回付者のうち、インベストデザイン株式会社およびラグレス合同会社 の社員は一覧から除く</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>※「この金額以上の時に回付者となる」に0を入力していれば、いつも必ず回付者になる。</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "reportees",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "reporteeEmail",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "reporteeCompany",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "reporteeTitle",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "reporteeName",
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
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "invoiceAddressee",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "emailAddressToSendInvoice",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "emailForInvoice",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "202012-末締め末払い": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "service",
                    "pattern",
                    "handleForHolidays",
                    "closing",
                    "original",
                    "lag",
                    "early",
                    "effect",
                    "deadline",
                    "cost",
                    "transfer_fee",
                    "説明ページ"
                ],
                "filterCond": "id in (\"103\", \"107\", \"209\", \"211\", \"300\", \"303\", \"304\")",
                "index": "2",
                "name": "202012-末締め末払い",
                "sort": "id asc",
                "type": "LIST"
            },
            "テスト用レコード": {
                "fields": [
                    "レコード番号",
                    "id",
                    "支払元口座",
                    "工務店名",
                    "工務店正式名称",
                    "ceoTitle",
                    "ceo",
                    "営業案件管理",
                    "customerCode",
                    "service",
                    "startMailScheduled",
                    "daysLater",
                    "cost",
                    "transfer_fee",
                    "yield",
                    "tmpcommissionRate",
                    "tmptransferFee",
                    "handleForHolidays",
                    "limit",
                    "applicationLimit",
                    "nextCheckStatus",
                    "creditFacility",
                    "uncollectedAmount",
                    "remainingCreditFacility",
                    "説明ページ",
                    "mail",
                    "closing",
                    "original",
                    "lag",
                    "deadline",
                    "early",
                    "effect",
                    "pattern",
                    "participants",
                    "emailAddressToSendInvoice",
                    "invoiceAddressee"
                ],
                "filterCond": "工務店名 like \"テスト\"",
                "index": "1",
                "name": "テスト用レコード",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧1": {
                "fields": [
                    "支払元口座",
                    "defaultPaymentResponsible",
                    "id",
                    "工務店正式名称",
                    "creditFacility",
                    "uncollectedAmount",
                    "remainingCreditFacility",
                    "closing",
                    "original",
                    "handleForHolidays",
                    "early",
                    "cost",
                    "daysLater",
                    "yield",
                    "transfer_fee",
                    "pattern",
                    "limit",
                    "service",
                    "nextCheckStatus"
                ],
                "filterCond": "工務店名 not like \"テスト\"",
                "index": "0",
                "name": "一覧1",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};