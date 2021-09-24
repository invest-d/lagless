"use strict";

import { isGigConstructorID } from "../util/gig_utils";
import {
    KE_BAN_CONSTRUCTORS,
    SHOWA_CONSTRUCTORS,
} from "../96/common";

import { schema_88 } from "../88/schema";
const customerFields = schema_88.fields.properties;
const komutenId_KYORYOKU        = customerFields.工務店ID.code;
const productName_KYORYOKU      = customerFields.商品名.code;
const productWorkship_KYORYOKU  = customerFields.商品名.options.Workship.label;

export const getSameKomutenKyoryokuCond = (komutenId) => {
    if (SHOWA_CONSTRUCTORS.includes(komutenId)) {
        const in_query = SHOWA_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        return `${komutenId_KYORYOKU} in (${in_query})`;
    } else if (KE_BAN_CONSTRUCTORS.includes(komutenId)) {
        const in_query = KE_BAN_CONSTRUCTORS.map((c) => `"${c}"`).join(",");
        return `${komutenId_KYORYOKU} in (${in_query})`;
    } else if (isGigConstructorID(komutenId)) {
        // workshipの工務店IDは 5\d{3,4} だが、komutenId like "5\d+" のような指定はできない。
        // 商品名であれば絞り込める
        return `${productName_KYORYOKU} in ("${productWorkship_KYORYOKU}")`;
    } else {
        return `${komutenId_KYORYOKU} = "${komutenId}"`;
    }
};
