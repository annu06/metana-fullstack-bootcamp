#!/bin/bash

# Backup Script for Full-Stack Application
# This script creates encrypted backups of application files, database, and configurations

set -e  # Exit on any error

# Configuration
APP_NAME="myapp"
APP_DIR="/var/www/html/$APP_NAME"
BACKUP_DIR="/home/$(whoami)/backups"
RETENTION_DAYS=30
ENCRYPTION_KEY_FILE="$HOME/.backup_encryption_key"
S3_BUCKET=""  # Optional: S3 bucket for remote backups
DB_NAME="myapp_production"
DB_USER="myapp_user"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Generate timestamp for backup files
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_PREFIX="${APP_NAME}_${TIMESTAMP}"

# Create backup directory
setup_backup_dir() {
    log "Setting up backup directory..."
    
    mkdir -p "$BACKUP_DIR"
    chmod 700 "$BACKUP_DIR"
    
    log_success "Backup directory ready: $BACKUP_DIR"
}

# Generate or load encryption key
setup_encryption() {
    log "Setting up encryption..."
    
    if [ ! -f "$ENCRYPTION_KEY_FILE" ]; then
        log "Generating new encryption key..."
        openssl rand -base64 32 > "$ENCRYPTION_KEY_FILE"
        chmod 600 "$ENCRYPTION_KEY_FILE"
        log_success "Encryption key generated: $ENCRYPTION_KEY_FILE"
        log_warning "IMPORTANT: Store this key securely! Without it, backups cannot be restored."
    else
        log "Using existing encryption key: $ENCRYPTION_KEY_FILE"
    fi
}

# Backup application files
backup_application() {
    log "Backing up application files..."
    
    if [ ! -d "$APP_DIR" ]; then
        log_warning "Application directory not found: $APP_DIR"
        return 1
    fi
    
    local backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_app.tar.gz.enc"
    
    # Create tar archive and encrypt
    tar -czf - -C "$(dirname "$APP_DIR")" "$(basename "$APP_DIR")" \
        --exclude="node_modules" \
        --exclude=".git" \
        --exclude="*.log" \
        --exclude="tmp" \
        --exclude="uploads" \
        | openssl enc -aes-256-cbc -salt -pass file:"$ENCRYPTION_KEY_FILE" \
        > "$backup_file"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Application backup created: $backup_file ($size)"
    else
        log_error "Failed to create application backup"
        return 1
    fi
}

# Backup database
backup_database() {
    log "Backing up database..."
    
    local backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_db.sql.enc"
    
    # Check if PostgreSQL is running
    if ! systemctl is-active --quiet postgresql; then
        log_warning "PostgreSQL is not running, skipping database backup"
        return 1
    fi
    
    # Create database dump and encrypt
    if pg_dump -h localhost -U "$DB_USER" "$DB_NAME" \
        | openssl enc -aes-256-cbc -salt -pass file:"$ENCRYPTION_KEY_FILE" \
        > "$backup_file"; then
        
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Database backup created: $backup_file ($size)"
    else
        log_error "Failed to create database backup"
        return 1
    fi
}

# Backup system configurations
backup_configs() {
    log "Backing up system configurations..."
    
    local backup_file="$BACKUP_DIR/${BACKUP_PREFIX}_configs.tar.gz.enc"
    local temp_dir="/tmp/backup_configs_$$"
    
    mkdir -p "$temp_dir"
    
    # Copy configuration files
    cp -r /etc/nginx "$temp_dir/" 2>/dev/null || log_warning "Nginx config not found"
    cp -r /etc/ssl "$temp_dir/" 2>/dev/null || log_warning "SSL certificates not found"
    cp -r "$HOME/.ssh" "$temp_dir/ssh" 2>/dev/null || log_warning "SSH config not found"
    
    # Copy PM2 configuration
    if [ -f "$HOME/.pm2/dump.pm2" ]; then
        mkdir -p "$temp_dir/pm2"
        cp "$HOME/.pm2/dump.pm2" "$temp_dir/pm2/"
    fi
    
    # Copy environment files
    if [ -f "$APP_DIR/.env" ]; then
        mkdir -p "$temp_dir/env"
        cp "$APP_DIR/.env" "$temp_dir/env/"
    fi
    
    # Create encrypted archive
    tar -czf - -C "$temp_dir" . \
        | openssl enc -aes-256-cbc -salt -pass file:"$ENCRYPTION_KEY_FILE" \
        > "$backup_file"
    
    # Cleanup
    rm -rf "$temp_dir"
    
    if [ $? -eq 0 ]; then
        local size=$(du -h "$backup_file" | cut -f1)
        log_success "Configuration backup created: $backup_file ($size)"
    else
        log_error "Failed to create configuration backup"
        return 1
    fi
}

