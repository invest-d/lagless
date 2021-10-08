const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_180 as companyAppSchemaDev } from "../180/schema";
import { schema_28 as companyAppSchemaProd } from "../28/schema";

/**
* @summary 申込アプリの開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義したスキーマ
*/
export const getCompanyAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return companyAppSchemaDev;
    if (app === "prod") return companyAppSchemaProd;
};

export const detectApp = (appId) => {
    if (!appId || ![159, 161, 160, 162].includes(appId)) {
        throw new UnknownAppError();
    }

    if ([161, 162, 28].includes(appId)) return "prod";
    if ([159, 160, 180].includes(appId)) return "dev";
};
