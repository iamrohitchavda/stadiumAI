#!/bin/bash

# ==============================================================================
# StadiumAI Deployment Script for Google Cloud Run
# ==============================================================================

echo "🚀 Preparing to deploy StadiumAI to Google Cloud Run..."
echo ""

# 1. Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: Google Cloud CLI (gcloud) is not installed."
    echo ""
    echo "Please install it by running the following command in your terminal:"
    echo "    curl https://sdk.cloud.google.com | bash"
    echo ""
    echo "After installation, restart your terminal and run this script again."
    exit 1
fi

# 2. Check Authentication
echo "🔍 Checking authentication..."
ACCOUNT=$(gcloud config get-value account 2>/dev/null)
if [ -z "$ACCOUNT" ]; then
    echo "🔑 You need to login to your Google Cloud account."
    gcloud auth login
fi

# 3. Request Project ID if not set
PROJECT=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT" ]; then
    echo "⚠️ No GCP project is currently set."
    read -p "Enter your Google Cloud Project ID: " NEW_PROJECT
    gcloud config set project "$NEW_PROJECT"
    PROJECT=$NEW_PROJECT
fi

echo "✅ Authenticated as: $ACCOUNT"
echo "✅ Target Project:  $PROJECT"
echo ""

# 4. Prompt for region
echo "🌎 Select a region (Press ENTER for default: us-central1):"
read -p "> " REGION
if [ -z "$REGION" ]; then
    REGION="us-central1"
fi

# 5. Enable necessary APIs (Cloud Run & Cloud Build)
echo "⚡ Enabling necessary Google Cloud APIs (this might take a moment if it's your first time)..."
gcloud services enable run.googleapis.com cloudbuild.googleapis.com

# 6. Deploy Code
echo ""
echo "🏗️ Starting Build and Deployment to Cloud Run..."
echo "This will upload your code, build the container remotely via Cloud Build, and deploy to Cloud Run."
echo ""

# We use the source deploy capability of gcloud
gcloud run deploy stadiumai \
  --source . \
  --region "$REGION" \
  --allow-unauthenticated \
  --port 8080 \
  --platform managed \
  --quiet

echo ""
if [ $? -eq 0 ]; then
    echo "🎉 Deployment successful!"
    echo "Your live URL is printed above."
else
    echo "❌ Deployment failed. Please check the logs above."
fi
