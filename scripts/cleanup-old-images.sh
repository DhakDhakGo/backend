#!/bin/bash

# Cleanup old Docker images from GCR
# Keeps only the latest 3 versions of each service
# Run this weekly to minimize storage costs

PROJECT_ID="dhakdhakgo-472515"
SERVICES=("user-service" "post-service" "ai-service" "interaction-service")

echo "🧹 Cleaning up old Docker images..."

for SERVICE in "${SERVICES[@]}"; do
  echo ""
  echo "Cleaning $SERVICE..."
  
  # Get all untagged images (older versions)
  DIGESTS=$(gcloud container images list-tags \
    gcr.io/$PROJECT_ID/$SERVICE \
    --filter='-tags:*' \
    --format='get(digest)' \
    --limit=999)
  
  if [ -z "$DIGESTS" ]; then
    echo "  No old images to delete for $SERVICE"
    continue
  fi
  
  # Delete old images
  echo "$DIGESTS" | while read DIGEST; do
    echo "  Deleting gcr.io/$PROJECT_ID/$SERVICE@$DIGEST"
    gcloud container images delete \
      "gcr.io/$PROJECT_ID/$SERVICE@$DIGEST" \
      --quiet --force-delete-tags
  done
  
  # Keep only latest 3 tagged versions
  OLD_TAGS=$(gcloud container images list-tags \
    gcr.io/$PROJECT_ID/$SERVICE \
    --format='get(digest)' \
    --limit=999 \
    | tail -n +4)
  
  if [ ! -z "$OLD_TAGS" ]; then
    echo "$OLD_TAGS" | while read DIGEST; do
      echo "  Deleting old version: gcr.io/$PROJECT_ID/$SERVICE@$DIGEST"
      gcloud container images delete \
        "gcr.io/$PROJECT_ID/$SERVICE@$DIGEST" \
        --quiet --force-delete-tags
    done
  fi
done

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Current storage:"
gcloud container images list --repository=gcr.io/$PROJECT_ID


