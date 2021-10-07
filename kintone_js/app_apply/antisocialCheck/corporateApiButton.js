import { request } from "./corporateApi";
import { cleansedPref, reprData } from "./testableLogics";
import { CLIENT } from "../../util/kintoneAPI";
import { replaceFullWidthNumbers } from "../../util/manipulations";
import { schema_61 } from "../../61/schema";
const corporateWebApi = "97";
const idField_CREDS = schema_61.fields.properties.ID.code;

(function () {
    // eslint-disable-next-line no-unused-vars
    kintone.events.on("app.record.detail.show", (event) => {
        kintone.app.record.getHeaderMenuSpaceElement().appendChild(createButton());
    });
})();

const buttonId = "sandbox";
const buttonTitle = "サンドボックス";
const createButton = () => {
    const button = document.createElement("button");
    button.id = buttonId;
    button.innerText = buttonTitle;
    button.addEventListener("click", clickButton);
    return button;
};

const clickButton = async () => {
    const cred = await CLIENT.record.getRecord({
        app: schema_61.id.appId,
        id: corporateWebApi
    });
    const conds = {
        "id": cred.record[idField_CREDS].value,
        "name": prompt("検索する会社名を入力"),
        "type": "02",
        "mode": "2",
        "target": "1",
    };
    const pref = cleansedPref(prompt("検索する都道府県名を入力"));
    if (pref) conds.address = jisx0401[pref];
    const { summary, data } = await request(conds);
    console.log(summary);
    console.log(data);

    if (Number(summary.総件数) === 0) {
        alert("データが見つかりませんでした");
    } else if (Number(summary.総件数) === 1) {
        const message = "データが見つかりました。このデータで進めてよろしいですか？"
            + `${reprData(data[0])}`;
        if (confirm(message)) alert(`法人番号: ${data[0].法人番号13桁}で確定しました。`);
    } else if (Number(summary.総件数) > 1) {
        const message = "複数のデータが見つかりました。使用するデータの「結果番号」を入力してください。\n"
            + `${data.map((d) => reprData(d)).join("\n\n")}`;
        const resultNum = Number(replaceFullWidthNumbers(prompt(message)));
        alert(`結果番号: ${resultNum}の法人番号: ${data[resultNum-1].法人番号13桁}で確定しました。`);
    } else {
        alert("不明なエラーが発生しました");
    }
};

const jisx0401 = {
    "群馬": "10",
    "埼玉": "11",
    "千葉": "12",
    "東京": "13",
    "神奈川": "14",
    "新潟": "15",
    "富山": "16",
    "石川": "17",
    "福井": "18",
    "山梨": "19",
    "長野": "20",
    "岐阜": "21",
    "静岡": "22",
    "愛知": "23",
    "三重": "24",
    "滋賀": "25",
    "京都": "26",
    "大阪": "27",
    "兵庫": "28",
    "奈良": "29",
    "和歌山": "30",
    "鳥取": "31",
    "島根": "32",
    "岡山": "33",
    "広島": "34",
    "山口": "35",
    "徳島": "36",
    "香川": "37",
    "愛媛": "38",
    "高知": "39",
    "福岡": "40",
    "佐賀": "41",
    "長崎": "42",
    "熊本": "43",
    "大分": "44",
    "宮崎": "45",
    "鹿児島": "46",
    "沖縄": "47",
    "北海": "01",
    "青森": "02",
    "岩手": "03",
    "宮城": "04",
    "秋田": "05",
    "山形": "06",
    "福島": "07",
    "茨城": "08",
    "栃木": "09",
};
