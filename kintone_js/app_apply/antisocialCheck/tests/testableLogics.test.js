import {
    getTransactionType,
    getSearchQuery,
} from "../testableLogics";

test("WFIの場合に支払企業を返す", () => {
    for (const id of ["400", "401", "402", "403", "404"]) {
        const applicant = {
            constructorId: id,
        };
        expect(getTransactionType(applicant)).toBe("支払企業");
    }
});

test("その他の場合に譲渡企業を返す", () => {
    for (const id of ["100", "201", "303", "500", "501", "5001", "606"]) {
        const applicant = {
            constructorId: id,
        };
        expect(getTransactionType(applicant)).toBe("譲渡企業");
    }
});

test("単一条件クエリ", () => {
    expect(getSearchQuery({
        name: "テストカンパニー",
    })).toBe('(法人名・屋号 = "テストカンパニー")');
});

test("複数条件クエリ", () => {
    expect(getSearchQuery({
        name: "テストカンパニー",
        phone: "090-1234-5678",
    })).toBe('(法人名・屋号 = "テストカンパニー") or (TEL_本店 = "090-1234-5678")');
});
