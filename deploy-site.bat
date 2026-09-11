@echo off
setlocal
cd /d "%~dp0"

echo Atualizando arquivos do GitHub...
git pull --ff-only
if errorlevel 1 goto erro_git

echo.
echo Verificando arquivos, JavaScript e catalogo...
node scripts\validate-site.js
if errorlevel 1 goto erro_validacao

echo.
echo Publicando no Firebase Hosting...
firebase deploy --only hosting --project promocoes-65707
if errorlevel 1 goto erro_firebase

echo.
echo Site publicado com sucesso.
echo https://promocoes-65707.web.app
pause
exit /b 0

:erro_git
echo.
echo ERRO: o GitHub possui alteracoes que nao puderam ser aplicadas automaticamente.
echo Nenhum deploy foi executado. Resolva o conflito antes de tentar novamente.
pause
exit /b 1

:erro_validacao
echo.
echo ERRO: a validacao encontrou um problema e bloqueou a publicacao.
echo Corrija o item indicado acima e tente novamente.
pause
exit /b 1

:erro_firebase
echo.
echo ERRO: o Firebase nao conseguiu publicar o site.
echo Os arquivos locais nao foram alterados.
pause
exit /b 1
