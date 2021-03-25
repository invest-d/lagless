/*
    kintone上でcsvファイルを作ってダウンロードするときのロジックをまとめた
*/

// CSVファイルで保存するにあたってShift-Jisに変換する
const Encoding = require("encoding-japanese");

export const encodeToSjis = (csv_data) => {
    // 1文字ずつ格納
    const unicode_list = [];
    for (let i = 0; i < csv_data.length; i++) {
        unicode_list.push(csv_data.charCodeAt(i));
    }

    // 1文字ずつSJISに変換する
    return Encoding.convert(unicode_list, "sjis", "unicode");
};

// 生成したデータをCSVファイルとしてローカルにダウンロードする。
export const downloadFile = (sjis_code_list, file_name) => {
    const uint8_list = new Uint8Array(sjis_code_list);
    const write_data = new Blob([uint8_list], { type: "text/csv" });

    // 保存
    const download_link = document.createElement("a");
    download_link.download = file_name;
    download_link.href = (window.URL || window.webkitURL).createObjectURL(write_data);

    // DLリンクを生成して自動でクリックまでして、生成したDLリンクはその都度消す
    kintone.app.getHeaderMenuSpaceElement().appendChild(download_link);
    setText(download_link, "download csv");
    download_link.click();
    kintone.app.getHeaderMenuSpaceElement().removeChild(download_link);
};

const setText = (element,str) => {
    if(element.textContent !== undefined){
        element.textContent = str;
    }
    if(element.innerText !== undefined){
        element.innerText = str;
    }
};
