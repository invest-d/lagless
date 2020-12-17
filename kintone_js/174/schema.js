export const schema_174 = {
    "fields": {
        "properties": {
            "approvalDate": {
                "code": "approvalDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "承認日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "bank": {
                "code": "bank",
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
            "bankAccountName": {
                "code": "bankAccountName",
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
            "bankAccountNumber": {
                "code": "bankAccountNumber",
                "defaultValue": "",
                "digit": false,
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
            "closingDate": {
                "code": "closingDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "締め日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "constructionBillTaxDetail": {
                "code": "constructionBillTaxDetail",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "消費税(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionBillTaxExclDetail": {
                "code": "constructionBillTaxExclDetail",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "請求額(税抜)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionBillTaxInclDetail": {
                "code": "constructionBillTaxInclDetail",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "請求額(税込)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionBillTaxInclSum": {
                "code": "constructionBillTaxInclSum",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "合計(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionClientName": {
                "code": "constructionClientName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "お客様名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "constructionCompleteDate": {
                "code": "constructionCompleteDate",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工事完了日",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "constructionID": {
                "code": "constructionID",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "工事番号",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionName": {
                "code": "constructionName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "工事名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "constructionSiteID": {
                "code": "constructionSiteID",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "現場ID",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "constructionSiteName": {
                "code": "constructionSiteName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "現場名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "contractNumber": {
                "code": "contractNumber",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "契約番号",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "invoiceDate": {
                "code": "invoiceDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "発行日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "invoiceID": {
                "code": "invoiceID",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "請求ID(請求No.)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "kyoryokuAddress": {
                "code": "kyoryokuAddress",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "協力会社住所",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kyoryokuContactName": {
                "code": "kyoryokuContactName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "担当者名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kyoryokuID": {
                "code": "kyoryokuID",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "協力会社ID",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "kyoryokuName": {
                "code": "kyoryokuName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "協力会社名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kyoryokuPhone": {
                "code": "kyoryokuPhone",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "協力会社電話番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kyoryokuPostalCode": {
                "code": "kyoryokuPostalCode",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "協力会社郵便番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "memberShipFeeDetail": {
                "code": "memberShipFeeDetail",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "協力会費(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "memberShipFeeSum": {
                "code": "memberShipFeeSum",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "協力会費 合計(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "paymentDate": {
                "code": "paymentDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "支払期日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "placeCode": {
                "code": "placeCode",
                "defaultValue": "",
                "label": "プレイスコード",
                "noLabel": false,
                "options": {
                    "relite": {
                        "index": "0",
                        "label": "relite"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "placeName": {
                "code": "placeName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "プレイス名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "receivableAmountDetail": {
                "code": "receivableAmountDetail",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "振込支払額(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "receivableAmountSum": {
                "code": "receivableAmountSum",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "振込支払額 合計(円)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "salesOfficeName": {
                "code": "salesOfficeName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "営業所名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "status": {
                "code": "status",
                "defaultValue": "未処理",
                "label": "状態",
                "noLabel": false,
                "options": {
                    "エラー": {
                        "index": "3",
                        "label": "エラー"
                    },
                    "データ作成不要": {
                        "index": "2",
                        "label": "データ作成不要"
                    },
                    "未処理": {
                        "index": "0",
                        "label": "未処理"
                    },
                    "通常払いレコード作成済み": {
                        "index": "1",
                        "label": "通常払いレコード作成済み"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
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
        "appId": "174",
        "name": "ダンドリワーク請求データ"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "status",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DROP_DOWN",
                        "code": "placeCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "placeName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "invoiceID",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "kyoryokuID",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuPostalCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuAddress",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuPhone",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuContactName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "constructionSiteID",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "constructionSiteName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "constructionClientName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "constructionID",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "constructionName",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "constructionCompleteDate",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "constructionBillTaxExclDetail",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "constructionBillTaxDetail",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "constructionBillTaxInclDetail",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "memberShipFeeDetail",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "receivableAmountDetail",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "constructionBillTaxInclSum",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "memberShipFeeSum",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "receivableAmountSum",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DATE",
                        "code": "closingDate",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "invoiceDate",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "approvalDate",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "paymentDate",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bank",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "bankAccountNumber",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bankAccountName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "contractNumber",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "salesOfficeName",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "支払期日が今月": {
                "fields": [
                    "レコード番号",
                    "status",
                    "invoiceID",
                    "closingDate",
                    "approvalDate",
                    "paymentDate",
                    "kyoryokuName",
                    "constructionID",
                    "constructionName",
                    "constructionBillTaxInclDetail",
                    "memberShipFeeDetail",
                    "receivableAmountDetail",
                    "memberShipFeeSum",
                    "receivableAmountSum"
                ],
                "filterCond": "paymentDate = THIS_MONTH()",
                "index": "0",
                "name": "支払期日が今月",
                "sort": "invoiceID desc",
                "type": "LIST"
            }
        }
    }
};
