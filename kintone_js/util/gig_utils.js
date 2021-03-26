export const GIG_ID = "500";

export const isGigConstructorID = (constructor_id) => {
    // 工務店ID 500番台 or 5000番台
    return /^5\d{2,3}$/g.test(constructor_id);
};
