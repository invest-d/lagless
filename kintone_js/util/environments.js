const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }


const developAppIds = [
    159, // 申込アプリ
    160, // 回収アプリ
    180, // 取引企業管理アプリ
    181, // 協力会社マスタアプリ
    182, // 工務店マスタアプリ
];


const productionAppIds = [
    161, // 申込アプリ
    162, // 回収アプリ
    28, // 取引企業管理アプリ
    88, // 協力会社マスタアプリ
    96, // 工務店マスタアプリ
];


export const detectApp = (appId) => {
    const knownAppIds = developAppIds.concat(productionAppIds);
    if (!appId || !knownAppIds.includes(appId)) {
        throw new UnknownAppError();
    }

    if (developAppIds.includes(appId)) return "dev";
    if (productionAppIds.includes(appId)) return "prod";
};


import { schema_apply as applyAppSchemaDev } from "../159/schema";
import { schema_apply as applyAppSchemaProd } from "../161/schema";
/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した申込アプリのスキーマ
*/
export const getApplyAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return applyAppSchemaDev;
    if (app === "prod") return applyAppSchemaProd;
};


import { schema_collect as collectAppSchemaDev } from "../160/schema";
import { schema_collect as collectAppSchemaProd } from "../162/schema";
/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した回収アプリのスキーマ
*/
export const getCollectAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return collectAppSchemaDev;
    if (app === "prod") return collectAppSchemaProd;
};


import { schema_180 as companyAppSchemaDev } from "../180/schema";
import { schema_28 as companyAppSchemaProd } from "../28/schema";
/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した取引企業管理アプリのスキーマ
*/
export const getCompanyAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return companyAppSchemaDev;
    if (app === "prod") return companyAppSchemaProd;
};


import { schema_182 as ordererAppSchemaDev } from "../182/schema";
import { schema_96 as ordererAppSchemaProd } from "../96/schema";
/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した工務店マスタアプリのスキーマ
*/
export const getOrdererAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return ordererAppSchemaDev;
    if (app === "prod") return ordererAppSchemaProd;
};


import { schema_181 as laborAppSchemaDev } from "../181/schema";
import { schema_88 as laborAppSchemaProd } from "../88/schema";
/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した協力会社マスタアプリのスキーマ
*/
export const getLaborAppSchema = (displayingAppId) => {
    const app = detectApp(displayingAppId);
    if (app === "dev") return laborAppSchemaDev;
    if (app === "prod") return laborAppSchemaProd;
};
