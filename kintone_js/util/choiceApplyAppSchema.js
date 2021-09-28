const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_apply as applyAppSchemaDev } from "../159/schema";
import { schema_apply as applyAppSchemaProd } from "../161/schema";

/**
* @summary 申込アプリの開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義したスキーマ
*/
export const getApplyAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return applyAppSchemaDev;
    if (app === "prod") return applyAppSchemaProd;
};

export const detectApp = (appId) => {
    if (!appId || ![159, 161, 160, 162].includes(appId)) {
        throw new UnknownAppError();
    }

    if ([159, 160].includes(appId)) return "dev";
    if ([161, 162].includes(appId)) return "prod";
};
