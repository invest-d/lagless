const ExtensibleCustomError = require("extensible-custom-error");
export class UnknownAppError extends ExtensibleCustomError { }
import { schema_apply as applyAppSchemaDev } from "../159/schema";
import { schema_collect as collectAppSchemaDev } from "../160/schema";
import { schema_apply as applyAppSchemaProd } from "../161/schema";
import { schema_collect as collectAppSchemaProd } from "../162/schema";
import { schema_180 as companyAppSchemaDev } from "../180/schema";
import { schema_181 as laborAppSchemaDev } from "../181/schema";
import { schema_182 as ordererAppSchemaDev } from "../182/schema";
import { schema_28 as companyAppSchemaProd } from "../28/schema";
import { schema_88 as laborAppSchemaProd } from "../88/schema";
import { schema_96 as ordererAppSchemaProd } from "../96/schema";


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


const getAppSchema = (displayingAppId, app) => {
    const apps = {
        dev: {
            apply: applyAppSchemaDev,
            collect: collectAppSchemaDev,
            company: companyAppSchemaDev,
            orderer: ordererAppSchemaDev,
            labor: laborAppSchemaDev,
        },
        prod: {
            apply: applyAppSchemaProd,
            collect: collectAppSchemaProd,
            company: companyAppSchemaProd,
            orderer: ordererAppSchemaProd,
            labor: laborAppSchemaProd,
        },
    };

    const env = ((displayingAppId) => {
        try {
            return detectApp(displayingAppId);
        } catch (e) {
            if (e instanceof UnknownAppError) {
                alert("不明なアプリです。申込アプリで実行してください。");
            } else {
                console.error(e);
                const additional_info = e.message ?? JSON.stringify(e);
                alert("途中で処理に失敗しました。システム管理者に連絡してください。"
                    + "\n追加の情報: "
                    + `\n${additional_info}`);
            }

            return undefined;
        }
    })(displayingAppId);

    if (!env) return undefined;

    return apps[env][app];
};


/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した申込アプリのスキーマ
*/
export const getApplyAppSchema = (displayingAppId) => getAppSchema(displayingAppId, "apply");


/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した回収アプリのスキーマ
*/
export const getCollectAppSchema = (displayingAppId) => getAppSchema(displayingAppId, "collect");


/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した取引企業管理アプリのスキーマ
*/
export const getCompanyAppSchema = (displayingAppId) => getAppSchema(displayingAppId, "company");


/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した工務店マスタアプリのスキーマ
*/
export const getOrdererAppSchema = (displayingAppId) => getAppSchema(displayingAppId, "orderer");


/**
* @summary 開発版および本番に応じて、適切なアプリスキーマを返す
* @param {number | null} displayingAppId - kintone.app.getId() の返り値。既知のアプリのID以外の場合、UnknownAppError を throw
* @return {Object} スキーマファイルに定義した協力会社マスタアプリのスキーマ
*/
export const getLaborAppSchema = (displayingAppId) => getAppSchema(displayingAppId, "labor");
