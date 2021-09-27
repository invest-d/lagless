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
            "businessDealsNumber_old": {
                "code": "businessDealsNumber_old",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "営業案件管理(過去の記録用)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
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
                "label": "役職名",
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
                "required": true,
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
                "unit": "",
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
                "required": true,
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
                    "ID": {
                        "index": "1",
                        "label": "ID"
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
                "required": true,
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
                    "未確認": {
                        "index": "2",
                        "label": "未確認"
                    },
                    "翌営業日": {
                        "index": "1",
                        "label": "翌営業日"
                    }
                },
                "required": true,
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
                "required": false,
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
                "label": "年間回数制限",
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
            "monthResetCount": {
                "code": "monthResetCount",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "0",
                "label": "申込回数リセット月",
                "maxValue": "12",
                "minValue": "0",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "月",
                "unitPosition": "AFTER"
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
                "required": true,
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
                "label": "商品名",
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
                "unit": "",
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
                    "filterCond": "deadline >= FROM_TODAY(-2, MONTHS)",
                    "relatedApp": {
                        "app": "95",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "deadline asc"
                },
                "type": "REFERENCE_TABLE"
            },
            "スタートメール要否": {
                "align": "HORIZONTAL",
                "code": "スタートメール要否",
                "defaultValue": [],
                "label": "スタートメール要否",
                "noLabel": false,
                "options": {
                    "不要": {
                        "index": "1",
                        "label": "不要"
                    },
                    "要": {
                        "index": "0",
                        "label": "要"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
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
            "工務店名": {
                "code": "工務店名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工務店名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
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
                "required": true,
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
                        "type": "LABEL",
                        "label": "<div>工務店ID</div><div><div><span style=\"font-size:14px\">100番台&#xff1a;ダンドリペイメント</span></div><div><span style=\"font-size:14px\">200番台&#xff1a;ラグレス</span></div><div><span style=\"font-size:14px\">300番台&#xff1a;リノベ不動産Payment</span></div><div><span style=\"font-size:14px\">400番台&#xff1a;WFI</span></div><div><span style=\"font-size:14px\">500番台&#xff1a;GIG</span></div><div><span style=\"font-size:14px\">601番　&#xff1a;MED</span></div></div><div>603番　&#xff1a;MED西日本<br /></div>",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>【マーケチームにて下記の項目を入力お願いします】<div>・工務店名</div><div>・支払元口座&#xff08;ラグレスGK案件→LAGLESS、インベスト→ID&#xff09;</div><div>・通常支払いの担当&#xff08;工務店 or ID&#xff09;</div><div>・早期支払手数料</div><div>・締日、通常の支払日、早期支払日</div><div>・休日の取扱</div><div>・スタートメール要否</div><div>・クラウドサイン回付者一覧</div><div>&#xff08;・クラウドサイン共有先一覧&#xff09;</div><div>・振込依頼書送付メール本文上の宛先&#xff08;役職&#xff0b;氏名&#xff09;</div><div>・振込依頼書送信先一覧<br /></div></div>",
                        "size": {}
                    }
                ]
            },
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
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "支払元口座",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>【支払元口座の補足】</div><div>ID　　　    →　ラグレス&#xff12;GK、インベスト案件</div><div>LAGLESS　→　ラグレスGK案件</div>",
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
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "service",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
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
                        "code": "monthResetCount",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>リセット月が「0」もしくは空欄→カウント日の直近1年間が対象<div>リセット月が「1〜12のどれか」→その月になったらカウントをリセット</div><div><br /></div><div>例&#xff1a;リセット月「2」の場合→2月から翌年1月がカウント対象期間。2月時め請求書のぶんからまたカウント回数がゼロになる</div></div>",
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
                        "type": "LABEL",
                        "label": "<div><br /></div><div>←記載例&#xff09;275円&#xff08;税込&#xff09;</div><div><br /></div>",
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
                        "type": "LABEL",
                        "label": "<div>　　</div><div><b>　旧案内ページに反映する項目→</b><div><b>&#xff08;新案内ページには影響なし&#xff09;</b></div></div>",
                        "size": {}
                    },
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
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font color=\"#ff0000\">↓新説明ページに反映されるため入力必須&#xff08;※通常支払日は営業日を入力&#xff09;</font></b></div>",
                        "size": {}
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
                        "type": "CHECK_BOX",
                        "code": "スタートメール要否",
                        "size": {}
                    },
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
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "businessDealsNumber_old",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>←営業案件管理フィールドが必須だった時の入力値を保存しておくためのもの。<div>現在新規に作成するレコードでは空欄でOK</div></div>",
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
                "index": "3",
                "name": "202012-末締め末払い",
                "sort": "id asc",
                "type": "LIST"
            },
            "★ラグレスGK案件": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "startMailScheduled",
                    "daysLater",
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
                "filterCond": "id in (\"200\", \"206\", \"207\", \"106\", \"210\", \"601\", \"603\")",
                "index": "8",
                "name": "★ラグレスGK案件",
                "sort": "id asc",
                "type": "LIST"
            },
            "★新ラグレス契約先（2021.05.10時点）": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "startMailScheduled",
                    "daysLater",
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
                    "説明ページ",
                    "default_pay_date_list"
                ],
                "filterCond": "id in (\"107\", \"303\", \"209\", \"211\", \"201\", \"202\", \"203\", \"300\", \"215\", \"304\", \"204\", \"105\", \"212\", \"222\", \"217\", \"218\", \"214\", \"219\", \"220\", \"221\", \"223\")",
                "index": "5",
                "name": "★新ラグレス契約先（2021.05.10時点）",
                "sort": "id asc",
                "type": "LIST"
            },
            "★旧ラグレス契約先（ラグレスGK案件は除外）": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "startMailScheduled",
                    "daysLater",
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
                    "説明ページ",
                    "default_pay_date_list"
                ],
                "filterCond": "id in (\"101\", \"102\", \"104\")",
                "index": "7",
                "name": "★旧ラグレス契約先（ラグレスGK案件は除外）",
                "sort": "id asc",
                "type": "LIST"
            },
            "★通常支払＆新ラグレス先（2021.01.15時点）": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "startMailScheduled",
                    "daysLater",
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
                    "説明ページ",
                    "default_pay_date_list"
                ],
                "filterCond": "id in (\"213\", \"100\", \"216\")",
                "index": "6",
                "name": "★通常支払＆新ラグレス先（2021.01.15時点）",
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
                "index": "2",
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
                    "pattern",
                    "closing",
                    "original",
                    "handleForHolidays",
                    "early",
                    "cost",
                    "creditFacility",
                    "uncollectedAmount",
                    "remainingCreditFacility",
                    "daysLater",
                    "yield",
                    "limit",
                    "service",
                    "nextCheckStatus"
                ],
                "filterCond": "工務店名 not like \"テスト\"",
                "index": "0",
                "name": "一覧1",
                "sort": "id asc",
                "type": "LIST"
            },
            "一覧（支払パターン）": {
                "fields": [
                    "支払元口座",
                    "defaultPaymentResponsible",
                    "id",
                    "工務店正式名称",
                    "handleForHolidays",
                    "pattern",
                    "closing",
                    "original",
                    "early",
                    "daysLater",
                    "service"
                ],
                "filterCond": "工務店名 not like \"テスト\"",
                "index": "1",
                "name": "一覧（支払パターン）",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "末締め当月末支払い承諾先一覧": {
                "fields": [
                    "id",
                    "工務店正式名称",
                    "startMailScheduled",
                    "daysLater",
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
                    "説明ページ",
                    "default_pay_date_list"
                ],
                "filterCond": "id in (\"201\", \"206\", \"303\", \"209\", \"210\", \"214\", \"216\", \"220\", \"108\")",
                "index": "4",
                "name": "末締め当月末支払い承諾先一覧",
                "sort": "id asc",
                "type": "LIST"
            }
        }
    }
};
