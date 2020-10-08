// PDF生成ライブラリ
const pdfMake = require("pdfmake");

// フォントは各ファミリーごとに4種類の定義が必要
// https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/vfs/
// > You should define all 4 components (even if they all point to the same font file).
export const PDF_FONTS = {
    default: {
        name: "default",
        family: {
            normal:      "Koruri-Light.ttf",
            bold:        "Koruri-Bold.ttf",
            italics:     "Koruri-Light.ttf",
            bolditalics: "Koruri-Bold.ttf"
        }
    }
};

const convertBlobToBase64 = (blob) => new Promise((resolve, reject) => {
    const reader = new FileReader;
    reader.onerror = reject;
    reader.onload = () => {
        resolve(reader.result.replace(/^data:text\/plain;([^,]+)?base64,/, ""));
    };
    reader.readAsDataURL(blob);
});

const build_font = async (key) => {
    const make_url = (name) => {
        return `https://firebasestorage.googleapis.com/v0/b/lagless.appspot.com/o/fonts%2F${  name  }?alt=media`;
    };

    if (!("vfs" in pdfMake)) {
        pdfMake.vfs = {};
    }

    const is_font_loaded = Object.values(PDF_FONTS[key]["family"]).every((name) => name in pdfMake.vfs);
    if (is_font_loaded) {
        console.log(`フォント "${key}" をダウンロード済みのため、設定をスキップします`);
        return;
    }

    // Object.values(obj)だと配列の順序が保証されないようなので、一つずつ記述する
    const font_requests = [
        fetch(make_url(PDF_FONTS[key]["family"]["normal"]))
            .then((response) => response.blob())
            .then(convertBlobToBase64),
        fetch(make_url(PDF_FONTS[key]["family"]["bold"]))
            .then((response) => response.blob())
            .then(convertBlobToBase64),
        fetch(make_url(PDF_FONTS[key]["family"]["italics"]))
            .then((response) => response.blob())
            .then(convertBlobToBase64),
        fetch(make_url(PDF_FONTS[key]["family"]["bolditalics"]))
            .then((response) => response.blob())
            .then(convertBlobToBase64)
    ];

    await Promise.all(font_requests)
        .then(([normal, bold, italics, bolditalics]) => {
            const new_vfs = {
                // base64よりあとのdata部分だけが必要
                [PDF_FONTS[key]["family"]["normal"]]:      normal.split("base64,")[1],
                [PDF_FONTS[key]["family"]["bold"]]:        bold.split("base64,")[1],
                [PDF_FONTS[key]["family"]["italics"]]:     italics.split("base64,")[1],
                [PDF_FONTS[key]["family"]["bolditalics"]]: bolditalics.split("base64,")[1],
            };
            Object.assign(pdfMake.vfs, new_vfs);

            pdfMake.fonts = {
                [PDF_FONTS[key]["name"]]: PDF_FONTS[key]["family"]
            };
        })
        .catch((err) => {
            console.log(err);
            throw new Error("フォントのダウンロード・設定中にエラーが発生しました。");
        });
};

export const createPdf = async (doc) => {
    await build_font(doc.defaultStyle.font);
    return await pdfMake.createPdf(doc);
};
