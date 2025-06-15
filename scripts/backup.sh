#!/bin/bash
# Comprehensive Backup Script for Architekten-Cockpit

# Configuration
BACKUP_DIR="/var/backups/cockpit"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Storage Box credentials (set these as environment variables)
STORAGE_BOX_USER="${STORAGE_BOX_USER}"
STORAGE_BOX_HOST="${STORAGE_BOX_HOST}"
STORAGE_BOX_PATH="${STORAGE_BOX_PATH:-/backup}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${GREEN}Starting backup process at $(date)${NC}"

# 1. Backup Supabase Database
echo "📦 Backing up Supabase database..."
if [ -n "$DATABASE_URL" ]; then
    pg_dump "$DATABASE_URL" > "$BACKUP_DIR/cockpit_db_$DATE.sql"
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database backup completed${NC}"
        gzip "$BACKUP_DIR/cockpit_db_$DATE.sql"
    else
        echo -e "${RED}✗ Database backup failed${NC}"
    fi
else
    echo -e "${RED}✗ DATABASE_URL not set${NC}"
fi

# 2. Backup Nextcloud data
echo "📦 Backing up Nextcloud data..."
if [ -d "/var/lib/docker/volumes/nextcloud_data" ]; then
    tar -czf "$BACKUP_DIR/nextcloud_data_$DATE.tar.gz" \
        -C /var/lib/docker/volumes/nextcloud_data _data
    echo -e "${GREEN}✓ Nextcloud backup completed${NC}"
else
    echo -e "${RED}✗ Nextcloud data directory not found${NC}"
fi

# 3. Backup Docker volumes
echo "📦 Backing up Docker volumes..."
docker run --rm \
    -v nextcloud_db_data:/source:ro \
    -v "$BACKUP_DIR":/backup \
    alpine tar -czf /backup/nextcloud_db_$DATE.tar.gz -C /source .

docker run --rm \
    -v umami_db_data:/source:ro \
    -v "$BACKUP_DIR":/backup \
    alpine tar -czf /backup/umami_db_$DATE.tar.gz -C /source .

# 4. Backup application configuration
echo "📦 Backing up application configuration..."
tar -czf "$BACKUP_DIR/cockpit_config_$DATE.tar.gz" \
    -C /var/www/cockpit \
    .env \
    next.config.ts \
    package.json \
    prisma/schema.prisma

# 5. Sync to Hetzner Storage Box
if [ -n "$STORAGE_BOX_USER" ] && [ -n "$STORAGE_BOX_HOST" ]; then
    echo "☁️ Syncing to Storage Box..."
    rsync -avz --delete \
        "$BACKUP_DIR/" \
        "$STORAGE_BOX_USER@$STORAGE_BOX_HOST:$STORAGE_BOX_PATH/cockpit/"
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Storage Box sync completed${NC}"
    else
        echo -e "${RED}✗ Storage Box sync failed${NC}"
    fi
else
    echo -e "${RED}✗ Storage Box credentials not configured${NC}"
fi

# 6. Clean up old backups
echo "🧹 Cleaning up old backups..."
find "$BACKUP_DIR" -type f -mtime +$RETENTION_DAYS -delete
echo -e "${GREEN}✓ Cleanup completed${NC}"

# 7. Send notification (optional - via webhook)
if [ -n "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
        -H "Content-Type: application/json" \
        -d "{\"text\":\"Backup completed successfully at $(date)\"}"
fi

echo -e "${GREEN}Backup process completed at $(date)${NC}"