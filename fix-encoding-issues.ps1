# PowerShell Script to Fix UTF-16 Encoding Issues in Backend Files
# Run this from the project root directory

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  UTF-16 Encoding Fix Script for Hope Backend" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = Get-Location
$backendRoot = Join-Path $projectRoot "Hope-backend"

# Check if Hope-backend directory exists
if (-not (Test-Path $backendRoot)) {
    Write-Host "ERROR: Hope-backend directory not found!" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Red
    exit 1
}

# List of files with UTF-16 encoding issues
$corruptedFiles = @(
    "src\controllers\analyticsController.ts",
    "src\controllers\rescuePairController.ts",
    "src\middleware\premiumAccess.ts",
    "src\models\Subscription.ts",
    "src\models\UserProfile.ts",
    "src\routes\index.ts",
    "src\routes\meditation.ts",
    "src\routes\memoryEnhancedChat.ts",
    "src\routes\rescuePairs.ts",
    "src\routes\user.ts"
)

$fixed = 0
$failed = 0
$skipped = 0

Write-Host "Starting encoding fix for $($corruptedFiles.Count) files..." -ForegroundColor Yellow
Write-Host ""

foreach ($relativePath in $corruptedFiles) {
    $fullPath = Join-Path $backendRoot $relativePath
    
    Write-Host "Processing: $relativePath" -ForegroundColor White
    
    if (-not (Test-Path $fullPath)) {
        Write-Host "  [SKIP] File not found" -ForegroundColor Gray
        $skipped++
        continue
    }
    
    try {
        # Create backup
        $backupPath = "$fullPath.backup"
        Copy-Item $fullPath $backupPath -Force
        Write-Host "  [INFO] Backup created" -ForegroundColor Gray
        
        # Read file content (PowerShell automatically handles encoding)
        $content = Get-Content $fullPath -Raw -ErrorAction Stop
        
        # Check if file has content
        if ([string]::IsNullOrWhiteSpace($content)) {
            Write-Host "  [WARN] File is empty, skipping" -ForegroundColor Yellow
            Remove-Item $backupPath -Force
            $skipped++
            continue
        }
        
        # Write file with UTF-8 encoding without BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($fullPath, $content, $utf8NoBom)
        
        # Verify the fix
        $bytes = Get-Content $fullPath -Encoding Byte -TotalCount 3
        if ($bytes[0] -ne 255 -and $bytes[0] -ne 254 -and $bytes[0] -ne 239) {
            Write-Host "  [SUCCESS] Fixed UTF-8 encoding" -ForegroundColor Green
            $fixed++
            
            # Remove backup if successful
            Remove-Item $backupPath -Force -ErrorAction SilentlyContinue
        } else {
            Write-Host "  [ERROR] Fix verification failed" -ForegroundColor Red
            # Restore backup
            Copy-Item $backupPath $fullPath -Force
            Remove-Item $backupPath -Force
            $failed++
        }
    }
    catch {
        Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
        $failed++
        
        # Try to restore backup if it exists
        if (Test-Path $backupPath) {
            Copy-Item $backupPath $fullPath -Force
            Remove-Item $backupPath -Force
            Write-Host "  [INFO] Restored from backup" -ForegroundColor Gray
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  Fix Summary" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "Fixed:   $fixed files" -ForegroundColor Green
Write-Host "Failed:  $failed files" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Gray" })
Write-Host "Skipped: $skipped files" -ForegroundColor Gray
Write-Host ""

if ($fixed -gt 0) {
    Write-Host "Next Steps:" -ForegroundColor Yellow
    Write-Host "1. Test backend compilation: cd Hope-backend && npm run build" -ForegroundColor White
    Write-Host "2. Start backend server: cd Hope-backend && npm run dev" -ForegroundColor White
    Write-Host "3. Check for any TypeScript errors" -ForegroundColor White
}

if ($failed -gt 0) {
    Write-Host "Some files failed to fix. Please check manually." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Encoding fix complete!" -ForegroundColor Green

