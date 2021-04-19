export const schema_apply = {
    "fields": {
        "properties": {
            "accountName": {
                "code": "accountName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座名義（英数カナ等）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "accountName_Form": {
                "code": "accountName_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座名義(申込フォーム)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "accountNumber": {
                "code": "accountNumber",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "accountNumber_Form": {
                "code": "accountNumber_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "口座番号(申込フォーム)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "address": {
                "code": "address",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "住所",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "applicationAmount": {
                "code": "applicationAmount",
                "defaultValue": "",
                "digit": true,
                "displayScale": "",
                "label": "申込金額",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": true,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "bankCode": {
                "code": "bankCode",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関コード",
                "maxLength": "4",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "bankCode_Form": {
                "code": "bankCode_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関コード（フォーム）",
                "maxLength": "4",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "bankName": {
                "code": "bankName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "bankName_Form": {
                "code": "bankName_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関名(申込フォーム)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "billingCompany": {
                "code": "billingCompany",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "発注企業名（フォーム）",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "billingCompanyOfficialName": {
                "code": "billingCompanyOfficialName",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "発注企業名正式名称",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "branchCode": {
                "code": "branchCode",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支店コード",
                "maxLength": "3",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "branchCode_Form": {
                "code": "branchCode_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支店コード(申込フォーム)",
                "maxLength": "3",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "branchName": {
                "code": "branchName",
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
            "branchName_Form": {
                "code": "branchName_Form",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支店名(申込フォーム)",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "closingDay": {
                "code": "closingDay",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "請求書の締日",
                "noLabel": false,
                "required": true,
                "type": "DATE",
                "unique": false
            },
            "collectId": {
                "code": "collectId",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "回収ID(ボタンで入力)",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "commissionAmount": {
                "code": "commissionAmount",
                "displayScale": "",
                "expression": "ROUNDDOWN(totalReceivables*commissionRate, 0)",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "早払いサービス手数料",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "commissionAmountEarlyFirst": {
                "code": "commissionAmountEarlyFirst",
                "displayScale": "",
                "expression": "ROUNDDOWN(totalReceivables* commissionRateEarlyFirst, 0)",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "早払いサービス手数料（初回割引適用時）",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "commissionAmount_late": {
                "code": "commissionAmount_late",
                "displayScale": "",
                "expression": "ROUNDDOWN(totalReceivables*commissionRate_late, 0)",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "遅払いサービス手数料",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "commissionRate": {
                "code": "commissionRate",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "早払い手数料割合（計算用）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "commissionRateEarlyFirst": {
                "code": "commissionRateEarlyFirst",
                "displayScale": "5",
                "expression": "commissionRate/2",
                "format": "NUMBER",
                "hideExpression": false,
                "label": "早払いサービス手数料割合（初回割引適用時）",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "commissionRate_late": {
                "code": "commissionRate_late",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "遅払い手数料割合（計算用）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "company": {
                "code": "company",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "協力会社名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "constructionShopId": {
                "code": "constructionShopId",
                "label": "工務店ID",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "paymentAccount",
                            "relatedField": "支払元口座"
                        },
                        {
                            "field": "productName",
                            "relatedField": "service"
                        },
                        {
                            "field": "commissionRate",
                            "relatedField": "tmpcommissionRate"
                        },
                        {
                            "field": "transferFeeTaxExcl",
                            "relatedField": "tmptransferFee"
                        },
                        {
                            "field": "customerCode",
                            "relatedField": "customerCode"
                        },
                        {
                            "field": "billingCompanyOfficialName",
                            "relatedField": "工務店正式名称"
                        },
                        {
                            "field": "commissionRate_late",
                            "relatedField": "commissionRate_late"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "工務店名",
                        "支払元口座"
                    ],
                    "relatedApp": {
                        "app": "96",
                        "code": ""
                    },
                    "relatedKeyField": "id",
                    "sort": "id asc"
                },
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT"
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
            "dandoriID": {
                "code": "dandoriID",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "ダンドリワークID",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "deposit": {
                "align": "HORIZONTAL",
                "code": "deposit",
                "defaultValue": "普通",
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
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "deposit_Form": {
                "align": "HORIZONTAL",
                "code": "deposit_Form",
                "defaultValue": "普通",
                "label": "預金種目（フォーム）",
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
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "detailSendDateTime": {
                "code": "detailSendDateTime",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "支払明細書送信日時",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "driverLicenseBack": {
                "code": "driverLicenseBack",
                "label": "運転免許証裏",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "150",
                "type": "FILE"
            },
            "driverLicenseFront": {
                "code": "driverLicenseFront",
                "label": "運転免許証表",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "150",
                "type": "FILE"
            },
            "factorableAmountPerDayWFI": {
                "code": "factorableAmountPerDayWFI",
                "displayScale": "",
                "expression": "IF(monthsWorkedKeban<4, 3000, 5000)",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "稼働日1日あたりの前払い可能金額",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "factorableTotalAmountWFI": {
                "code": "factorableTotalAmountWFI",
                "displayScale": "",
                "expression": "factorableAmountPerDayWFI*workedDaysWFI",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "前払対象金額",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "invoice": {
                "code": "invoice",
                "label": "請求書データの添付",
                "noLabel": false,
                "required": false,
                "thumbnailSize": "250",
                "type": "FILE"
            },
            "kebanID": {
                "code": "kebanID",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "軽バン.comドライバーID",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kebanStartDate": {
                "code": "kebanStartDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "ドライバー稼働開始日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "mail": {
                "code": "mail",
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
            "membership_fee": {
                "code": "membership_fee",
                "defaultValue": "0",
                "digit": true,
                "displayScale": "",
                "label": "会費等の差引額",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": true,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "monthsWorkedKeban": {
                "code": "monthsWorkedKeban",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "",
                "label": "稼働開始日からの経過月数",
                "maxValue": "",
                "minValue": "0",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "ヶ月",
                "unitPosition": "AFTER"
            },
            "ordererGig": {
                "code": "ordererGig",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "（GIG専用）発注企業名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "paymentAccount": {
                "code": "paymentAccount",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支払元口座",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "paymentDate": {
                "code": "paymentDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "支払日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "paymentDetail": {
                "code": "paymentDetail",
                "defaultValue": "",
                "label": "支払予定明細書本文",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "paymentTiming": {
                "align": "HORIZONTAL",
                "code": "paymentTiming",
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
                    "通常払い": {
                        "index": "2",
                        "label": "通常払い"
                    },
                    "遅払い": {
                        "index": "3",
                        "label": "遅払い"
                    }
                },
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "phone": {
                "code": "phone",
                "defaultValue": "",
                "label": "電話番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "CALL",
                "required": true,
                "type": "LINK",
                "unique": false
            },
            "postalCode": {
                "code": "postalCode",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "郵便番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "prefecture": {
                "code": "prefecture",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "都道府県",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
            "representative": {
                "code": "representative",
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
            "streetAddress": {
                "code": "streetAddress",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "番地・建物名・部屋番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "totalReceivables": {
                "code": "totalReceivables",
                "displayScale": "0",
                "expression": "applicationAmount - membership_fee",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "対象債権合計金額",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transferAmount": {
                "code": "transferAmount",
                "displayScale": "",
                "expression": "totalReceivables - commissionAmount - transferFeeTaxIncl",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "早払い時の振込金額",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transferAmountEarlyFirst": {
                "code": "transferAmountEarlyFirst",
                "displayScale": "",
                "expression": "totalReceivables - commissionAmountEarlyFirst - transferFeeTaxIncl",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "早払い時の振込金額（初回割引適用時）",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transferAmount_late": {
                "code": "transferAmount_late",
                "displayScale": "",
                "expression": "totalReceivables + commissionAmount_late - transferFeeTaxIncl",
                "format": "NUMBER_DIGIT",
                "hideExpression": false,
                "label": "遅払い時の振込金額",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transferFeeTaxExcl": {
                "code": "transferFeeTaxExcl",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "税別振込手数料（計算用）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "transferFeeTaxIncl": {
                "code": "transferFeeTaxIncl",
                "displayScale": "",
                "expression": "ROUNDDOWN(transferFeeTaxExcl*1.10, 0)",
                "format": "NUMBER",
                "hideExpression": false,
                "label": "税込振込手数料",
                "noLabel": false,
                "required": false,
                "type": "CALC",
                "unit": "円",
                "unitPosition": "AFTER"
            },
            "workedDaysWFI": {
                "code": "workedDaysWFI",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "",
                "label": "稼働期間の稼働日数",
                "maxValue": "",
                "minValue": "0",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "日",
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
            "ルックアップ": {
                "code": "ルックアップ",
                "label": "協力会社ID",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "bankCode",
                            "relatedField": "金融機関コード"
                        },
                        {
                            "field": "bankName",
                            "relatedField": "銀行名"
                        },
                        {
                            "field": "branchCode",
                            "relatedField": "支店コード"
                        },
                        {
                            "field": "branchName",
                            "relatedField": "支店名"
                        },
                        {
                            "field": "deposit",
                            "relatedField": "預金種目"
                        },
                        {
                            "field": "accountNumber",
                            "relatedField": "口座番号"
                        },
                        {
                            "field": "accountName",
                            "relatedField": "口座名義"
                        },
                        {
                            "field": "支払先正式名称",
                            "relatedField": "支払先正式名称"
                        },
                        {
                            "field": "担当者名",
                            "relatedField": "担当者名"
                        },
                        {
                            "field": "役職名",
                            "relatedField": "役職名"
                        },
                        {
                            "field": "kebanID",
                            "relatedField": "kebanID"
                        },
                        {
                            "field": "kebanStartDate",
                            "relatedField": "kebanStartDate"
                        },
                        {
                            "field": "dandoriID",
                            "relatedField": "dandoriID"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "支払企業No_",
                        "支払先正式名称"
                    ],
                    "relatedApp": {
                        "app": "88",
                        "code": ""
                    },
                    "relatedKeyField": "支払企業No_",
                    "sort": "レコード番号 desc"
                },
                "noLabel": false,
                "required": false,
                "type": "NUMBER"
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
            "備考１": {
                "code": "備考１",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "備考１　※申込内容に不備がある場合など、 備考欄に記載",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "備考２": {
                "code": "備考２",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "備考２",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "審査レコード番号": {
                "code": "審査レコード番号",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "審査レコード番号",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "役職名": {
                "code": "役職名",
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
            "担当者名": {
                "code": "担当者名",
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
            "支払先正式名称": {
                "code": "支払先正式名称",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支払先正式名称",
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
            "状態": {
                "code": "状態",
                "defaultValue": "未処理",
                "label": "状態",
                "noLabel": false,
                "options": {
                    "ID確認済": {
                        "index": "1",
                        "label": "ID確認済"
                    },
                    "保留中": {
                        "index": "12",
                        "label": "保留中"
                    },
                    "債権譲渡登記取得待ち": {
                        "index": "7",
                        "label": "債権譲渡登記取得待ち"
                    },
                    "取下げ": {
                        "index": "13",
                        "label": "取下げ"
                    },
                    "実行完了": {
                        "index": "11",
                        "label": "実行完了"
                    },
                    "工務店確認済": {
                        "index": "2",
                        "label": "工務店確認済"
                    },
                    "振込データ出力済": {
                        "index": "10",
                        "label": "振込データ出力済"
                    },
                    "振込前確認完了": {
                        "index": "9",
                        "label": "振込前確認完了"
                    },
                    "支払予定明細FAX送信待ち": {
                        "index": "3",
                        "label": "支払予定明細FAX送信待ち"
                    },
                    "支払予定明細確認中": {
                        "index": "4",
                        "label": "支払予定明細確認中"
                    },
                    "支払予定明細送付済": {
                        "index": "6",
                        "label": "支払予定明細送付済"
                    },
                    "支払予定明細送信前確認完了": {
                        "index": "5",
                        "label": "支払予定明細送信前確認完了"
                    },
                    "未処理": {
                        "index": "0",
                        "label": "未処理"
                    },
                    "通常払い確認待ち": {
                        "index": "8",
                        "label": "通常払い確認待ち"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "登記の取得": {
                "align": "HORIZONTAL",
                "code": "登記の取得",
                "defaultValue": [],
                "label": "債権譲渡登記",
                "noLabel": false,
                "options": {
                    "取得要": {
                        "index": "0",
                        "label": "取得要"
                    }
                },
                "required": false,
                "type": "CHECK_BOX"
            }
        }
    },
    "id": {
        "appId": "161",
        "name": "LAGLESS2020本番:申込"
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
                        "type": "DROP_DOWN",
                        "code": "状態",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "審査レコード番号",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "spaceWarningLabel",
                        "size": {}
                    },
                    {
                        "type": "CREATED_TIME",
                        "code": "作成日時",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "paymentTiming",
                        "size": {}
                    },
                    {
                        "type": "CHECK_BOX",
                        "code": "登記の取得",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font color=\"#ff0000\">※債権合計金額が100万円以上の法人の場合、</font></div><div><font color=\"#ff0000\">　債権譲渡登記の取得が必要</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">■対象債権</font></b>----------------------------------------------------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "applicationAmount",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "membership_fee",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "totalReceivables",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>【確認事項】<br /></div><div><div>・申込金額&#xff1d;請求書の合計金額</div><div>・請求書の締日</div><div>・口座情報　<font color=\"#ff0000\">※新規先は協力会社マスタに登録要</font></div><div>・反社チェック<br /></div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "FILE",
                        "code": "invoice",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "closingDay",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "paymentDate",
                        "size": {}
                    },
                    {
                        "type": "SPACER",
                        "elementId": "",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>【入力事項】<br /></div><div>・登記取得の要否<br /></div><div>・会費等の差引額&#xff08;工務店マスタ→営業案件&#xff09;<br /></div><div>・支払日&#xff08;工務店マスタ&#xff09;<br /></div><div><div>・協力会社ID　※回数制限を確認</div><div>・協力会社マスタに取引企業管理No.を登録<br /></div><div><br /></div></div><div>※振込金額確認後「状態&#xff1a;ID確認済」に変更し、</div><div>「支払明細書一括作成」ボタンを押すと、自動でメール送信される。<br /></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "備考１",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>※FAX先の場合、FAX送付後「状態&#xff1a;支払予定明細送付済」<div>に変更する。</div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">■申込者の属性情報&#xff08;申込フォーム入力項目&#xff09;</font></b>--------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "company",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "billingCompany",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "mail",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "phone",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bankName_Form",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "branchName_Form",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bankCode_Form",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "branchCode_Form",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "deposit_Form",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "accountNumber_Form",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "accountName_Form",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "postalCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "prefecture",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "address",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "streetAddress",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "representative",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "FILE",
                        "code": "driverLicenseFront",
                        "size": {}
                    },
                    {
                        "type": "FILE",
                        "code": "driverLicenseBack",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "備考２",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font size=\"4\">■発注企業情報</font></b>-------------------------------------------------------------------------------------------------------------------------------------------------------------------</div>",
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
                        "type": "NUMBER",
                        "code": "customerCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "billingCompanyOfficialName",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "productName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "commissionRate",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "commissionRate_late",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "transferFeeTaxExcl",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "paymentAccount",
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
                        "type": "SINGLE_LINE_TEXT",
                        "code": "ordererGig",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>↓協力会社ルックアップ───────────────────────────────────────</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "ルックアップ",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支払先正式名称",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "役職名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "担当者名",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bankCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "bankName",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "branchCode",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "branchName",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>【協力会社をルックアップしても銀行情報が入らないとき】<div>→新規先。&#xff08;申込フォーム&#xff09;の各口座情報を協力会社マスタに転記して保存する。</div><div>→もう一度ルックアップする</div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "deposit",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "accountNumber",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "accountName",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>↓工務店ごとに特有のフィールド↓</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "dandoriID",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kebanID",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "kebanStartDate",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>↑協力会社ルックアップ───────────────────────────────────────</div>",
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
                        "label": "<div><span style=\"font-weight:700\"><font size=\"4\">■レコード作成時に自動計算</font></span>----------------------------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>支払明細や振込データの作成時にこのフィールドから取得する</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CALC",
                        "code": "transferFeeTaxIncl",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CALC",
                        "code": "commissionAmount",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "transferAmount",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "commissionRateEarlyFirst",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "commissionAmountEarlyFirst",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "transferAmountEarlyFirst",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CALC",
                        "code": "commissionAmount_late",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "transferAmount_late",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><span style=\"font-weight:700\"><font size=\"4\">■支払明細書送信時に自動入力</font></span>----------------------------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font color=\"#cc0000\">金額・日付の修正は手動で行わないでください。</font></b><div><font color=\"#cc0000\"><b>それらを修正する必要がある場合、まずは本文をCtrl&#43;Aで全て選択して削除します。</b></font></div><div><font color=\"#cc0000\"><b>その後、フォーム上部の金額・日付</b></font><b style=\"color:rgb( 204 , 0 , 0 )\">フィールドの値を修正してレコードを保存してから、支払予定明細書を再作成してください。</b></div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "paymentDetail",
                        "size": {
                            "innerHeight": "336"
                        }
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "DATETIME",
                        "code": "detailSendDateTime",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><span style=\"font-weight:700\"><font size=\"4\">■クラウドサイン処理開始時に自動入力</font></span>-------------------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "collectId",
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
                        "label": "<div>軽バン.com用フィールド</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>経過月数は次のように計算する&#xff08;kintoneの機能では計算不可能なので、エクセルで計算してからインポート&#xff09;</div><div>①【前払を申し込んだ月の1日】と【ドライバーが稼働開始した月の1日】の間の月数……Xヶ月とする</div><div>②ドライバーが稼働開始した日付が1日〜14日だった場合→Xヶ月を経過月数とする</div><div>③ドライバーが稼働開始した日付が15日〜31日だった場合→&#xff08;X-1&#xff09;ヶ月を経過月数とする</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>稼働日数はWFI様に問い合わせて記入する</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "monthsWorkedKeban",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "CALC",
                        "code": "factorableAmountPerDayWFI",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>✖️</div>",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "workedDaysWFI",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>&#xff1d;</div>",
                        "size": {}
                    },
                    {
                        "type": "CALC",
                        "code": "factorableTotalAmountWFI",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>回収レコード作成時、申込金額フィールドが0円のままになっている場合は、前払対象金額フィールドを申込金額フィールドへ自動で転記してから処理します</div>",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "WFIドライバー一覧作成用": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "状態",
                    "ルックアップ",
                    "company",
                    "kebanID",
                    "representative",
                    "kebanStartDate",
                    "workedDaysWFI",
                    "monthsWorkedKeban",
                    "applicationAmount"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 in (\"\", \"未処理\", \"ID確認済\", \"工務店確認済\", \"支払予定明細FAX送信待ち\", \"支払予定明細確認中\", \"支払予定明細送信前確認完了\", \"支払予定明細送付済\", \"債権譲渡登記取得待ち\", \"通常払い確認待ち\", \"振込前確認完了\", \"振込データ出力済\", \"保留中\") and constructionShopId in (\"400\", \"401\", \"402\", \"403\", \"404\")",
                "index": "10",
                "name": "WFIドライバー一覧作成用",
                "sort": "paymentDate desc",
                "type": "LIST"
            },
            "WFI一覧（実行完了・取下げ以外）": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "状態",
                    "closingDay",
                    "ルックアップ",
                    "company",
                    "transferAmount",
                    "kebanID",
                    "representative",
                    "kebanStartDate",
                    "applicationAmount",
                    "bankName_Form",
                    "branchName_Form",
                    "deposit_Form",
                    "accountNumber_Form",
                    "accountName_Form",
                    "driverLicenseFront",
                    "driverLicenseBack",
                    "bankName",
                    "branchName",
                    "deposit",
                    "accountNumber",
                    "accountName"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 in (\"\", \"未処理\", \"ID確認済\", \"工務店確認済\", \"支払予定明細FAX送信待ち\", \"支払予定明細確認中\", \"支払予定明細送信前確認完了\", \"支払予定明細送付済\", \"債権譲渡登記取得待ち\", \"通常払い確認待ち\", \"振込前確認完了\", \"振込データ出力済\", \"保留中\") and constructionShopId in (\"400\", \"401\", \"402\", \"403\", \"404\")",
                "index": "12",
                "name": "WFI一覧（実行完了・取下げ以外）",
                "sort": "paymentDate desc",
                "type": "LIST"
            },
            "WFI一覧（実行完了以外）": {
                "fields": [
                    "レコード番号",
                    "作成日時",
                    "状態",
                    "closingDay",
                    "ルックアップ",
                    "company",
                    "kebanID",
                    "representative",
                    "kebanStartDate",
                    "workedDaysWFI",
                    "monthsWorkedKeban",
                    "applicationAmount"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 in (\"\", \"未処理\", \"ID確認済\", \"工務店確認済\", \"支払予定明細FAX送信待ち\", \"支払予定明細確認中\", \"支払予定明細送信前確認完了\", \"支払予定明細送付済\", \"債権譲渡登記取得待ち\", \"通常払い確認待ち\", \"振込前確認完了\", \"振込データ出力済\", \"保留中\", \"取下げ\") and constructionShopId in (\"400\", \"401\", \"402\", \"403\", \"404\")",
                "index": "11",
                "name": "WFI一覧（実行完了以外）",
                "sort": "closingDay desc",
                "type": "LIST"
            },
            "WFI以外の一覧（取下げ除外）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "collectId",
                    "paymentTiming",
                    "closingDay",
                    "登記の取得",
                    "paymentDate",
                    "paymentAccount",
                    "productName",
                    "ルックアップ",
                    "company",
                    "billingCompany",
                    "applicationAmount",
                    "membership_fee",
                    "totalReceivables",
                    "commissionAmount",
                    "transferAmount",
                    "commissionAmount_late",
                    "transferAmount_late",
                    "transferFeeTaxIncl",
                    "paymentDetail",
                    "mail",
                    "detailSendDateTime"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 not in (\"取下げ\") and productName not like \"軽バン.com\"",
                "index": "1",
                "name": "WFI以外の一覧（取下げ除外）",
                "sort": "paymentDate desc",
                "type": "LIST"
            },
            "一覧（取下げ・実行完了除外）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "collectId",
                    "paymentTiming",
                    "closingDay",
                    "登記の取得",
                    "paymentDate",
                    "paymentAccount",
                    "productName",
                    "ルックアップ",
                    "company",
                    "billingCompany",
                    "applicationAmount",
                    "membership_fee",
                    "totalReceivables",
                    "commissionAmount",
                    "transferAmount",
                    "commissionAmount_late",
                    "transferAmount_late",
                    "transferFeeTaxIncl",
                    "paymentDetail",
                    "mail",
                    "detailSendDateTime"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 not in (\"実行完了\", \"取下げ\")",
                "index": "2",
                "name": "一覧（取下げ・実行完了除外）",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧（取下げ除外）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "collectId",
                    "paymentTiming",
                    "closingDay",
                    "登記の取得",
                    "paymentDate",
                    "paymentAccount",
                    "productName",
                    "ルックアップ",
                    "company",
                    "billingCompany",
                    "applicationAmount",
                    "membership_fee",
                    "totalReceivables",
                    "commissionAmount",
                    "transferAmount",
                    "commissionAmount_late",
                    "transferAmount_late",
                    "transferFeeTaxIncl",
                    "paymentDetail",
                    "mail",
                    "detailSendDateTime"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 not in (\"取下げ\")",
                "index": "0",
                "name": "一覧（取下げ除外）",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "回収レコード作成": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "collectId",
                    "constructionShopId",
                    "billingCompanyOfficialName",
                    "closingDay",
                    "totalReceivables",
                    "ルックアップ",
                    "支払先正式名称",
                    "paymentTiming",
                    "paymentDate"
                ],
                "filterCond": "状態 in (\"ID確認済\")",
                "index": "4",
                "name": "回収レコード作成",
                "sort": "状態 asc, constructionShopId asc, closingDay asc, collectId asc, ルックアップ asc",
                "type": "LIST"
            },
            "当月分一覧（取下げ除外）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "collectId",
                    "paymentTiming",
                    "closingDay",
                    "登記の取得",
                    "paymentDate",
                    "paymentAccount",
                    "productName",
                    "company",
                    "billingCompanyOfficialName",
                    "applicationAmount",
                    "membership_fee",
                    "totalReceivables",
                    "commissionAmount",
                    "transferAmount",
                    "commissionAmount_late",
                    "transferAmount_late",
                    "transferFeeTaxIncl",
                    "ルックアップ",
                    "paymentDetail",
                    "mail",
                    "detailSendDateTime"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and 状態 not in (\"取下げ\") and paymentDate = THIS_MONTH()",
                "index": "3",
                "name": "当月分一覧（取下げ除外）",
                "sort": "paymentDate desc",
                "type": "LIST"
            },
            "振込データ出力（WFI早払い）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "constructionShopId",
                    "billingCompanyOfficialName",
                    "ルックアップ",
                    "支払先正式名称",
                    "closingDay",
                    "paymentDate",
                    "totalReceivables",
                    "commissionRate",
                    "commissionAmount",
                    "transferFeeTaxIncl",
                    "transferAmount",
                    "paymentTiming",
                    "paymentAccount",
                    "bankCode",
                    "bankName",
                    "branchCode",
                    "branchName",
                    "deposit",
                    "accountNumber",
                    "accountName"
                ],
                "filterCond": "状態 in (\"債権譲渡登記取得待ち\", \"通常払い確認待ち\", \"振込前確認完了\", \"振込データ出力済\") and constructionShopId in (\"400\", \"401\", \"402\", \"403\", \"404\")",
                "index": "8",
                "name": "振込データ出力（WFI早払い）",
                "sort": "paymentDate asc, paymentAccount asc",
                "type": "LIST"
            },
            "振込データ出力（リライト通常払い）": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "constructionShopId",
                    "billingCompanyOfficialName",
                    "ルックアップ",
                    "支払先正式名称",
                    "paymentDate",
                    "totalReceivables",
                    "paymentTiming",
                    "paymentAccount",
                    "bankCode",
                    "bankName",
                    "branchCode",
                    "branchName",
                    "deposit",
                    "accountNumber",
                    "accountName"
                ],
                "filterCond": "状態 in (\"債権譲渡登記取得待ち\", \"通常払い確認待ち\", \"振込前確認完了\", \"振込データ出力済\") and constructionShopId = \"100\"",
                "index": "7",
                "name": "振込データ出力（リライト通常払い）",
                "sort": "paymentDate asc, paymentAccount asc, ルックアップ asc",
                "type": "LIST"
            },
            "支払予定明細文面作成": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "paymentTiming",
                    "mail",
                    "detailSendDateTime",
                    "paymentDetail",
                    "支払先正式名称",
                    "担当者名",
                    "役職名",
                    "productName",
                    "closingDay",
                    "paymentDate",
                    "paymentAccount",
                    "billingCompanyOfficialName",
                    "applicationAmount",
                    "membership_fee",
                    "transferFeeTaxIncl",
                    "commissionRate",
                    "commissionAmount",
                    "transferAmount",
                    "commissionRate_late",
                    "commissionAmount_late",
                    "transferAmount_late"
                ],
                "filterCond": "状態 in (\"工務店確認済\", \"支払予定明細FAX送信待ち\", \"支払予定明細確認中\")",
                "index": "5",
                "name": "支払予定明細文面作成",
                "sort": "状態 asc, レコード番号 desc",
                "type": "LIST"
            },
            "支払予定明細送信状況": {
                "fields": [
                    "レコード番号",
                    "状態",
                    "paymentTiming",
                    "mail",
                    "detailSendDateTime",
                    "paymentDetail",
                    "支払先正式名称",
                    "担当者名",
                    "役職名",
                    "productName",
                    "closingDay",
                    "paymentDate",
                    "paymentAccount",
                    "billingCompanyOfficialName",
                    "applicationAmount",
                    "membership_fee",
                    "transferFeeTaxIncl",
                    "commissionRate",
                    "commissionAmount",
                    "transferAmount",
                    "commissionRate_late",
                    "commissionAmount_late",
                    "transferAmount_late"
                ],
                "filterCond": "状態 in (\"支払予定明細送信前確認完了\", \"支払予定明細送付済\")",
                "index": "6",
                "name": "支払予定明細送信状況",
                "sort": "状態 asc, レコード番号 desc",
                "type": "LIST"
            },
            "申込回数カウント対象（概算）": {
                "fields": [
                    "レコード番号",
                    "constructionShopId",
                    "billingCompanyOfficialName",
                    "ルックアップ",
                    "支払先正式名称",
                    "paymentTiming",
                    "closingDay",
                    "paymentDate",
                    "状態",
                    "transferAmount",
                    "transferAmount_late",
                    "transferFeeTaxIncl"
                ],
                "filterCond": "company not like \"テスト\" and company not like \"test\" and ルックアップ != \"\" and 状態 in (\"実行完了\") and paymentTiming not in (\"通常払い\") and closingDay >= FROM_TODAY(-1, YEARS)",
                "index": "9",
                "name": "申込回数カウント対象（概算）",
                "sort": "constructionShopId asc, ルックアップ asc, paymentTiming asc, closingDay desc",
                "type": "LIST"
            }
        }
    }
};
