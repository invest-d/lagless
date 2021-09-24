import { getSameKomutenKyoryokuCond } from "../logics_add_kyoryoku_master";
import { schema_88 } from "../../88/schema";
const customerFields = schema_88.fields.properties;
const komutenId_KYORYOKU = customerFields.工務店ID.code;
const productName_KYORYOKU = customerFields.商品名.code;

test("匠和美建の条件式", () => {
    for (const id of ["201", "202", "203"]) {
        expect(getSameKomutenKyoryokuCond(id))
            .toBe(`${komutenId_KYORYOKU} in ("201","202","203")`);
    }
});

test("軽バン.comの条件式", () => {
    for (const id of [
        "400",
        "401",
        "402",
        "403",
        "404",
    ]) {
        expect(getSameKomutenKyoryokuCond(id))
            .toBe(`${komutenId_KYORYOKU} in ("400","401","402","403","404")`);
    }
});

test("GIGの条件式", () => {
    for (const id of [
        "500",
        "5000",
        "501",
        "5001",
    ]) {
        expect(getSameKomutenKyoryokuCond(id))
            .toBe(`${productName_KYORYOKU} in ("Workship")`);
    }
});

test("一般の条件式", () => {
    for (const id of [
        "100",
        "200",
        "300",
    ]) {
        expect(getSameKomutenKyoryokuCond(id))
            .toBe(`${komutenId_KYORYOKU} = "${id}"`);
    }
});
