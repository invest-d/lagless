const functions = require("firebase-functions");
const axios = require("axios");

const halvedWidth = (input_string) => {
    // 全銀形式で使用可能な文字を半角に変換する。使用不可能な文字を受け取った場合はエラーとする。
    // 特に、ダブルクォーテーションは使用不可能。
    const zenkaku_array = [
        "ア","イ","ウ","エ","オ","カ","キ","ク","ケ","コ"
        ,"サ","シ","ス","セ","ソ","タ","チ","ツ","テ","ト"
        ,"ナ","ニ","ヌ","ネ","ノ","ハ","ヒ","フ","ヘ","ホ"
        ,"マ","ミ","ム","メ","モ","ヤ","ユ","ヨ"
        ,"ラ","リ","ル","レ","ロ","ワ","ヰ","ヱ","ヲ","ン"
        ,"ガ","ギ","グ","ゲ","ゴ","ザ","ジ","ズ","ゼ","ゾ"
        ,"ダ","ヂ","ヅ","デ","ド","バ","ビ","ブ","ベ","ボ"
        ,"ヴ"
        ,"パ","ピ","プ","ペ","ポ"
        ,"ァ","ィ","ゥ","ェ","ォ","ャ","ュ","ョ","ッ"
        ,"ｧ","ｨ","ｩ","ｪ","ｫ","ｬ","ｭ","ｮ","ｯ" // もともと半角なのに拗音・促音が使用不可としてエラーになるのを防ぐ
        ,"゛","°","、","。","「","」","ー","・","（","）","￥","／","．"
        ,"－","‐","―","─","━"
        ,"Ａ","Ｂ","Ｃ","Ｄ","Ｅ","Ｆ","Ｇ","Ｈ","Ｉ","Ｊ","Ｋ","Ｌ","Ｍ","Ｎ","Ｏ","Ｐ","Ｑ","Ｒ","Ｓ","Ｔ","Ｕ","Ｖ","Ｗ","Ｘ","Ｙ","Ｚ"
        ,"ａ","ｂ","ｃ","ｄ","ｅ","ｆ","ｇ","ｈ","ｉ","ｊ","ｋ","ｌ","ｍ","ｎ","ｏ","ｐ","ｑ","ｒ","ｓ","ｔ","ｕ","ｖ","ｗ","ｘ","ｙ","ｚ"
        ,"０","１","２","３","４","５","６","７","８","９"
        ,"　"
    ];

    const hankaku_array = [
        "ｱ","ｲ","ｳ","ｴ","ｵ","ｶ","ｷ","ｸ","ｹ","ｺ"
        ,"ｻ","ｼ","ｽ","ｾ","ｿ","ﾀ","ﾁ","ﾂ","ﾃ","ﾄ"
        ,"ﾅ","ﾆ","ﾇ","ﾈ","ﾉ","ﾊ","ﾋ","ﾌ","ﾍ","ﾎ"
        ,"ﾏ","ﾐ","ﾑ","ﾒ","ﾓ","ﾔ","ﾕ","ﾖ"
        ,"ﾗ","ﾘ","ﾙ","ﾚ","ﾛ","ﾜ","ｲ","ｴ","ｦ","ﾝ"
        ,"ｶﾞ","ｷﾞ","ｸﾞ","ｹﾞ","ｺﾞ","ｻﾞ","ｼﾞ","ｽﾞ","ｾﾞ","ｿﾞ"
        ,"ﾀﾞ","ﾁﾞ","ﾂﾞ","ﾃﾞ","ﾄﾞ","ﾊﾞ","ﾋﾞ","ﾌﾞ","ﾍﾞ","ﾎﾞ"
        ,"ｳﾞ"
        ,"ﾊﾟ","ﾋﾟ","ﾌﾟ","ﾍﾟ","ﾎﾟ"
        ,"ｱ","ｲ","ｳ","ｴ","ｵ","ﾔ","ﾕ","ﾖ","ﾂ"
        ,"ｱ","ｲ","ｳ","ｴ","ｵ","ﾔ","ﾕ","ﾖ","ﾂ"
        ,"ﾞ","ﾟ",",",".","｢","｣","-"," ","(",")","\\","/","." //中黒は使用不可能なのでスペースにする。
        ,"-","-","-","-","-"
        ,"A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z"
        ,"a","b","c","d","e","f","g","h","i","j","k","l","m","n","o","p","q","r","s","t","u","v","w","x","y","z"
        ,"0","1","2","3","4","5","6","7","8","9"
        ," "
    ];

    let converted_han = "";

    for (let i = 0; i < input_string.length; i++) {
        const input_char = input_string.charAt(i);
        if (hankaku_array.includes(input_char)) {
            // 元々半角文字だったらそのまま使う
            converted_han += input_char;
        } else if (zenkaku_array.includes(input_char)) {
            // 使えるけど全角の文字は半角にして使う
            converted_han += hankaku_array[zenkaku_array.indexOf(input_char)];
        } else {
            // 使えない文字はエラー
            throw new Error(`振込データに使用できない文字が含まれています：${input_string}`);
        }
    }

    return converted_han;
};

