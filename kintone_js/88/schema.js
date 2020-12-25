export const schema_88 = {
    "fields": {
        "properties": {
            "applicationLimit": {
                "code": "applicationLimit",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "早払い年間回数制限（コピー元：工務店アプリ）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "回",
                "unitPosition": "AFTER"
            },
            "dandoriID": {
                "code": "dandoriID",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "ダンドリワーク協力会社ID",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "kebanID": {
                "code": "kebanID",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "ドライバーID",
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
                "label": "稼働開始日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "numberOfApplication": {
                "code": "numberOfApplication",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "",
                "label": "1年間の早払い申込み回数（ボタンで入力）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "回",
                "unitPosition": "AFTER"
            },
            "numberOfApplication_late": {
                "code": "numberOfApplication_late",
                "defaultValue": "0",
                "digit": false,
                "displayScale": "",
                "label": "1年間の遅払い申込み回数（ボタンで入力）",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "回",
                "unitPosition": "AFTER"
            },
            "shouldSendStartMail": {
                "align": "HORIZONTAL",
                "code": "shouldSendStartMail",
                "defaultValue": "送信しない",
                "label": "スタートメール送信設定",
                "noLabel": false,
                "options": {
                    "送信しない": {
                        "index": "0",
                        "label": "送信しない"
                    },
                    "送信する": {
                        "index": "1",
                        "label": "送信する"
                    },
                    "開発用": {
                        "index": "2",
                        "label": "開発用"
                    }
                },
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "startMailSendDate": {
                "code": "startMailSendDate",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "スタートメール最終送信日時",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "statusStartMail": {
                "code": "statusStartMail",
                "defaultValue": "未処理",
                "label": "送信状況",
                "noLabel": false,
                "options": {
                    "エラー（その他）": {
                        "index": "4",
                        "label": "エラー（その他）"
                    },
                    "エラー（未入力）": {
                        "index": "2",
                        "label": "エラー（未入力）"
                    },
                    "エラー（誤入力）": {
                        "index": "3",
                        "label": "エラー（誤入力）"
                    },
                    "未処理": {
                        "index": "0",
                        "label": "未処理"
                    },
                    "送信成功": {
                        "index": "1",
                        "label": "送信成功"
                    }
                },
                "required": false,
                "type": "DROP_DOWN"
            },
            "updatedDate": {
                "code": "updatedDate",
                "label": "更新日時",
                "noLabel": false,
                "type": "UPDATED_TIME"
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
            "メールアドレス": {
                "code": "メールアドレス",
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
                "label": "備考１",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "初回送信日時": {
                "code": "初回送信日時",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "初回送信日時",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "取引企業管理No": {
                "code": "取引企業管理No",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "取引企業管理No",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "口座名義": {
                "code": "口座名義",
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
            "口座番号": {
                "code": "口座番号",
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
            "商品名": {
                "code": "商品名",
                "defaultValue": "",
                "label": "商品名（※事務局名に反映）",
                "noLabel": false,
                "options": {
                    "Workship": {
                        "index": "4",
                        "label": "Workship"
                    },
                    "ダンドリペイメント": {
                        "index": "1",
                        "label": "ダンドリペイメント"
                    },
                    "テスト商品": {
                        "index": "6",
                        "label": "テスト商品"
                    },
                    "ネクステージペイメント": {
                        "index": "3",
                        "label": "ネクステージペイメント"
                    },
                    "ラグレス": {
                        "index": "0",
                        "label": "ラグレス"
                    },
                    "リノベ不動産Payment": {
                        "index": "2",
                        "label": "リノベ不動産Payment"
                    },
                    "軽バンドットコム": {
                        "index": "5",
                        "label": "軽バンドットコム"
                    }
                },
                "required": true,
                "type": "DROP_DOWN"
            },
            "工務店ID": {
                "code": "工務店ID",
                "label": "工務店ID",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "applicationLimit",
                            "relatedField": "applicationLimit"
                        }
                    ],
                    "filterCond": "",
                    "lookupPickerFields": [
                        "id",
                        "工務店名"
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
            "支店コード": {
                "code": "支店コード",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支店コード",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
            "支払企業No_": {
                "code": "支払企業No_",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "協力会社ID",
                "maxValue": "",
                "minValue": "",
                "noLabel": false,
                "required": true,
                "type": "NUMBER",
                "unique": true,
                "unit": "",
                "unitPosition": "BEFORE"
            },
            "支払先": {
                "code": "支払先",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "支払先",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
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
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "更新者": {
                "code": "更新者",
                "label": "更新者",
                "noLabel": false,
                "type": "MODIFIER"
            },
            "最終送信日時": {
                "code": "最終送信日時",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "最終送信日時",
                "noLabel": false,
                "required": false,
                "type": "DATETIME",
                "unique": false
            },
            "申込メール送付日": {
                "code": "申込メール送付日",
                "defaultValue": "",
                "digit": false,
                "displayScale": "",
                "label": "メール送付日",
                "maxValue": "31",
                "minValue": "0",
                "noLabel": false,
                "required": false,
                "type": "NUMBER",
                "unique": false,
                "unit": "日",
                "unitPosition": "AFTER"
            },
            "送付方法": {
                "align": "HORIZONTAL",
                "code": "送付方法",
                "defaultValue": "(無し)",
                "label": "送付方法",
                "noLabel": false,
                "options": {
                    "(無し)": {
                        "index": "0",
                        "label": "(無し)"
                    },
                    "SMS": {
                        "index": "2",
                        "label": "SMS"
                    },
                    "両方": {
                        "index": "3",
                        "label": "両方"
                    },
                    "電子メール": {
                        "index": "1",
                        "label": "電子メール"
                    }
                },
                "required": true,
                "type": "RADIO_BUTTON"
            },
            "金融機関コード": {
                "code": "金融機関コード",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "金融機関コード",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "銀行名": {
                "code": "銀行名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "銀行名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "開始日": {
                "code": "開始日",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "契約開始支払期限日",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "関連レコード一覧": {
                "code": "関連レコード一覧",
                "label": "関連レコード一覧(MED)",
                "noLabel": false,
                "referenceTable": {
                    "condition": {
                        "field": "支払企業No_",
                        "relatedField": "支払企業No"
                    },
                    "displayFields": [
                        "支払実行日",
                        "請求金額合計"
                    ],
                    "filterCond": "除外理由 = \"\" and 支払実行日 >= FROM_TODAY(-1, YEARS)",
                    "relatedApp": {
                        "app": "84",
                        "code": ""
                    },
                    "size": "30",
                    "sort": "レコード番号 desc"
                },
                "type": "REFERENCE_TABLE"
            },
            "除外期間": {
                "code": "除外期間",
                "defaultNowValue": false,
                "defaultValue": "",
                "label": "除外期間（終了日）",
                "noLabel": false,
                "required": false,
                "type": "DATE",
                "unique": false
            },
            "電話番号": {
                "code": "電話番号",
                "defaultValue": "",
                "label": "電話番号",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "CALL",
                "required": false,
                "type": "LINK",
                "unique": false
            },
            "預金種目": {
                "align": "HORIZONTAL",
                "code": "預金種目",
                "defaultValue": "(未設定)",
                "label": "預金種目",
                "noLabel": false,
                "options": {
                    "(未設定)": {
                        "index": "0",
                        "label": "(未設定)"
                    },
                    "当座": {
                        "index": "2",
                        "label": "当座"
                    },
                    "普通": {
                        "index": "1",
                        "label": "普通"
                    }
                },
                "required": true,
                "type": "RADIO_BUTTON"
            }
        }
    },
    "id": {
        "appId": "88",
        "name": "協力会社マスタ"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><b><font color=\"#ff0000\">本アプリには新規の必須入力フィールドを追加してはならない。</font></b><div><font color=\"#000000\">案内メール送信プログラムにおいてエラーが発生するため。</font></div></div><div><font color=\"#000000\">&#xff08;フィールド追加後にデフォルト値を全レコードに設定すれば回避可能&#xff09;</font></div>",
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
                        "code": "updatedDate",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "取引企業管理No",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><font color=\"#ff0000\"><br /></font></div><div><span style=\"color:rgb( 255 , 0 , 0 )\">←※申込があった場合は入力必須&#xff01;</span><br /></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "支払企業No_",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "工務店ID",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "開始日",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><br /></div><div>←※ネクステージペイメント契約者のみ入力<br /></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\" style=\"font-weight:bold\">■スタートメール</font><font size=\"4\">------------------------------------------------</font><span style=\"font-size:large\">-------------</span><span style=\"font-size:large\">-------------</span><span style=\"font-size:large\">--</span><span style=\"font-size:large\">---------------</span></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "shouldSendStartMail",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "startMailSendDate",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "statusStartMail",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>「送信する」にチェックを入れておくと、この協力会社様にスタートメールを送信します。<div>送信に成功すると、自動で①「最終送信日時」を更新し、②送信状況が「送信成功」になり、③送信設定は自動で「送信しない」にチェックが入ります。</div><div>※送信状況が「送信成功」になっていてもe-mailで受信されていない場合は、infoにエラー通知が来ます。</div><div><br /></div><div>スタートメールをいつ送信するかは、<b><font color=\"#ff0000\">工務店マスタの「スタートメール送信予定日時」</font></b>で設定してください。</div><div>送信予定日時が空欄だったり、過去の日付だったりする場合、スタートメールは送信されません。<br /></div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div><font size=\"4\" style=\"font-weight:bold\">■申込案内メール本文に反映するデータ</font><font size=\"4\">---------------------------------------------------------------</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支払先",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支払先正式名称",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "工務店名",
                        "size": {}
                    },
                    {
                        "type": "DROP_DOWN",
                        "code": "商品名",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>---------------------------------------------------------------------------------------------------------------------------------------</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "役職名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "担当者名",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div><br /></div><div><font color=\"#ff0000\">←※支払先名と同一の場合不要</font></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "銀行名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支店名",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "金融機関コード",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "支店コード",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "RADIO_BUTTON",
                        "code": "預金種目",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "口座番号",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "口座名義",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>口座名義にひらがなや漢字等が入っていると<div>振込用データの作成時にエラーとなるため注意</div></div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "メールアドレス",
                        "size": {}
                    },
                    {
                        "type": "LINK",
                        "code": "電話番号",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "申込メール送付日",
                        "size": {}
                    },
                    {
                        "type": "DATE",
                        "code": "除外期間",
                        "size": {}
                    },
                    {
                        "type": "RADIO_BUTTON",
                        "code": "送付方法",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>※送付方法が「両方」なのに片方が空欄の場合は、空欄になっている送付方法は無視する&#xff08;入力済みの方法だけで送信する&#xff09;。</div><div>　両方とも空欄になっていたらエラーになる。</div>",
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
                        "type": "DATETIME",
                        "code": "初回送信日時",
                        "size": {}
                    },
                    {
                        "type": "DATETIME",
                        "code": "最終送信日時",
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
                        "label": "<div>申込回数は、工務店マスタの「申込回数リセット月」に基づく期間内の申込レコードを対象にカウントします</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "numberOfApplication",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "applicationLimit",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "numberOfApplication_late",
                        "size": {}
                    },
                    {
                        "type": "LABEL",
                        "label": "<div>遅払いの回数制限は現状設定なし</div>",
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
                        "label": "<div>工務店特有のフィールド群&#xff08;全て任意入力&#xff09;</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>ダンドリペイメント利用の工務店用</div>",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "dandoriID",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LABEL",
                        "label": "<div>ワールドフォースインターナショナル用</div>",
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
            }
        ]
    },
    "views": {
        "views": {
            "MED Communications株式会社": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "開始日",
                    "支払先",
                    "支払先正式名称",
                    "役職名",
                    "担当者名",
                    "工務店ID",
                    "工務店名",
                    "商品名",
                    "銀行名",
                    "支店名",
                    "預金種目",
                    "口座番号",
                    "口座名義",
                    "メールアドレス",
                    "電話番号"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"601\"",
                "index": "12",
                "name": "MED Communications株式会社",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "ウスクラ建設株式会社": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"301\"",
                "index": "1",
                "name": "ウスクラ建設株式会社",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "テスト用スタートメール": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "支払先",
                    "電話番号",
                    "メールアドレス",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "工務店ID",
                    "工務店名",
                    "商品名",
                    "更新者",
                    "updatedDate"
                ],
                "filterCond": "支払先正式名称 like \"テスト\"",
                "index": "20",
                "name": "テスト用スタートメール",
                "sort": "shouldSendStartMail desc",
                "type": "LIST"
            },
            "テスト用レコード": {
                "fields": [
                    "レコード番号",
                    "取引企業管理No",
                    "支払企業No_",
                    "開始日",
                    "支払先正式名称",
                    "支払先",
                    "申込メール送付日",
                    "初回送信日時",
                    "最終送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "電話番号",
                    "メールアドレス",
                    "startMailSendDate",
                    "numberOfApplication",
                    "applicationLimit",
                    "numberOfApplication_late",
                    "役職名",
                    "担当者名",
                    "銀行名",
                    "支店名",
                    "金融機関コード",
                    "支店コード",
                    "預金種目",
                    "口座番号",
                    "口座名義",
                    "工務店ID",
                    "工務店名",
                    "除外期間",
                    "商品名",
                    "送付方法"
                ],
                "filterCond": "支払先正式名称 like \"テスト\"",
                "index": "19",
                "name": "テスト用レコード",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "一覧1": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\"",
                "index": "0",
                "name": "一覧1",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "古川製材株式会社": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"215\"",
                "index": "10",
                "name": "古川製材株式会社",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "有限会社矢内石油": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"211\"",
                "index": "13",
                "name": "有限会社矢内石油",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "本日送付した先": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先",
                    "支払先正式名称",
                    "役職名",
                    "担当者名",
                    "銀行名",
                    "支店名",
                    "口座番号",
                    "口座名義",
                    "工務店名",
                    "金融機関コード",
                    "支店コード",
                    "開始日",
                    "工務店ID",
                    "除外期間",
                    "申込メール送付日",
                    "初回送信日時",
                    "最終送信日時",
                    "メールアドレス",
                    "電話番号",
                    "送付方法",
                    "商品名"
                ],
                "filterCond": "最終送信日時 = TODAY()",
                "index": "18",
                "name": "本日送付した先",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社GIG": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "開始日",
                    "支払先正式名称",
                    "担当者名",
                    "メールアドレス",
                    "電話番号",
                    "銀行名",
                    "金融機関コード",
                    "支店名",
                    "支店コード",
                    "預金種目",
                    "口座番号",
                    "口座名義",
                    "工務店名",
                    "商品名"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店ID = \"500\"",
                "index": "4",
                "name": "株式会社GIG",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社Realtor Solutions": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"100\"",
                "index": "14",
                "name": "株式会社Realtor Solutions",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社WAKUWAKU": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"300\"",
                "index": "15",
                "name": "株式会社WAKUWAKU",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社エムアールエスブレイン": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"212\"",
                "index": "2",
                "name": "株式会社エムアールエスブレイン",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社サンクリエーション": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"101\"",
                "index": "5",
                "name": "株式会社サンクリエーション",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社ナサホーム": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"210\"",
                "index": "6",
                "name": "株式会社ナサホーム",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社ハウジング重兵衛": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"204\"",
                "index": "8",
                "name": "株式会社ハウジング重兵衛",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社ヒカリテック": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"214\"",
                "index": "9",
                "name": "株式会社ヒカリテック",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社メガステップ": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"105\"",
                "index": "11",
                "name": "株式会社メガステップ",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "株式会社日本中央住販": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"104\"",
                "index": "7",
                "name": "株式会社日本中央住販",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "案内メールテスト用": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "申込メール送付日",
                    "送付方法",
                    "支払先",
                    "担当者名",
                    "メールアドレス",
                    "電話番号",
                    "初回送信日時",
                    "最終送信日時",
                    "除外期間",
                    "工務店ID",
                    "工務店名",
                    "商品名",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "申込メール送付日 = \"0\"",
                "index": "17",
                "name": "案内メールテスト用",
                "sort": "レコード番号 desc",
                "type": "LIST"
            },
            "自動送付": {
                "fields": [
                    "申込メール送付日",
                    "初回送信日時",
                    "最終送信日時",
                    "除外期間",
                    "レコード番号",
                    "送付方法",
                    "メールアドレス",
                    "電話番号",
                    "支払企業No_",
                    "開始日",
                    "支払先",
                    "担当者名",
                    "工務店ID",
                    "工務店名",
                    "商品名"
                ],
                "filterCond": "申込メール送付日 != \"0\" and 申込メール送付日 != \"\"",
                "index": "16",
                "name": "自動送付",
                "sort": "申込メール送付日 asc",
                "type": "LIST"
            },
            "銀杏開発株式会社": {
                "fields": [
                    "レコード番号",
                    "支払企業No_",
                    "支払先正式名称",
                    "担当者名",
                    "工務店名",
                    "商品名",
                    "除外期間",
                    "送付方法",
                    "申込メール送付日",
                    "初回送信日時",
                    "shouldSendStartMail",
                    "statusStartMail",
                    "startMailSendDate",
                    "メールアドレス",
                    "電話番号",
                    "numberOfApplication",
                    "applicationLimit"
                ],
                "filterCond": "支払先正式名称 not like \"テスト\" and 支払先正式名称 not like \"test\" and 工務店名 not like \"テスト\" and 工務店名 not like \"test\" and 工務店ID = \"304\"",
                "index": "3",
                "name": "銀杏開発株式会社",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};
