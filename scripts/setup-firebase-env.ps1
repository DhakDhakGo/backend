# Firebase Environment Variables Setup Script
# This script helps configure Firebase environment variables for Cloud Run services

Write-Host "🔥 Firebase Environment Variables Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$PROJECT_ID = "dhakdhakgo-472515"
$REGION = "us-central1"
$PROJECT_NUMBER = "134445090159"

Write-Host "📋 Project Information:" -ForegroundColor Yellow
Write-Host "  Project ID: $PROJECT_ID"
Write-Host "  Region: $REGION"
Write-Host "  Project Number: $PROJECT_NUMBER"
Write-Host ""

Write-Host "🔧 Setting up environment variables for Cloud Run services..." -ForegroundColor Yellow

# Set Firebase Project ID (we already have this)
Write-Host "✅ FIREBASE_PROJECT_ID already set to: $PROJECT_ID" -ForegroundColor Green

# For the other Firebase values, you need to get them from Firebase Console
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Yellow
Write-Host "1. Go to Firebase Console: https://console.firebase.google.com/"
Write-Host "2. Select project: $PROJECT_ID"
Write-Host "3. Click Settings (gear icon) → Project Settings"
Write-Host "4. Scroll to 'Your apps' section"
Write-Host "5. Click 'Add app' → Web app (if not already added)"
Write-Host "6. Register app with name: 'Bike Posts Backend'"
Write-Host "7. Copy the Firebase configuration values"
Write-Host ""

Write-Host "🔑 Firebase Configuration Template:" -ForegroundColor Yellow
Write-Host "const firebaseConfig = {" -ForegroundColor White
Write-Host "  apiKey: 'YOUR_API_KEY'," -ForegroundColor White
Write-Host "  authDomain: '$PROJECT_ID.firebaseapp.com'," -ForegroundColor White
Write-Host "  projectId: '$PROJECT_ID'," -ForegroundColor White
Write-Host "  storageBucket: '$PROJECT_ID.appspot.com'," -ForegroundColor White
Write-Host "  messagingSenderId: '$PROJECT_NUMBER'," -ForegroundColor White
Write-Host "  appId: 'YOUR_APP_ID'" -ForegroundColor White
Write-Host "};" -ForegroundColor White
Write-Host ""

Write-Host "🚀 Once you have the values, run these commands:" -ForegroundColor Yellow
Write-Host ""
Write-Host "# Update Post Service:" -ForegroundColor Cyan
Write-Host "gcloud run services update post-service --region=$REGION \`" -ForegroundColor White
Write-Host "  --set-env-vars='FIREBASE_PROJECT_ID=$PROJECT_ID,FIREBASE_API_KEY=YOUR_API_KEY,FIREBASE_MESSAGING_SENDER_ID=$PROJECT_NUMBER,FIREBASE_APP_ID=YOUR_APP_ID'" -ForegroundColor White
Write-Host ""
Write-Host "# Update AI Service:" -ForegroundColor Cyan
Write-Host "gcloud run services update ai-service --region=$REGION \`" -ForegroundColor White
Write-Host "  --set-env-vars='FIREBASE_PROJECT_ID=$PROJECT_ID,FIREBASE_API_KEY=YOUR_API_KEY,FIREBASE_MESSAGING_SENDER_ID=$PROJECT_NUMBER,FIREBASE_APP_ID=YOUR_APP_ID'" -ForegroundColor White
Write-Host ""
Write-Host "# Update Interaction Service:" -ForegroundColor Cyan
Write-Host "gcloud run services update interaction-service --region=$REGION \`" -ForegroundColor White
Write-Host "  --set-env-vars='FIREBASE_PROJECT_ID=$PROJECT_ID,FIREBASE_API_KEY=YOUR_API_KEY,FIREBASE_MESSAGING_SENDER_ID=$PROJECT_NUMBER,FIREBASE_APP_ID=YOUR_APP_ID'" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Or use the Google Cloud Console method (easier):" -ForegroundColor Yellow
Write-Host "1. Go to Cloud Run in Google Cloud Console"
Write-Host "2. Edit each service"
Write-Host "3. Add environment variables in the Variables & Secrets section"
Write-Host "4. Deploy the updated service"
Write-Host ""

Write-Host "✨ Setup complete! Follow the steps above to get Firebase configuration values." -ForegroundColor Green

