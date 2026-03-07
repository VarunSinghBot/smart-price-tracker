# Quick Installation Script for Cross-Platform Product Matching Feature

Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Cross-Platform Product Matching Installation" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend
Set-Location -Path "backend"

Write-Host "[1/4] Installing required npm packages..." -ForegroundColor Yellow
npm install sharp image-hash string-similarity natural leven axios

if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "✗ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[2/4] Verifying installations..." -ForegroundColor Yellow
$packages = @("sharp", "image-hash", "string-similarity", "natural", "leven", "axios")
$allInstalled = $true

foreach ($package in $packages) {
    $check = npm list $package 2>&1
    if ($check -match $package) {
        Write-Host "  ✓ $package" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $package (missing)" -ForegroundColor Red
        $allInstalled = $false
    }
}

if (-not $allInstalled) {
    Write-Host ""
    Write-Host "Some packages failed to install. Please check the errors above." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[3/4] Checking file structure..." -ForegroundColor Yellow

$requiredFiles = @(
    "src/utils/imageComparison.js",
    "src/utils/textSimilarity.js",
    "src/utils/scrapers/AmazonSearchScraper.js",
    "src/utils/scrapers/FlipkartSearchScraper.js",
    "src/utils/scrapers/EbaySearchScraper.js",
    "src/services/productMatcher.service.js",
    "src/controllers/productMatcher.controller.js"
)

$allFilesExist = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (missing)" -ForegroundColor Red
        $allFilesExist = $false
    }
}

if (-not $allFilesExist) {
    Write-Host ""
    Write-Host "Some required files are missing. Please ensure all files are created." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[4/4] Installation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Next Steps:" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Start the backend server:" -ForegroundColor White
Write-Host "   npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Test the new endpoint:" -ForegroundColor White
Write-Host "   POST http://localhost:4000/api/v1/scraper/find-similar" -ForegroundColor Gray
Write-Host ""
Write-Host "3. View documentation:" -ForegroundColor White
Write-Host "   - CROSS_PLATFORM_MATCHING.md" -ForegroundColor Gray
Write-Host "   - INSTALLATION_TESTING.md" -ForegroundColor Gray
Write-Host "   - IMPLEMENTATION_SUMMARY_MATCHING.md" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Frontend integration:" -ForegroundColor White
Write-Host "   - Add productMatcherSlice to Redux store" -ForegroundColor Gray
Write-Host "   - Use FindSimilarProductsModal component" -ForegroundColor Gray
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Ready to find products across platforms! 🚀" -ForegroundColor Green
Write-Host ""

# Return to original directory
Set-Location -Path ".."
