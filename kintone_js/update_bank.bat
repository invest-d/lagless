rem kintone上でSMBC向け振込データを作成する際に必要な銀行情報を更新する。

@echo off
chcp 65001
bitsadmin /transfer download_banks https://raw.githubusercontent.com/zengin-code/zengin-js/master/lib/zengin-data.js %CD%\bank_info_raw.js

if exist bank_info.js del bank_info.js

setlocal ENABLEDELAYEDEXPANSION
for /f "delims=" %%a in (bank_info_raw.js) do (
    set line=%%a
    echo !line:module.exports=const bank_info! >> bank_info.js
)
endlocal
