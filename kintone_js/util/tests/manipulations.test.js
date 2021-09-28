import { getUniqueCombinations } from "../manipulations";

test("2キーで重複を排除する", () => {
    const duplicated = [
        { hoge: "hoge1", foo: "foo1" },
        { hoge: "hoge1", foo: "foo1" },
        { hoge: "hoge1", foo: "foo2" },
        { hoge: "hoge2", foo: "foo1" },
        { hoge: "hoge2", foo: "foo1" },
        { hoge: "hoge3", foo: "foo1" },
    ];
    expect(getUniqueCombinations(duplicated, Object.keys(duplicated[0])))
        .toEqual([
            { hoge: "hoge1", foo: "foo1" },
            { hoge: "hoge1", foo: "foo2" },
            { hoge: "hoge2", foo: "foo1" },
            { hoge: "hoge3", foo: "foo1" },
        ]);
});

test("3キーで重複を排除する", () => {
    const duplicated = [
        { hoge: "hoge1", foo: "foo1", bar: "bar1" },
        { hoge: "hoge1", foo: "foo1", bar: "bar1" },
        { hoge: "hoge1", foo: "foo2", bar: "bar2" },
        { hoge: "hoge2", foo: "foo1", bar: "bar1" },
        { hoge: "hoge2", foo: "foo1", bar: "bar1" },
        { hoge: "hoge3", foo: "foo1", bar: "bar1" },
    ];
    expect(getUniqueCombinations(duplicated, ["hoge", "foo", "bar"]))
        .toEqual([
            { hoge: "hoge1", foo: "foo1", bar: "bar1" },
            { hoge: "hoge1", foo: "foo2", bar: "bar2" },
            { hoge: "hoge2", foo: "foo1", bar: "bar1" },
            { hoge: "hoge3", foo: "foo1", bar: "bar1" },
        ]);
});

test("指定したkeyだけをreturnに含む", () => {
    const duplicated = [
        { hoge: "hoge1", foo: "foo1", bar: "bar1" },
        { hoge: "hoge1", foo: "foo1", bar: "bar1" },
        { hoge: "hoge1", foo: "foo1", bar: "bar2" }, // not dupl for 3 keys
        { hoge: "hoge1", foo: "foo2", bar: "bar2" },
        { hoge: "hoge2", foo: "foo1", bar: "bar1" },
        { hoge: "hoge2", foo: "foo1", bar: "bar2" }, // not dupl for 3 keys
        { hoge: "hoge3", foo: "foo1", bar: "bar1" },
    ];
    expect(getUniqueCombinations(duplicated, ["hoge", "foo"]))
        .toEqual([
            { hoge: "hoge1", foo: "foo1" },
            { hoge: "hoge1", foo: "foo2" },
            { hoge: "hoge2", foo: "foo1" },
            { hoge: "hoge3", foo: "foo1" },
        ]);
});
