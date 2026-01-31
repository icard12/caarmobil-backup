@echo off
title CAAR MOBIL - Iniciando Sistema...
echo Aguardando inicializacao do ambiente...
cd /d "%~dp0"

echo Iniciando o Servidor de Dados...
start /min cmd /c "npm run server"

echo Iniciando a Interface...
start /min cmd /c "npm run dev"

echo.
echo Sistema em inicializacao! 
echo O navegador abrira em breve...
echo Nao feche as janelas em segundo plano.
echo.
timeout /t 5
start http://localhost:5173
exit
