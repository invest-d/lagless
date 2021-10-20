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
