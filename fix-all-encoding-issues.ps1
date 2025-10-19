# Comprehensive UTF-16/BOM Encoding Fix Script for Hope Backend
# Finds and fixes ALL files with encoding issues

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Comprehensive Encoding Fix for Hope Backend" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$backendRoot = "Hope-backend"

if (-not (Test-Path $backendRoot)) {
    Write-Host "ERROR: Hope-backend directory not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Scanning for files with encoding issues..." -ForegroundColor Yellow

# Find all .ts files with BOM or UTF-16 encoding
$corruptedFiles = Get-ChildItem -Path $backendRoot\src -Filter "*.ts" -Recurse | Where-Object {
    try {
        $bytes = Get-Content $_.FullName -Encoding Byte -TotalCount 3 -ErrorAction Stop
        # Check for UTF-16 BOM (FF FE or FE FF) or UTF-8 BOM (EF BB BF)
        (($bytes[0] -eq 255 -and $bytes[1] -eq 254) -or 
         ($bytes[0] -eq 254 -and $bytes[1] -eq 255) -or 
         ($bytes[0] -eq 239 -and $bytes[1] -eq 187))
    } catch {
        $false
    }
}

if ($corruptedFiles.Count -eq 0) {
    Write-Host "No files with encoding issues found!" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($corruptedFiles.Count) files with encoding issues:" -ForegroundColor Yellow
$corruptedFiles | ForEach-Object { Write-Host "  - $($_.FullName)" -ForegroundColor Gray }
Write-Host ""

$fixed = 0
$failed = 0

foreach ($file in $corruptedFiles) {
    $relativePath = $file.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "Fixing: $relativePath" -ForegroundColor White
    
    try {
        # Create backup
        $backupPath = "$($file.FullName).bak"
        Copy-Item $file.FullName $backupPath -Force
        
        # Read content
        $content = Get-Content $file.FullName -Raw -ErrorAction Stop
        
        # Check if file has content
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-Host "  [SKIP] File is empty" -ForegroundColor Yellow
            Remove-Item $backupPath -Force
            continue
        }
        
        # Write with UTF-8 no BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        
        # Verify
        $bytes = Get-Content $file.FullName -Encoding Byte -TotalCount 3
        $hasBOM = (($bytes[0] -eq 255 -and $bytes[1] -eq 254) -or 
                   ($bytes[0] -eq 254 -and $bytes[1] -eq 255) -or 
                   ($bytes[0] -eq 239 -and $bytes[1] -eq 187))
        
        if (-not $hasBOM) {
            Write-Host "  [SUCCESS] Fixed" -ForegroundColor Green
            Remove-Item $backupPath -Force -ErrorAction SilentlyContinue
            $fixed++
        } else {
            Write-Host "  [ERROR] Verification failed" -ForegroundColor Red
            Copy-Item $backupPath $file.FullName -Force
            Remove-Item $backupPath -Force
            $failed++
        }
    }
    catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        if (Test-Path $backupPath) {
            Copy-Item $backupPath $file.FullName -Force
            Remove-Item $backupPath -Force
        }
        $failed++
    }
}

Write-Host ""
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Fixed: $fixed | Failed: $failed" -ForegroundColor $(if ($failed -gt 0) { "Yellow" } else { "Green" })
Write-Host "==================================================" -ForegroundColor Cyan

if ($fixed -gt 0) {
    Write-Host ""
    Write-Host "Testing backend compilation..." -ForegroundColor Yellow
    cd Hope-backend
    npm run build 2>&1 | Select-Object -First 20
    cd ..
}

