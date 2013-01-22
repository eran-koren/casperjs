@ECHO OFF
set CASPER_PATH=%~dp0..\casper
set CASPER_BIN=%CASPER_PATH%\bin\
set ARGV=%*
call %~dp0..\phantom\phantomjs.exe "%CASPER_BIN%bootstrap.js" --casper-path="%CASPER_PATH%" --cli %ARGV%