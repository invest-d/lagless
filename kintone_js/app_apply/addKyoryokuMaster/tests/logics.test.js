import { getNewLaborId } from "../logics";

test("5桁の協力会社IDのみがある", () => {
    const laborIds = [
        "10000",
        "10001",
        "10002",
        "11000",
        "11001",
        "11002",
    ];
    expect(getNewLaborId(laborIds)).toBe("12000");
});

test("6桁の協力会社IDを含む", () => {
    const laborIds = [
        "10000",
        "10001",
        "10002",
        "110000",
        "110001",
        "110002",
        "12000",
        "12001",
        "12002",
    ];
    expect(getNewLaborId(laborIds)).toBe("13000");
});

test("6桁の協力会社IDを含むその2", () => {
    const laborIds = [
        "10000",
        "10001",
        "10002",
        "11000",
        "11001",
        "11002",
        "120000",
        "120001",
        "120002",
    ];
    expect(getNewLaborId(laborIds)).toBe("13000");
});
