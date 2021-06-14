const fetch = require("node-fetch");
const querystring = require("querystring");

const KINTONE_GET_LIMIT = 500;

const conv = (records) => records.map((r) => {
    const record = {};
    Object.keys(r).forEach((k) => {
        if(r[k].value && 0 < r[k].value.length && typeof r[k].value[0] == "object") {
            record[k] = r[k].value.map((r) => {
                return Object.keys(r.value).reduce((a, s) => Object.assign(a, { [s]: r.value[s].value }), { });
            });
        } else {
            record[k] = r[k].value;
        }
    });
    return record;
});

const except = (obj, keys) => {
    const r = { };
    for(const k in obj) {
        if(!keys.includes(k)) {
            r[k] = obj[k];
        }
    }
    return r;
};

const pattern_fields = [
    "pattern",
    "closing", "deadline", "early", "late"
].join(",");

// 20パターン*12ヶ月 = 240くらいを想定
const fetch_pattern = function(env) {
    return fetch(`https://investdesign.cybozu.com/k/v1/records.json?${querystring.stringify({
        app: parseInt(env["KINTONE_PATTERN_APP_ID"]),
        fields: pattern_fields,
        query: `deadline >= TODAY() and deadline <= FROM_TODAY(12, MONTHS) order by deadline asc limit ${KINTONE_GET_LIMIT}`,
    })}`, {
        headers: { "X-Cybozu-API-Token": env["KINTONE_PATTERN_TOKEN"] },
    })
        .then((res) => {
            if(res.status == 200) {
                return res.json();
            } else {
                res.text().then((text) => { throw new Error(text); });
            }
        })
        .then((json) => conv(json.records))
        .then((records) => {
            const by_pattern = { };
            records.forEach((r) => {
                if(!by_pattern[r.pattern]) {
                    by_pattern[r.pattern] = [ ];
                }
                by_pattern[r.pattern].push(r);
            });
            return by_pattern;
        });
};

const fields = [
    "id", "工務店正式名称", "service", "pattern", "cost", "transfer_fee", "limit", "yield",
    "form_1", "form_2", "link", "mail",
    "closing", "deadline", "early", "original", "lag", "effect",
    "default_pay_date_list",
    "支払元口座",
].join(",");

const fetch_service = function(env) {
    return fetch(`https://investdesign.cybozu.com/k/v1/records.json?${querystring.stringify({
        app: env["KINTONE_BUILDER_APP_ID"],
        fields: fields,
        query: `limit ${KINTONE_GET_LIMIT}`
    })}`, {
        headers: { "X-Cybozu-API-Token": env["KINTONE_BUILDER_TOKEN"] },
    })
        .then((res) => {
            if(res.status == 200) {
                return res.json();
            } else {
                res.text().then((text) => { throw new Error(text); });
            }
        })
        .then((json) => conv(json.records))
        .then((records) => {
            const by_id = { };
            records.forEach((r) => {
                by_id[r.id] = except(r, [ "id" ]);
            });
            return by_id;
        });
};

module.exports = {
    fetch_pattern,
    fetch_service,
};
