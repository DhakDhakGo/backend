# Deploy Firestore Configuration
# This script deploys security rules and indexes to Firestore

param(
    [Parameter(Mandatory=$false)]
    [string]$ProjectId = "dhakdhakgo-472515"
)

Write-Host "🔥 Deploying Firestore Configuration" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "Project: $ProjectId" -ForegroundColor Yellow
Write-Host ""

# Check if Firebase CLI is installed
if (-not (Get-Command firebase -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Failed to install Firebase CLI" -ForegroundColor Red
        Write-Host "Please install manually: npm install -g firebase-tools" -ForegroundColor Yellow
        exit 1
    }
}

# Login to Firebase (if not already logged in)
Write-Host "🔑 Checking Firebase authentication..." -ForegroundColor Yellow
firebase login --no-localhost

# Check if firebase.json exists, if not create it
if (-not (Test-Path "firebase.json")) {
    Write-Host "📝 Creating firebase.json configuration..." -ForegroundColor Yellow
    
    $firebaseConfig = @{
        firestore = @{
            rules = "firestore.rules"
            indexes = "firestore.indexes.json"
        }
    } | ConvertTo-Json -Depth 10
    
    $firebaseConfig | Out-File -FilePath "firebase.json" -Encoding UTF8
    Write-Host "✅ Created firebase.json" -ForegroundColor Green
}

# Initialize Firebase project (if not already initialized)
Write-Host "🔧 Setting Firebase project..." -ForegroundColor Yellow
firebase use $ProjectId --add

# Deploy Firestore rules
Write-Host ""
Write-Host "📜 Deploying Firestore security rules..." -ForegroundColor Yellow
firebase deploy --only firestore:rules --project=$ProjectId

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Security rules deployed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to deploy security rules" -ForegroundColor Red
}

# Deploy Firestore indexes
Write-Host ""
Write-Host "📊 Deploying Firestore indexes..." -ForegroundColor Yellow
firebase deploy --only firestore:indexes --project=$ProjectId

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Indexes deployed successfully!" -ForegroundColor Green
    Write-Host "⏳ Note: Indexes may take a few minutes to build" -ForegroundColor Yellow
} else {
    Write-Host "❌ Failed to deploy indexes" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Firestore configuration deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Yellow
Write-Host "1. Verify rules in Firebase Console: https://console.firebase.google.com/project/$ProjectId/firestore/rules"
Write-Host "2. Check index status: https://console.firebase.google.com/project/$ProjectId/firestore/indexes"
Write-Host "3. Start creating documents in your services"
