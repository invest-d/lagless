import { normalizedConstructorId } from "../common";

test("一般の正規化", () => {
    for (const id of ["101", "202", "303"]) {
        expect(normalizedConstructorId(id)).toBe(id);
    }
});

test("軽バン.comの正規化", () => {
    for (const id of [
        "400",
        "401",
        "402",
        "403",
        "404",
    ]) {
        expect(normalizedConstructorId(id)).toBe("400");
    }
});

test("GIGの正規化", () => {
    for (const id of [
        "500",
        "5000",
        "501",
        "5001",
    ]) {
        expect(normalizedConstructorId(id)).toBe("500");
    }
});
