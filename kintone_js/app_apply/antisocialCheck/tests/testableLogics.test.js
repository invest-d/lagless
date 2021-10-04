import {
    getTransactionType,
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
