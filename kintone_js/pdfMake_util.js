// PDF生成ライブラリ
export const pdfMake = require("pdfmake");
const PDF_FONT_NAME = "Koruri";

const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result.replace(/^data:text\/plain;([^,]+)?base64,/, ""));
    };
    reader.readAsDataURL(blob);
});

const build_font = async () => {
    const make_url = (name) => {
        return `https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/fonts%2F${  name  }?alt=media`;
    };

    if (pdfMake.vfs && pdfMake.vfs["Koruri-Light.ttf"] && pdfMake.vfs["Koruri-Bold.ttf"]) {
        console.log("フォントをダウンロード済みのため、設定をスキップします");
        return;
    }

    await Promise.all([
        fetch(make_url("Koruri-Light.ttf"))
            .then((response) => response.blob())
            .then(convertBlobToBase64),
        fetch(make_url("Koruri-Bold.ttf"))
            .then((response) => response.blob())
            .then(convertBlobToBase64),
    ])
        .then((result) => {
            pdfMake.vfs = {
            // base64よりあとのdata部分だけが必要
                "Koruri-Light.ttf": result[0].split("base64,")[1],
                "Koruri-Bold.ttf": result[1].split("base64,")[1],
            };
            pdfMake.fonts = {
                [PDF_FONT_NAME]: {
                    normal: "Koruri-Light.ttf",
                    bold: "Koruri-Bold.ttf",
                }
            };
        })
        .catch((err) => {
            console.log(err);
            throw new Error("フォントのダウンロード・設定中にエラーが発生しました。");
        });
};

(() => {
    build_font();
    pdfMake.builded_font = PDF_FONT_NAME;
})();