/**
 * @typedef {Object} Conds - https://www.houjin-bangou.nta.go.jp/documents/k-web-api-kinou-gaiyo.pdf page25
 * @property {string} id - userId
 * @property {string} name - 商号または法人名
 * @property {"01"|"02"|"12"} type - 01: S-JIS CSV, 02: Unicode CSV, 12: Unicode XML
 * @property {"1"|"2"} [mode="1"] - 1: 前方一致, 2: 部分一致
 * @property {"1"|"2"|"3"} [target="1"] - 1: あいまい検索, 2: 完全一致検索, 3: 英語表記登録情報検索
 * @property {"string"} [address] - JISX0401単体か、JISX0401とJISX0402を結合した文字列か、国外を示す"99"。JIS規格番号の詳細については https://www.jisc.go.jp/app/jis/general/GnrJISSearch.html で確認可能。
 * @property {"01"|"02"|"03"|"04"} [kind] - 01: 国の機関, 02: 地方公共団体, 03: 設立登記法人, 04: 外国会社等・その他, 未指定の場合は全て検索
 * @property {"0"|"1"} [change="0"] - 0: 変更履歴を含めない, 1: 変更履歴を含める
 * @property {"0"|"1"} [close="1"] - 0: 登記記録の閉鎖等を含めない, 1: 登記記録の閉鎖等を含める
 * @property {string} [from] - YYYY-MM-DD 法人番号指定年月日
 * @property {string} [to] - YYYY-MM-DD 法人番号指定年月日
 * @property {string} [divide="1"] - 1 - 99999 分割番号
 */

/**
* @summary condsの中のnameに関して、APIにリクエストできる形に変換した新たなオブジェクトを返す
* @param {Conds} conds
* @return {Conds}
*/
const normalized = (conds) => {
    /** @type {Conds} */
    const newConds = JSON.parse(JSON.stringify(conds));
    const needsHalfWidthName = newConds.target == "3";
    if (needsHalfWidthName) newConds.name = halvedWidth(newConds.name);

    // TODO: 更に追加で、conds.targetが"1"の場合は法人種別を除く処理が必要。
    // しかしconds.targetはもっぱら"2"を利用するため、当面は見送り。
    return newConds;
};

exports.searchCorporateByName = functions.https.onRequest(async (req, res) => {
    res.set("Access-Control-Allow-Origin", process.env.kintone_server);

    const api = "https://api.houjin-bangou.nta.go.jp";
    const searchByName = "/4/name";
    /** @type {Conds} */
    const conds = JSON.parse(req.body).conds;
    const params = new URLSearchParams(normalized(conds));
    const url = `${api + searchByName}?${params.toString()}`;

    try {
        const response = await axios(url);
        const result = response.data;
        console.log(result);
        res.status(200).json(result);
    } catch (err) {
        console.error(err);
        res.status(400).json({
            message: "failed fetch"
        });
    }
});
