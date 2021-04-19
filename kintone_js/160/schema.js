export const schema_collect = {
    "fields": {
        "properties": {
            "account": {
                "code": "account",
                "defaultValue": "",
                "label": "振込先口座",
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
            "ceo": {
                "code": "ceo",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "代表（人名）",
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
                "label": "代表（役職名）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "closingDate": {
                "code": "closingDate",
                "defaultNowValue": true,
                "defaultValue": "",
                "label": "回収対象の締め日",
                "noLabel": false,
                "required": true,
                "type": "DATE",
                "unique": false
            },
            "cloudSignApplies": {
                "code": "cloudSignApplies",
                "fields": {
                    "applicantOfficialNameCS": {
                        "code": "applicantOfficialNameCS",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "協力会社正式名称",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "applyRecordNoCS": {
                        "code": "applyRecordNoCS",
                        "defaultValue": "",
                        "digit": false,
                        "displayScale": "",
                        "label": "レコード番号",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "",
                        "unitPosition": "BEFORE"
                    },
                    "attachmentFileKeyCS": {
                        "code": "attachmentFileKeyCS",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "請求書ファイルキー",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "invoiceAmountCS": {
                        "code": "invoiceAmountCS",
                        "defaultValue": "",
                        "digit": true,
                        "displayScale": "",
                        "label": "請求書金額",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "円",
                        "unitPosition": "AFTER"
                    },
                    "membershipFeeCS": {
                        "code": "membershipFeeCS",
                        "defaultValue": "",
                        "digit": true,
                        "displayScale": "",
                        "label": "差引額",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "円",
                        "unitPosition": "AFTER"
                    },
                    "paymentDateCS": {
                        "code": "paymentDateCS",
                        "defaultNowValue": false,
                        "defaultValue": "",
                        "label": "支払日",
                        "noLabel": false,
                        "required": false,
                        "type": "DATE",
                        "unique": false
                    },
                    "paymentTimingCS": {
                        "align": "HORIZONTAL",
                        "code": "paymentTimingCS",
                        "defaultValue": "未設定",
                        "label": "支払タイミング",
                        "noLabel": false,
                        "options": {
                            "早払い": {
                                "index": "1",
                                "label": "早払い"
                            },
                            "未設定": {
                                "index": "0",
                                "label": "未設定"
                            },
                            "遅払い": {
                                "index": "2",
                                "label": "遅払い"
                            }
                        },
                        "required": true,
                        "type": "RADIO_BUTTON"
                    },
                    "receivableCS": {
                        "code": "receivableCS",
                        "defaultValue": "",
                        "digit": true,
                        "displayScale": "",
                        "label": "対象債権金額",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "円",
                        "unitPosition": "AFTER"
                    }
                },
                "label": "クラウドサイン対象の申込レコード一覧",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "cloudSignPdf": {
                "code": "cloudSignPdf",
                "label": "債権譲渡承諾書PDFファイル",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "150",
                "type": "FILE"
            },
            "cloudSignSendDate": {
                "code": "cloudSignSendDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "クラウドサイン送信予定日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "cloudSignUrl": {
                "code": "cloudSignUrl",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "クラウドサインURL",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "collectStatus": {
                "code": "collectStatus",
                "defaultValue": "クラウドサイン作成待ち",
                "label": "回収状態",
                "noLabel": false,
                "options": {
                    "クラウドサイン作成待ち": {
                        "index": "0",
                        "label": "クラウドサイン作成待ち"
                    },
                    "クラウドサイン却下・再作成待ち": {
                        "index": "8",
                        "label": "クラウドサイン却下・再作成待ち"
                    },
                    "クラウドサイン回付中": {
                        "index": "2",
                        "label": "クラウドサイン回付中"
                    },
                    "クラウドサイン承認済み": {
                        "index": "3",
                        "label": "クラウドサイン承認済み"
                    },
                    "クラウドサイン発射待ち": {
                        "index": "1",
                        "label": "クラウドサイン発射待ち"
                    },
                    "リマインドメール済み": {
                        "index": "6",
                        "label": "リマインドメール済み"
                    },
                    "回収済み": {
                        "index": "7",
                        "label": "回収済み"
                    },
                    "振込依頼書送信可": {
                        "index": "4",
                        "label": "振込依頼書送信可"
                    },
                    "振込依頼書送信済み": {
                        "index": "5",
                        "label": "振込依頼書送信済み"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "confirmStatusInvoice": {
                "align": "HORIZONTAL",
                "code": "confirmStatusInvoice",
                "defaultValue": [],
                "label": "振込依頼書確認状態",
                "noLabel": false,
                "options": {
                    "確認OK": {
                        "index": "0",
                        "label": "確認OK"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "constructionShopId": {
                "code": "constructionShopId",
                "label": "工務店ID",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "constructionShopName",
                            "relatedField": "工務店正式名称"
                        },
                        {
                            "field": "ceo",
                            "relatedField": "ceo"
                        },
                        {
                            "field": "account",
                            "relatedField": "支払元口座"
                        },
                        {
                            "field": "original",
                            "relatedField": "original"
                        },
                        {
                            "field": "productName",
                            "relatedField": "service"
                        },
                        {
                            "field": "ceoTitle",
                            "relatedField": "ceoTitle"
                        },
                        {
                            "field": "mailToInvest",
                            "relatedField": "mail"
                        },
                        {
                            "field": "customerCode",
                            "relatedField": "customerCode"
                        },
                        {
                            "field": "handleForHolidays",
                            "relatedField": "handleForHolidays"
                        },
                        {
                            "field": "daysLater",
                            "relatedField": "daysLater"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "id",
                        "工務店正式名称"
                    ],
                    "relatedApp": {
                        "app": "96",
                        "code": ""
                    },
                    "relatedKeyField": "id",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT"
            },
            "constructionShopName": {
                "code": "constructionShopName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工務店正式名称",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "customerCode": {
                "code": "customerCode",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "取引企業No",
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
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "遅払い日数",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "日",
                "unitPosition": "AFTER"
            },
            "deadline": {
                "code": "deadline",
                "defaultNowValue": true,
                "defaultValue": "",
                "label": "回収期限",
                "noLabel": false,
                "required": true,
                "type": "DATE",
                "unique": false
            },
            "handleForHolidays": {
                "code": "handleForHolidays",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "休日の取扱",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "invoicePdf": {
                "code": "invoicePdf",
                "label": "振込依頼書PDFファイル",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "150",
                "type": "FILE"
            },
            "invoiceTargets": {
                "code": "invoiceTargets",
                "fields": {
                    "applicantOfficialNameIV": {
                        "code": "applicantOfficialNameIV",
                        "defaultValue": "",
                        "expression": "",
                        "hideExpression": false,
                        "label": "協力会社正式名称",
                        "maxLength": "",
                        "minLength": "",
                        "noLabel": false,
                        "required": false,
                        "type": "SINGLE_LINE_TEXT",
                        "unique": false
                    },
                    "applyRecordNoIV": {
                        "code": "applyRecordNoIV",
                        "defaultValue": "",
                        "digit": false,
                        "displayScale": "",
                        "label": "レコード番号",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "",
                        "unitPosition": "BEFORE"
                    },
                    "paymentDateIV": {
                        "code": "paymentDateIV",
                        "defaultNowValue": false,
                        "defaultValue": "",
                        "label": "支払日",
                        "noLabel": false,
                        "required": false,
                        "type": "DATE",
                        "unique": false
                    },
                    "paymentTimingIV": {
                        "align": "HORIZONTAL",
                        "code": "paymentTimingIV",
                        "defaultValue": "未設定",
                        "label": "支払タイミング",
                        "noLabel": false,
                        "options": {
                            "早払い": {
                                "index": "1",
                                "label": "早払い"
                            },
                            "未設定": {
                                "index": "0",
                                "label": "未設定"
                            },
                            "遅払い": {
                                "index": "2",
                                "label": "遅払い"
                            }
                        },
                        "required": true,
                        "type": "RADIO_BUTTON"
                    },
                    "receivableIV": {
                        "code": "receivableIV",
                        "defaultValue": "",
                        "digit": true,
                        "displayScale": "",
                        "label": "対象債権金額",
                        "maxValue": "",
                        "minValue": "",
                        "noLabel": false,
                        "required": false,
                        "type": "NUMBER",
                        "unique": false,
                        "unit": "円",
                        "unitPosition": "AFTER"
                    }
                },
                "label": "振込依頼書生成対象の申込レコード一覧",
                "noLabel": false,
                "type": "SUBTABLE"
            },
            "mailToInvest": {
                "code": "mailToInvest",
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
            "parentCollectRecord": {
                "align": "HORIZONTAL",
                "code": "parentCollectRecord",
                "defaultValue": [],
                "label": "親レコード",
                "noLabel": false,
                "options": {
                    "true": {
                        "index": "0",
                        "label": "true"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            },
            "productName": {
                "code": "productName",
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
            "scheduledCollectableAmount": {
                "code": "scheduledCollectableAmount",
                "defaultValue": "0",
                "digit": true,
                "displayScale": "",
                "label": "クラウドサイン合計金額",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": true,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "totalBilledAmount": {
                "code": "totalBilledAmount",
                "defaultValue": "",
                "digit": true,
                "displayScale": "",
                "label": "合計請求金額（振込依頼書）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
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
            }
        }
    },
    "id": {
        "appId": "160",
        "name": "LAGLESS2020開発:回収"
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
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "collectStatus",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><span style=\"font-size:14px\">【軽バン.com】中野様に債権譲渡承諾書を回付したい場合&#xff1a;</span></div><div><span style=\"font-size:14px\">1. クラウドサインにログインし、佐藤様へ送信した契約書を取り消す。</span></div><div><span style=\"font-size:14px\">2. 送信先を変更する回収レコードの状態を「クラウドサイン作成待ち」に戻す。</span></div><div><span style=\"font-size:14px\">3. 「債権譲渡クラウドサイン下書きを作成する」ボタンをクリックし、契約書の下書きをもう一度作成する</span></div><div><span style=\"font-size:14px\">4. クラウドサインにログインし、下書き状態の契約書の送信先を編集し、佐藤様を削除して中野様を追加する。</span></div><div><span style=\"font-size:14px\">5. 契約書を送信する。</span></div><div><br /></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "constructionShopId",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "closingDate",
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
                        "code": "constructionShopName",
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
                        "code": "account",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "original",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "daysLater",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "productName",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "mailToInvest",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DATE",
                        "code": "cloudSignSendDate",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "scheduledCollectableAmount",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "cloudSignApplies",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "applyRecordNoCS",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "applicantOfficialNameCS",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "invoiceAmountCS",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "membershipFeeCS",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "receivableCS",
                        "size": {}
                    },
                    {
                        "type": "RADIO_BUTTON",
                        "code": "paymentTimingCS",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "paymentDateCS",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "attachmentFileKeyCS",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "cloudSignUrl",
                        "size": {}
                    },
                    {
                        "type": "FILE",
                        "code": "cloudSignPdf",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "totalBilledAmount",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "deadline",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "handleForHolidays",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CHECK_BOX",
                        "code": "parentCollectRecord",
                        "size": {}
                    }
                ]
            },
            {
                "type": "SUBTABLE",
                "code": "invoiceTargets",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "applyRecordNoIV",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "applicantOfficialNameIV",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "receivableIV",
                        "size": {}
                    },
                    {
                        "type": "RADIO_BUTTON",
                        "code": "paymentTimingIV",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "paymentDateIV",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "FILE",
                        "code": "invoicePdf",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "confirmStatusInvoice",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><span style=\"color:rgb( 255 , 0 , 0 )\">※「確認OK」のチェックをオンにしたあと、</span><br /></div><div><font color=\"#ff0000\">「振込依頼書を送信待ち状態にする」ボタンをクリックすると、</font></div><div><font color=\"#ff0000\">振込依頼書がメールで自動送信される。</font></div><div><font color=\"#ff0000\">FAX送信する場合は、「クラウドサイン承認済み」のままFAX送信し、</font></div><div><font color=\"#ff0000\">その後、子レコードがあれば子レコードも含めて「振込依頼書送信済み」にする。</font></div><div><font color=\"#ff0000\">&#xff08;上記ボタンは使用しない&#xff09;</font></div>",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "クラウドサイン作成待ち": {
                "fields": [
                    "レコード番号",
                    "collectStatus",
                    "constructionShopId",
                    "constructionShopName",
                    "cloudSignSendDate",
                    "cloudSignPdf",
                    "cloudSignUrl",
                    "closingDate",
                    "scheduledCollectableAmount",
                    "cloudSignApplies",
                    "deadline"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン作成待ち\")",
                "index": "2",
                "name": "クラウドサイン作成待ち",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "クラウドサイン回付中": {
                "fields": [
                    "レコード番号",
                    "collectStatus",
                    "constructionShopId",
                    "constructionShopName",
                    "ceoTitle",
                    "ceo",
                    "closingDate",
                    "original",
                    "scheduledCollectableAmount",
                    "deadline",
                    "account",
                    "cloudSignUrl"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン回付中\")",
                "index": "4",
                "name": "クラウドサイン回付中",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "クラウドサイン承認済み": {
                "fields": [
                    "レコード番号",
                    "collectStatus",
                    "constructionShopId",
                    "constructionShopName",
                    "deadline",
                    "productName",
                    "scheduledCollectableAmount"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン承認済み\")",
                "index": "5",
                "name": "クラウドサイン承認済み",
                "sort": "collectStatus asc, constructionShopId asc, deadline asc, レコード番号 asc",
                "type": "LIST"
            },
            "クラウドサイン発射待ち": {
                "fields": [
                    "レコード番号",
                    "collectStatus",
                    "constructionShopId",
                    "constructionShopName",
                    "cloudSignSendDate",
                    "cloudSignPdf",
                    "cloudSignUrl",
                    "closingDate",
                    "scheduledCollectableAmount",
                    "cloudSignApplies",
                    "deadline"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン発射待ち\")",
                "index": "3",
                "name": "クラウドサイン発射待ち",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧": {
                "fields": [
                    "レコード番号",
                    "account",
                    "productName",
                    "closingDate",
                    "constructionShopName",
                    "collectStatus",
                    "confirmStatusInvoice",
                    "deadline",
                    "handleForHolidays",
                    "original",
                    "totalBilledAmount",
                    "scheduledCollectableAmount",
                    "cloudSignUrl",
                    "cloudSignSendDate",
                    "parentCollectRecord",
                    "invoicePdf",
                    "cloudSignPdf",
                    "invoiceTargets"
                ],
                "filterCond": "",
                "index": "0",
                "name": "一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧（取下げ以外）": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "account",
                    "productName",
                    "closingDate",
                    "constructionShopName",
                    "collectStatus",
                    "confirmStatusInvoice",
                    "deadline",
                    "handleForHolidays",
                    "original",
                    "totalBilledAmount",
                    "scheduledCollectableAmount",
                    "cloudSignUrl",
                    "cloudSignSendDate",
                    "invoicePdf",
                    "cloudSignPdf",
                    "invoiceTargets"
                ],
                "filterCond": "collectStatus not in (\"クラウドサイン却下・再作成待ち\")",
                "index": "1",
                "name": "一覧（取下げ以外）",
                "sort": "deadline desc",
                "type": "LIST"
            },
            "振込依頼書作成": {
                "fields": [
                    "レコード番号",
                    "parentCollectRecord",
                    "collectStatus",
                    "invoicePdf",
                    "confirmStatusInvoice",
                    "constructionShopId",
                    "constructionShopName",
                    "ceoTitle",
                    "ceo",
                    "handleForHolidays",
                    "productName",
                    "totalBilledAmount",
                    "account",
                    "deadline",
                    "closingDate",
                    "original"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン承認済み\")",
                "index": "7",
                "name": "振込依頼書作成",
                "sort": "deadline asc, constructionShopId desc",
                "type": "LIST"
            },
            "振込依頼書送信状況": {
                "fields": [
                    "レコード番号",
                    "parentCollectRecord",
                    "collectStatus",
                    "invoicePdf",
                    "confirmStatusInvoice",
                    "constructionShopId",
                    "constructionShopName",
                    "ceoTitle",
                    "ceo",
                    "productName",
                    "totalBilledAmount",
                    "account",
                    "deadline",
                    "closingDate",
                    "original"
                ],
                "filterCond": "collectStatus in (\"振込依頼書送信可\", \"振込依頼書送信済み\") and parentCollectRecord in (\"true\")",
                "index": "8",
                "name": "振込依頼書送信状況",
                "sort": "deadline asc, constructionShopId desc",
                "type": "LIST"
            },
            "支払い実行": {
                "fields": [
                    "レコード番号",
                    "collectStatus",
                    "productName",
                    "scheduledCollectableAmount"
                ],
                "filterCond": "collectStatus in (\"クラウドサイン承認済み\")",
                "index": "6",
                "name": "支払い実行",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "未回収一覧": {
                "fields": [
                    "レコード番号",
                    "constructionShopId",
                    "constructionShopName",
                    "collectStatus",
                    "account",
                    "scheduledCollectableAmount",
                    "closingDate",
                    "deadline",
                    "original",
                    "cloudSignUrl",
                    "productName",
                    "ceoTitle",
                    "ceo",
                    "mailToInvest",
                    "customerCode"
                ],
                "filterCond": "collectStatus in (\"支払実行済み\")",
                "index": "9",
                "name": "未回収一覧",
                "sort": "deadline asc",
                "type": "LIST"
            }
        }
    }
};
