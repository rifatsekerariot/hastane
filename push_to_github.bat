@echo off
setlocal
title GitHub'a Yukleme Araci
color 0A

echo ==========================================
echo    GITHUB YUKLEME ARACI - v3.1
echo ==========================================
echo.

:: 1. Git ve Init Kontrolu
where git >nul 2>nul
if %errorlevel% neq 0 (
    color 0C
    echo [HATA] Git yuklu degil.
    pause
    exit /b 1
)

if not exist ".git" (
    git init
    echo [BILGI] Git repo baslatildi.
)
git branch -M main

:: 2. REMOTE URL GIRISI
echo.
echo ------------------------------------------
echo 1. ADIM: HEDEF REPOSITORY BELIRLEME
echo ------------------------------------------
echo Mevcut Adres (Varsa):
git remote get-url origin 2>nul
echo.

set "repoUrl="
echo Lutfen GitHub Repository Linkini giriniz:
echo (Ornek: https://github.com/kullanici/repo.git)
echo [NOT: Mevcut adresi korumak icin BOS gecip ENTER'a basin]
set /p "repoUrl=> "

if defined repoUrl (
    git remote | find "origin" >nul
    if %errorlevel% equ 0 (
        git remote set-url origin %repoUrl%
    ) else (
        git remote add origin %repoUrl%
    )
    echo [BILGI] Hedef adres guncellendi.
)

:: 3. YUKLEME ISLEMLERI
echo.
echo ------------------------------------------
echo 2. ADIM: DOSYALAR HAZIRLANIYOR
echo ------------------------------------------

:: node_modules temizligi (Git index'ten siler, dosyalari silmez)
if exist "frontend/node_modules" (
    echo [BILGI] node_modules takibi kaldiriliyor...
    git rm -r --cached frontend/node_modules >nul 2>nul
    git rm -r --cached backend/node_modules >nul 2>nul
)

echo [1/3] Dosyalar ekleniyor...
git add .

echo [2/3] Kaydediliyor (Commit)...
git commit -m "Proje Guncellemesi" >nul 2>nul

echo [3/3] Sunucuya gonderiliyor (Push)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo [BASARILI] Proje GitHub'a yuklendi!
) else (
    color 0C
    echo.
    echo [HATA] Yukleme sirasinda hata olustu.
    echo Lutfen verdiginiz linki kontrol edin.
)

echo.
pause
