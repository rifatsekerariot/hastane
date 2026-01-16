# GitHub'a Yükleme Scripti
$ErrorActionPreference = "Stop"

Write-Host "GitHub'a Yükleme İşlemi Başlatılıyor..." -ForegroundColor Green

# 1. Git'i Kontrol Et
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Error "Git yüklü değil! Lütfen önce Git'i yükleyin: https://git-scm.com/"
    exit 1
}

# 2. Git Init
if (-not (Test-Path ".git")) {
    Write-Host "Git repository başlatılıyor..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 3. Dosyaları Ekle
Write-Host "Dosyalar ekleniyor..." -ForegroundColor Yellow
git add .

# 4. Commit
$commitMsg = Read-Host "Commit mesajını girin (Varsayılan: 'Initial commit')"
if ([string]::IsNullOrWhiteSpace($commitMsg)) {
    $commitMsg = "Initial commit"
}
git commit -m "$commitMsg"

# 5. Remote URL Kontrolü ve Ekleme
$remotes = git remote
if (-not $remotes) {
    $repoUrl = Read-Host "GitHub Repository URL'sini girin (Örn: https://github.com/kullanici/repo.git)"
    if ([string]::IsNullOrWhiteSpace($repoUrl)) {
        Write-Error "Repository URL'si girilmedi. İşlem iptal edildi."
        exit 1
    }
    git remote add origin $repoUrl
} else {
    Write-Host "Mevcut remote bulundu." -ForegroundColor Cyan
}

# 6. Push
Write-Host "GitHub'a gönderiliyor..." -ForegroundColor Yellow
try {
    git push -u origin main
    Write-Host "Başarıyla yüklendi!" -ForegroundColor Green
} catch {
    Write-Error "Yükleme sırasında hata oluştu. Lütfen repo URL'sinin doğru olduğundan ve yetkiniz olduğundan emin olun."
    Write-Host "Hata Detayı: $_" -ForegroundColor Red
}
