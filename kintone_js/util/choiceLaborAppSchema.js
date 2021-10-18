const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_181 as laborAppSchemaDev } from "../181/schema";
import { schema_88 as laborAppSchemaProd } from "../88/schema";

/**
* @summary 操作中アプリの開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義したスキーマ
*/
export const getLaborAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return laborAppSchemaDev;
    if (app === "prod") return laborAppSchemaProd;
};

const detectApp = (appId) => {
    if (!appId || ![159, 161, 160, 162, 88, 181].includes(appId)) {
        throw new UnknownAppError();
    }

    if ([159, 160, 181].includes(appId)) return "dev";
    if ([161, 162, 88].includes(appId)) return "prod";
};