# Backup PM2 processes
backup_pm2() {
    log "Backing up PM2 processes..."
    
    if command -v pm2 &> /dev/null; then
        pm2 save --force
        log_success "PM2 processes saved"
    else
        log_warning "PM2 not found, skipping PM2 backup"
    fi
}

# Create backup manifest
create_manifest() {
    log "Creating backup manifest..."
    
    local manifest_file="$BACKUP_DIR/${BACKUP_PREFIX}_manifest.txt"
    
    cat > "$manifest_file" << EOF
Backup Manifest
===============
Application: $APP_NAME
Timestamp: $TIMESTAMP
Date: $(date)
Hostname: $(hostname)
User: $(whoami)

Backup Files:
EOF
    
    # List all backup files for this timestamp
    ls -lh "$BACKUP_DIR/${BACKUP_PREFIX}_"* >> "$manifest_file" 2>/dev/null || true
    
    echo "" >> "$manifest_file"
    echo "System Information:" >> "$manifest_file"
    echo "OS: $(lsb_release -d | cut -f2)" >> "$manifest_file"
    echo "Kernel: $(uname -r)" >> "$manifest_file"
    echo "Node.js: $(node --version 2>/dev/null || echo 'Not installed')" >> "$manifest_file"
    echo "npm: $(npm --version 2>/dev/null || echo 'Not installed')" >> "$manifest_file"
    echo "PM2: $(pm2 --version 2>/dev/null || echo 'Not installed')" >> "$manifest_file"
    echo "Nginx: $(nginx -v 2>&1 | head -1 || echo 'Not installed')" >> "$manifest_file"
    
    log_success "Backup manifest created: $manifest_file"
}

# Upload to S3 (optional)
upload_to_s3() {
    if [ -z "$S3_BUCKET" ]; then
        log "S3 upload skipped (no bucket configured)"
        return 0
    fi
    
    log "Uploading backups to S3..."
    
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI not installed, skipping S3 upload"
        return 1
    fi
    
    local s3_path="s3://$S3_BUCKET/backups/$(hostname)/$TIMESTAMP/"
    
    # Upload all backup files for this timestamp
    for file in "$BACKUP_DIR/${BACKUP_PREFIX}_"*; do
        if [ -f "$file" ]; then
            aws s3 cp "$file" "$s3_path" --storage-class STANDARD_IA
            if [ $? -eq 0 ]; then
                log_success "Uploaded: $(basename "$file")"
            else
                log_error "Failed to upload: $(basename "$file")"
            fi
        fi
    done
}

# Cleanup old backups
cleanup_old_backups() {
    log "Cleaning up old backups..."
    
    # Remove local backups older than retention period
    find "$BACKUP_DIR" -name "${APP_NAME}_*" -type f -mtime +$RETENTION_DAYS -delete
    
    local remaining=$(find "$BACKUP_DIR" -name "${APP_NAME}_*" -type f | wc -l)
    log_success "Cleanup completed. $remaining backup files remaining."
    
    # Cleanup S3 backups if configured
    if [ -n "$S3_BUCKET" ] && command -v aws &> /dev/null; then
        log "Cleaning up old S3 backups..."
        
        # List and delete old S3 backups
        aws s3 ls "s3://$S3_BUCKET/backups/$(hostname)/" --recursive \
            | awk '$1 <= "'$(date -d "$RETENTION_DAYS days ago" +%Y-%m-%d)'" {print $4}' \
            | while read -r file; do
                if [ -n "$file" ]; then
                    aws s3 rm "s3://$S3_BUCKET/$file"
                    log "Deleted old S3 backup: $file"
                fi
            done
    fi
}

