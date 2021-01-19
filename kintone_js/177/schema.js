export const schema_177 = {
    "fields": {
        "properties": {
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
            "kyoryokuMasterID": {
                "code": "kyoryokuMasterID",
                "label": "協力会社マスタID",
                "lookup": {
                    "fieldMappings": [
                        {
                            "field": "dandoriID",
                            "relatedField": "dandoriID"
                        },
                        {
                            "field": "kyoryokuName",
                            "relatedField": "支払先正式名称"
                        }
                    ],
                    "filterCond": "dandoriID != \"\"",
                    "lookupPickerFields": [
                        "支払企業No_",
                        "dandoriID",
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
            "kyoryokuName": {
                "code": "kyoryokuName",
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
        "appId": "177",
        "name": "ダンドリワーク通常払い除外先"
    },
    "layout": {
        "layout": [
            {
                "type": "ROW",
                "fields": [
                    {
                        "type": "NUMBER",
                        "code": "kyoryokuMasterID",
                        "size": {}
                    },
                    {
                        "type": "NUMBER",
                        "code": "dandoriID",
                        "size": {}
                    },
                    {
                        "type": "SINGLE_LINE_TEXT",
                        "code": "kyoryokuName",
                        "size": {}
                    }
                ]
            }
        ]
    },
    "views": {
        "views": {}
    }
};
