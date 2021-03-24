/*
    Version 1
    Workshipで保存したhtmlファイルを解析して、
    kintone工務店マスタに取り込み可能なcsvファイルを生成する。
*/

const execute_button_id = "convertWorkshipList";
const execute_button_title = "Workship企業リストを変換";
const file_input_id = "workshipDataHtmlInput";
const cancel_button_id = "cancelConvertWorkshipList";
const cancel_button_title = "キャンセル";

const workship_theme_color = "#59afa9";

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
    input.accept = "text/html";
    input.type = "file";
    input.style.display = "none";
    return input;
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
    document.getElementById(execute_button_id).style.display = "none";
};

const clickCancelButton = () => {
    document.getElementById(execute_button_id).style.display = "inline";
    document.getElementById(file_input_id).style.display = "none";
    document.getElementById(cancel_button_id).style.display = "none";
};
