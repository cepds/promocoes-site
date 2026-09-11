@echo off
cd /d "%~dp0"
echo Atualizando arquivos do GitHub...
git pull
if errorlevel 1 goto erro
echo.
echo Publicando no Firebase Hosting...
firebase deploy --only hosting --project promocoes-65707
if errorlevel 1 goto erro
echo.
echo Site publicado com sucesso.
echo https://promocoes-65707.web.app
pause
exit /b 0
:erro
echo.
echo Ocorreu um erro. Confira as mensagens acima.
pause
exit /b 1
