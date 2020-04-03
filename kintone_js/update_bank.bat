rem kintone���SMBC�����U���f�[�^���쐬����ۂɕK�v�ȋ�s�����X�V����B
rem �I���W�i���̃R�[�h��npm install���Ďg�����̂Ȃ̂ŁAkintone��js�ɖ��ߍ���Ŏg����悤�ɓ��e���ꕔ����������

@echo off
if exist bank_info_raw.js del bank_info_raw.js
chcp 65001
bitsadmin /transfer download_banks https://raw.githubusercontent.com/zengin-code/zengin-js/master/lib/zengin-data.js %CD%\bank_info_raw.js

if exist bank_info.js del bank_info.js

rem module.exports=�ł̐錾��const�ϐ��ł̐錾�ɕς��āA�I�u�W�F�N�g�Ƃ��Ďg����悤�ɂ���
setlocal ENABLEDELAYEDEXPANSION
for /f "delims=" %%a in (bank_info_raw.js) do (
    set line=%%a
    echo !line:module.exports=const bank_info! >> bank_info.js
)
endlocal

if exist bank_info_raw.js del bank_info_raw.js