# Verify backup integrity
verify_backups() {
    log "Verifying backup integrity..."
    
    local errors=0
    
    for file in "$BACKUP_DIR/${BACKUP_PREFIX}_"*.enc; do
        if [ -f "$file" ]; then
            log "Verifying: $(basename "$file")"
            
            # Test decryption without extracting
            if openssl enc -aes-256-cbc -d -salt -pass file:"$ENCRYPTION_KEY_FILE" \
                -in "$file" | head -c 1 > /dev/null 2>&1; then
                log_success "✓ $(basename "$file")"
            else
                log_error "✗ $(basename "$file") - Verification failed!"
                ((errors++))
            fi
        fi
    done
    
    if [ $errors -eq 0 ]; then
        log_success "All backups verified successfully"
    else
        log_error "$errors backup(s) failed verification"
        return 1
    fi
}

# Send notification (optional)
send_notification() {
    local status="$1"
    local message="$2"
    
    # Email notification (requires mail command)
    if command -v mail &> /dev/null && [ -n "$NOTIFICATION_EMAIL" ]; then
        echo "$message" | mail -s "Backup $status - $APP_NAME on $(hostname)" "$NOTIFICATION_EMAIL"
    fi
    
    # Slack notification (requires webhook URL)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"Backup $status - $APP_NAME on $(hostname): $message\"}" \
            "$SLACK_WEBHOOK_URL" &> /dev/null
    fi
}

# Main backup function
main() {
    log "Starting backup process for $APP_NAME..."
    
    local start_time=$(date +%s)
    local errors=0
    
    setup_backup_dir
    setup_encryption
    
    # Perform backups
    backup_application || ((errors++))
    backup_database || ((errors++))
    backup_configs || ((errors++))
    backup_pm2
    
    create_manifest
    
    # Verify backups
    verify_backups || ((errors++))
    
    # Upload to S3 if configured
    upload_to_s3
    
    # Cleanup old backups
    cleanup_old_backups
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    if [ $errors -eq 0 ]; then
        local message="Backup completed successfully in ${duration}s"
        log_success "$message"
        send_notification "SUCCESS" "$message"
    else
        local message="Backup completed with $errors error(s) in ${duration}s"
        log_error "$message"
        send_notification "ERROR" "$message"
        exit 1
    fi
    
    # Display backup summary
    echo
    log "Backup Summary:"
    echo "Location: $BACKUP_DIR"
    echo "Files created:"
    ls -lh "$BACKUP_DIR/${BACKUP_PREFIX}_"* 2>/dev/null || echo "No files found"
    echo
    log "To restore from backup, use: ./restore.sh $TIMESTAMP"
}

