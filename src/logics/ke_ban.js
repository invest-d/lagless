import "@fortawesome/fontawesome-free";

import "bootstrap";

import dayjs from "dayjs";
import "dayjs/locale/ja";
dayjs.locale("ja");
import isBetween from "dayjs/plugin/isBetween";
dayjs.extend(isBetween);

import {
    getUrlParam
} from "./common";

export const getTodayDate = () => {
    const specified_date = (() => {
        if (getUrlParam("debug_date") == "random") {
            const min = 1606748400; // 2020年12月01日
            const max = 1638284400; // 2021年12月01日
            const random_integer = Math.floor(Math.random() * (max + 1 - min)) + min;
            return dayjs.unix(random_integer);
        } else {
            return dayjs(getUrlParam("debug_date"));
        }
    })();
    if (specified_date.isValid()) {
        // デバッグ用。パラメータに日付を書くことで、「ブラウザを開いたときの日付」を変更できる
        console.log(`debug mode: today is ${specified_date.format("YYYY-MM-DD")}`);
        return specified_date;
    } else {
        return dayjs();
    }
};

export const TODAY = getTodayDate();

export const get_pay_term_start_date = (base_date) => {
    // base_dateが属する申込可能な稼働期間の開始日を取得する
    let start_date = base_date;
    while (start_date.date() % 5 !== 1 || start_date.date() === 31) {
        // start_date.date()が五十日のスタートとなる日付（つまり1, 6, 11, ... の日付）になるまで計算する。
        // 31日スタートの五十日は存在しないため、別途除外
        start_date = start_date.subtract(1, "day");
    }
    return start_date;
};

export const get_pay_term_end_date = (base_date) => {
    // base_dateが属する申込可能な稼働期間の終了日を取得する
    if (get_pay_term_start_date(base_date).date() === 26) {
        // 最終タームの場合、前払い対象の終了日は月末
        return base_date.endOf("month");
    } else {
        let end_date = base_date;
        while (end_date.date() % 5 !== 0) {
            end_date = end_date.add(1, "day");
        }
        return end_date;
    }
};

export const get_next_business_date = (base_date) => {
    // base_date以外の、base_dateの翌日以降の営業日を取得する。
    // 現状、曜日での判定のみ利用可能
    // FIXME: その他日本の祝日やカスタム休日にも対応する
    let next_date = base_date.add(1, "day");
    while([0, 6].includes(next_date.day())) {
        next_date = next_date.add(1, "day");
    }
    return next_date;
};

export const get_terms_prev_now_next = (today) => {
    // 稼働期間：五十日の区切り
    // 申込期間：稼働期間の開始日〜稼働期間の終了日の翌営業日
    // todayを現在の五十日に属する日付として、前後の稼働期間と申込期間を求める。
    const terms = {
        prev: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        },
        now: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        },
        next: {
            pay: {
                start: null,
                end: null
            },
            apply: {
                start: null,
                end: null
            }
        }
    };

    terms.now.pay.start     = get_pay_term_start_date(today);
    terms.now.pay.end       = get_pay_term_end_date(today);

    // 現在の五十日の直前の五十日について、開始日と終了日を求める
    terms.prev.pay.start    = get_pay_term_start_date(terms.now.pay.start.subtract(1, "day"));
    terms.prev.pay.end      = get_pay_term_end_date(terms.now.pay.start.subtract(1, "day"));

    // 現在の五十日の直後の五十日について、開始日と終了日を求める
    terms.next.pay.start    = get_pay_term_start_date(terms.now.pay.end.add(1, "day"));
    terms.next.pay.end      = get_pay_term_end_date(terms.now.pay.end.add(1, "day"));

    // それぞれの五十日について、申込可能期間を求める
    // 申込可能期間の開始日は常に五十日の開始日に等しい
    terms.prev.apply.start  = terms.prev.pay.start;
    terms.now.apply.start   = terms.now.pay.start;
    terms.next.apply.start  = terms.next.pay.start;
    // 申込可能期間の終了日は五十日の終了日の翌営業日
    terms.prev.apply.end    = get_next_business_date(terms.prev.pay.end);
    terms.now.apply.end     = get_next_business_date(terms.now.pay.end);
    terms.next.apply.end    = get_next_business_date(terms.next.pay.end);

    return terms;
};

export const get_available_terms = (terms, today) => {
    // 単純な五十日の期間のうち、システム上受付可能な五十日のみをArrayにして返す
    const available_terms = [];
    // Object.keys(terms)を使いたいが、順番が保証されない(下記参照)ので手打ちでkeyの配列を定義する
    // https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Object/keys#Using_Object.keys
    for (const term of ["prev", "now", "next"]) {
        if (today.isBetween(terms[term].apply.start, terms[term].apply.end, null, "[]")) {
            // 26日以降スタートの稼働期間は除外する
            if (terms[term].pay.start.date() >= 26) {
                continue;
            }

            // 2020年内スタートの稼働期間は除外する
            if (terms[term].pay.start.year() < 2021) {
                continue;
            }

            available_terms.push(terms[term]);
        }
    }

    return available_terms;
};
