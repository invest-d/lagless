@echo off
chcp 65001

rem kintone����SMBC�`����csv�t�@�C�����o�͂���ɂ������ĕK�v�ɂȂ��s�����_�E�����[�h����B
rem �擾����npm install���Ďg��module�`����ϊ����Akintone�Ŏg����悤�Ƀt�@�C�����e��ҏW����B

if exist bank_info_raw.js del bank_info_raw.js
bitsadmin /transfer download_banks https://raw.githubusercontent.com/zengin-code/zengin-js/master/lib/zengin-data.js %CD%\bank_info_raw.js

if exist bank_info.js del bank_info.js

rem module.exports=�̐錾��const�̐錾�ɒu�����ăI�u�W�F�N�g�Ƃ��Ĉ�����悤�ɂ���
setlocal ENABLEDELAYEDEXPANSION
for /f "delims=" %%a in (bank_info_raw.js) do (
    set line=%%a
    echo !line:module.exports=const bank_info! >> bank_info.js
)
endlocal

if exist bank_info_raw.js del bank_info_raw.js
