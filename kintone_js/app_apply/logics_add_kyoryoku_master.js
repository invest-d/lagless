"use strict";

import { PhoneNumberUtil } from "google-libphonenumber";
const phoneUtil = PhoneNumberUtil.getInstance();

import { isGigConstructorID } from "../util/gig_utils";
import {
    KE_BAN_CONSTRUCTORS,
    SHOWA_CONSTRUCTORS,
    FROM_KOBE_CONSTRUCTORS,
} from "../96/common";

import { schema_88 } from "../88/schema";
const customerFields = schema_88.fields.properties;
const komutenId_KYORYOKU        = customerFields.工務店ID.code;
const productName_KYORYOKU      = customerFields.商品名.code;
const productWorkship_KYORYOKU  = customerFields.商品名.options.Workship.label;
const method_default_KYORYOKU           = customerFields.送付方法.defaultValue;
const method_email_KYORYOKU             = customerFields.送付方法.options.電子メール.label;
const method_sms_KYORYOKU               = customerFields.送付方法.options.SMS.label;
const method_both_KYORYOKU              = customerFields.送付方法.options.両方.label;
const method_none_KYORYOKU              = customerFields.送付方法.options["(無し)"].label;

export const getSameKomutenKyoryokuCond = (komutenId) => {
    if (SHOWA_CONSTRUCTORS.includes(komutenId)) {
        const in_query = SHOWA_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        return `${komutenId_KYORYOKU} in (${in_query})`;
    } else if (KE_BAN_CONSTRUCTORS.includes(komutenId)) {
        const in_query = KE_BAN_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        return `${komutenId_KYORYOKU} in (${in_query})`;
    } else if (FROM_KOBE_CONSTRUCTORS.includes(komutenId)) {
        const in_query = FROM_KOBE_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        return `${komutenId_KYORYOKU} in (${in_query})`;
    } else if (isGigConstructorID(komutenId)) {
        // workshipの工務店IDは 5\d{3,4} だが、komutenId like "5\d+" のような指定はできない。
        // 商品名であれば絞り込める
        return `${productName_KYORYOKU} in ("${productWorkship_KYORYOKU}")`;
    } else {
        return `${komutenId_KYORYOKU} = "${komutenId}"`;
    }
};

export const choiceNotifyMethod = ({ emailAddress, phoneNumber }) => {
    const isCellPhoneNumber = ((phoneNumber) => {
        if (!phoneNumber) return false;
        const num = phoneUtil.parseAndKeepRawInput(phoneNumber, "JP");
        return phoneUtil.isValidNumber(num)
            && /^0[9876]0/.test(phoneNumber.match(/\d/g).join(""));
    })(phoneNumber);

    let method = method_default_KYORYOKU;
    if (emailAddress) method = method_email_KYORYOKU;
    if (isCellPhoneNumber) method = method_sms_KYORYOKU;
    if (emailAddress && isCellPhoneNumber) method = method_both_KYORYOKU;
    if (!emailAddress && !isCellPhoneNumber) method = method_none_KYORYOKU;
    return method;
};
