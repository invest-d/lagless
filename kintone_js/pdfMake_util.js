// PDF生成ライブラリ
const pdfMake = require("pdfmake");

// フォントは各ファミリーごとに4種類の定義が必要
// https://pdfmake.github.io/docs/0.1/fonts/custom-fonts-client-side/vfs/
// > You should define all 4 components (even if they all point to the same font file).
export const PDF_FONTS = {
    Koruri: {
        normal:      "Koruri-Light.ttf",
        bold:        "Koruri-Bold.ttf",
        italics:     "Koruri-Light.ttf",
        bolditalics: "Koruri-Bold.ttf"
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

    const is_font_loaded = Object.values(PDF_FONTS[key]).every((name) => name in pdfMake.vfs);
    if (is_font_loaded) {
        console.log(`フォント "${key}" をダウンロード済みのため、設定をスキップします`);
        return;
    }

    // 同じファイルを重複してリクエストしないよう、Setでフォント名の重複を取り除く
    const font_requests = Array.from(new Set(Object.values(PDF_FONTS[key])))
        .map((name) => {
            return fetch(make_url(name))
                .then((response) => response.blob())
                .then(convertBlobToBase64)
                .then((b) => { return {"base64": b, "name": name}; });
        });

    await Promise.all(font_requests)
        .then((results) => {
            const new_vfs = {};
            for (const family of Object.keys(PDF_FONTS[key])) {
                // base64よりあとのdata部分だけが必要
                new_vfs[PDF_FONTS[key][family]] = results.find((r) => r.name === PDF_FONTS[key][family]).base64.split("base64,")[1];
            }
            Object.assign(pdfMake.vfs, new_vfs);

            pdfMake.fonts = {
                [key]: PDF_FONTS[key]
            };
        })
        .catch((err) => {
            console.log(err);
            throw new Error("フォントのダウンロード・設定中にエラーが発生しました。");
        });
};

export const createPdf = async (doc) => {
    await build_font(doc.defaultStyle.font);
    return pdfMake.createPdf(doc, null, pdfMake.fonts, pdfMake.vfs);
};
