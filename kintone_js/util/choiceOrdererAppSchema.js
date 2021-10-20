const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_182 as ordererAppSchemaDev } from "../182/schema";
import { schema_96 as ordererAppSchemaProd } from "../96/schema";

/**
* @summary 操作中アプリの開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義したスキーマ
*/
export const getOrdererAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return ordererAppSchemaDev;
    if (app === "prod") return ordererAppSchemaProd;
};

const detectApp = (appId) => {
    if (!appId || ![159, 161, 160, 162, 88, 181, 182, 96].includes(appId)) {
        throw new UnknownAppError();
    }

    if ([159, 160, 181, 182].includes(appId)) return "dev";
    if ([161, 162, 88, 96].includes(appId)) return "prod";
};
