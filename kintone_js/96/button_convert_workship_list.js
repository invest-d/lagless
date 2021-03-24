/*
    Version 1
    Workshipで保存したhtmlファイルを解析して、
    kintone工務店マスタに取り込み可能なcsvファイルを生成する。
*/

const execute_button_id = "convertWorkshipList";
const execute_button_title = "Workship企業リストを変換";
const file_input_id = "workshipDataHtmlInput";
const process_button_id = "processWorkshipList";
const process_button_title = "実行";
const cancel_button_id = "cancelConvertWorkshipList";
const cancel_button_title = "キャンセル";

const workship_theme_color = "#59afa9";
const target_mime = "text/html";

export const needShow = () => {
    // 増殖バグ防止
    return document.getElementById(execute_button_id) === null
        && document.getElementById(cancel_button_id) === null;
};

export const createExecuteButton = () => {
    return createButton(execute_button_id, execute_button_title, clickExecuteButton);
};

export const createFileInput = () => {
    const input = document.createElement("input");
    input.id = file_input_id;
    input.accept = target_mime;
    input.type = "file";
    input.style.display = "none";
    return input;
};

export const createProcessButton = () => {
    const process_button = createButton(process_button_id, process_button_title, clickProcessButton);
    process_button.style.display = "none";
    process_button.style.backgroundColor = workship_theme_color;
    return process_button;
};

export const createCancelButton = () => {
    const cancel_button = createButton(cancel_button_id, cancel_button_title, clickCancelButton);
    cancel_button.style.display = "none";
    cancel_button.style.backgroundColor = workship_theme_color;
    return cancel_button;
};

const createButton = (button_name, button_title, click_event) => {
    const button = document.createElement("button");
    button.id = button_name;
    button.innerText = button_title;
    button.addEventListener("click", click_event);
    return button;
};

const clickExecuteButton = () => {
    document.getElementById(cancel_button_id).style.display = "inline";
    document.getElementById(file_input_id).style.display = "inline";
    document.getElementById(process_button_id).style.display = "inline";
    document.getElementById(execute_button_id).style.display = "none";
};

const clickCancelButton = () => {
    document.getElementById(execute_button_id).style.display = "inline";
    document.getElementById(file_input_id).style.display = "none";
    document.getElementById(process_button_id).style.display = "none";
    document.getElementById(cancel_button_id).style.display = "none";
};

const clickProcessButton = () => {
    // inputに入力されたファイル内容を読み取る
    const reader = new FileReader();
    const files = document.getElementById(file_input_id).files;
    reader.readAsText(files[0]);
    reader.onload = (event) => {
        console.log(event.target.result);
        alert("読み込みが完了しました（consoleに出力済み");
    };
    reader.onerror = () => {
        alert(`読み込みに失敗しました\n\n${reader.error}`);
    };

    // キャンセルボタンをクリックした時のように、初期状態に戻す
    clickCancelButton();
};
