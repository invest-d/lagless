rem kintone上でSMBC向け振込データを作成する際に必要な銀行情報を更新する。
rem オリジナルのコードはnpm installして使うものなので、kintoneのjsに埋め込んで使えるように内容を一部書き換える

@echo off
chcp 65001
bitsadmin /transfer download_banks https://raw.githubusercontent.com/zengin-code/zengin-js/master/lib/zengin-data.js %CD%\bank_info_raw.js

if exist bank_info.js del bank_info.js

rem module.exports=での宣言をconst変数での宣言に変えて、オブジェクトとして使えるようにする
setlocal ENABLEDELAYEDEXPANSION
for /f "delims=" %%a in (bank_info_raw.js) do (
    set line=%%a
    echo !line:module.exports=const bank_info! >> bank_info.js
)
endlocal
