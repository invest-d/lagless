const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }

import { schema_182 as ordererAppSchemaDev } from "../182/schema";
import { schema_96 as ordererAppSchemaProd } from "../96/schema";
import { detectApp } from "./environments";

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