# Restore function (basic)
restore() {
    local restore_timestamp="$1"
    
    if [ -z "$restore_timestamp" ]; then
        log_error "Please specify a timestamp to restore from"
        echo "Available backups:"
        ls -1 "$BACKUP_DIR" | grep "^${APP_NAME}_" | cut -d'_' -f2 | sort -u
        exit 1
    fi
    
    log "Starting restore process for timestamp: $restore_timestamp"
    
    local restore_prefix="${APP_NAME}_${restore_timestamp}"
    
    # Check if backup files exist
    if [ ! -f "$BACKUP_DIR/${restore_prefix}_app.tar.gz.enc" ]; then
        log_error "Backup files not found for timestamp: $restore_timestamp"
        exit 1
    fi
    
    log_warning "This will overwrite existing application files!"
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log "Restore cancelled"
        exit 0
    fi
    
    # Stop services
    log "Stopping services..."
    pm2 stop all || true
    sudo systemctl stop nginx || true
    
    # Restore application files
    log "Restoring application files..."
    openssl enc -aes-256-cbc -d -salt -pass file:"$ENCRYPTION_KEY_FILE" \
        -in "$BACKUP_DIR/${restore_prefix}_app.tar.gz.enc" \
        | tar -xzf - -C "$(dirname "$APP_DIR")"
    
    # Restore database
    if [ -f "$BACKUP_DIR/${restore_prefix}_db.sql.enc" ]; then
        log "Restoring database..."
        openssl enc -aes-256-cbc -d -salt -pass file:"$ENCRYPTION_KEY_FILE" \
            -in "$BACKUP_DIR/${restore_prefix}_db.sql.enc" \
            | psql -h localhost -U "$DB_USER" "$DB_NAME"
    fi
    
    # Restore configurations
    if [ -f "$BACKUP_DIR/${restore_prefix}_configs.tar.gz.enc" ]; then
        log "Restoring configurations..."
        local temp_dir="/tmp/restore_configs_$$"
        mkdir -p "$temp_dir"
        
        openssl enc -aes-256-cbc -d -salt -pass file:"$ENCRYPTION_KEY_FILE" \
            -in "$BACKUP_DIR/${restore_prefix}_configs.tar.gz.enc" \
            | tar -xzf - -C "$temp_dir"
        
        # Restore specific configurations
        [ -d "$temp_dir/nginx" ] && sudo cp -r "$temp_dir/nginx" /etc/
        [ -d "$temp_dir/ssh" ] && cp -r "$temp_dir/ssh" "$HOME/.ssh"
        [ -f "$temp_dir/env/.env" ] && cp "$temp_dir/env/.env" "$APP_DIR/"
        
        rm -rf "$temp_dir"
    fi
    
    # Restart services
    log "Restarting services..."
    sudo systemctl start nginx
    pm2 resurrect
    
    log_success "Restore completed successfully!"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  backup          Create a new backup (default)"
    echo "  restore <timestamp>  Restore from backup"
    echo "  list            List available backups"
    echo "  verify <timestamp>   Verify backup integrity"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -a, --app-name      Application name (default: myapp)"
    echo "  -d, --backup-dir    Backup directory (default: ~/backups)"
    echo "  -r, --retention     Retention period in days (default: 30)"
    echo "  -s, --s3-bucket     S3 bucket for remote backups"
    echo "  -e, --email         Email for notifications"
    echo "  --slack-webhook     Slack webhook URL for notifications"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Create backup"
    echo "  $0 restore 20231201_143022           # Restore from backup"
    echo "  $0 -s my-backup-bucket backup        # Backup with S3 upload"
    echo "  $0 list                              # List available backups"
}

# List available backups
list_backups() {
    echo "Available backups for $APP_NAME:"
    echo
    
    if [ -d "$BACKUP_DIR" ]; then
        ls -1 "$BACKUP_DIR" | grep "^${APP_NAME}_" | cut -d'_' -f2 | sort -u | while read -r timestamp; do
            echo "Timestamp: $timestamp"
            ls -lh "$BACKUP_DIR/${APP_NAME}_${timestamp}_"* 2>/dev/null | awk '{print "  " $9 " (" $5 ")"}'
            echo
        done
    else
        echo "No backup directory found: $BACKUP_DIR"
    fi
}

# Parse command line arguments
COMMAND="backup"

while [[ $# -gt 0 ]]; do
    case $1 in
        -h|--help)
            usage
            exit 0
            ;;
        -a|--app-name)
            APP_NAME="$2"
            shift 2
            ;;
        -d|--backup-dir)
            BACKUP_DIR="$2"
            shift 2
            ;;
        -r|--retention)
            RETENTION_DAYS="$2"
            shift 2
            ;;
        -s|--s3-bucket)
            S3_BUCKET="$2"
            shift 2
            ;;
        -e|--email)
            NOTIFICATION_EMAIL="$2"
            shift 2
            ;;
        --slack-webhook)
            SLACK_WEBHOOK_URL="$2"
            shift 2
            ;;
        backup|restore|list|verify)
            COMMAND="$1"
            shift
            ;;
        *)
            if [ "$COMMAND" = "restore" ] || [ "$COMMAND" = "verify" ]; then
                RESTORE_TIMESTAMP="$1"
                shift
            else
                log_error "Unknown option: $1"
                usage
                exit 1
            fi
            ;;
    esac
done

# Execute command
case $COMMAND in
    backup)
        main
        ;;
    restore)
        restore "$RESTORE_TIMESTAMP"
        ;;
    list)
        list_backups
        ;;
    verify)
        if [ -n "$RESTORE_TIMESTAMP" ]; then
            BACKUP_PREFIX="${APP_NAME}_${RESTORE_TIMESTAMP}"
            verify_backups
        else
            log_error "Please specify a timestamp to verify"
            exit 1
        fi
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac