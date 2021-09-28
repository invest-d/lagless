import { detectApp, UnknownAppError } from "../choiceApplyAppSchema";

test("159を渡すと開発判定になる", () => {
    expect(detectApp(159)).toBe("dev");
});

test("161を渡すと本番判定になる", () => {
    expect(detectApp(161)).toBe("prod");
});

test("不明なidを渡すと例外をthrowする", () => {
    const detectError = () => detectApp(99);
    expect(detectError).toThrowError(UnknownAppError);
});

test("nullを渡すと例外をthrowする", () => {
    const detectError = () => detectApp(null);
    expect(detectError).toThrowError(UnknownAppError);
});
