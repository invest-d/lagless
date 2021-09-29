const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_collect as collectAppSchemaDev } from "../160/schema";
import { schema_collect as collectAppSchemaProd } from "../162/schema";

/**
* @summary 回収アプリの開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義したスキーマ
*/
export const getCollectAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return collectAppSchemaDev;
    if (app === "prod") return collectAppSchemaProd;
};

export const detectApp = (appId) => {
    if (!appId || ![159, 161, 160, 162].includes(appId)) {
        throw new UnknownAppError();
    }

    if ([159, 160].includes(appId)) return "dev";
    if ([161, 162].includes(appId)) return "prod";
};
