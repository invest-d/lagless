@echo off
chcp 65001

rem kintoneからSMBC形式でcsvファイルを出力するにあたって必要になる銀行情報をダウンロードする。
rem 取得元のnpm installして使うmodule形式を変換し、kintoneで使えるようにファイル内容を編集する。

if exist bank_info_raw.js del bank_info_raw.js
bitsadmin /transfer download_banks https://raw.githubusercontent.com/zengin-code/zengin-js/master/lib/zengin-data.js %CD%\bank_info_raw.js

if exist bank_info.js del bank_info.js

rem module.exports=の宣言をconstの宣言に置換してオブジェクトとして扱えるようにする
setlocal ENABLEDELAYEDEXPANSION
for /f "delims=" %%a in (bank_info_raw.js) do (
    set line=%%a
    echo !line:module.exports=const bank_info! >> bank_info.js
)
endlocal

if exist bank_info_raw.js del bank_info_raw.js
