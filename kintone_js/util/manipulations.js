export const replaceFullWidthNumbers = (str) => {
    return str.replace(/[\uff10-\uff19]/g, (s) => {
        return String.fromCharCode(s.charCodeAt(0) - 65248);
    });
};
