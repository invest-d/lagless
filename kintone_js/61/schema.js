export const schema_61 = {
    "fields": {
        "properties": {
            "ID": {
                "code": "ID",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "ID",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "その他・備考": {
                "code": "その他・備考",
                "defaultValue": "",
                "label": "その他・備考",
                "noLabel": false,
                "required": false,
                "type": "MULTI_LINE_TEXT"
            },
            "カテゴリー": {
                "code": "カテゴリー",
                "enabled": false,
                "label": "カテゴリー",
                "type": "CATEGORY"
            },
            "サービス名": {
                "code": "サービス名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "サービス名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": true,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "ステータス": {
                "code": "ステータス",
                "enabled": false,
                "label": "ステータス",
                "type": "STATUS"
            },
            "パスワード": {
                "code": "パスワード",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "パスワード",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
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
            "ユーザー名": {
                "code": "ユーザー名",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "ユーザー名",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "レコード番号": {
                "code": "レコード番号",
                "label": "レコード番号",
                "noLabel": false,
                "type": "RECORD_NUMBER"
            },
            "ログインＵＲＬ": {
                "code": "ログインＵＲＬ",
                "defaultValue": "",
                "label": "ログインＵＲＬ",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "protocol": "WEB",
                "required": false,
                "type": "LINK",
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
            "秘密の質問": {
                "code": "秘密の質問",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "秘密の質問",
                "maxLength": "",
                "minLength": "",
                "noLabel": false,
                "required": false,
                "type": "SINGLE_LINE_TEXT",
                "unique": false
            },
            "秘密の質問の答え": {
                "code": "秘密の質問の答え",
                "defaultValue": "",
                "expression": "",
                "hideExpression": false,
                "label": "秘密の質問の答え",
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
        "appId": "61",
        "name": "ＩＤ管理"
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
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "サービス名",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "ID",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "パスワード",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "ユーザー名",
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
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "秘密の質問",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "秘密の質問の答え",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "LINK",
                        "code": "ログインＵＲＬ",
                        "size": {}
                    }
                ]
            },
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "MULTI_LINE_TEXT",
                        "code": "その他・備考",
                        "size": {
                            "innerHeight": "84"
                        }
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {
            "一覧": {
                "fields": [
                    "レコード番号",
                    "サービス名",
                    "ID"
                ],
                "filterCond": "",
                "index": "0",
                "name": "一覧",
                "sort": "レコード番号 desc",
                "type": "LIST"
            }
        }
    }
};
