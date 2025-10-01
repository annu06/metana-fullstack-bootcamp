#!/bin/bash

# Application Monitoring Script
# This script provides continuous monitoring and alerting for the deployed application

set -e  # Exit on any error

# Configuration
APP_NAME="myapp"
APP_URL="http://localhost:3000"
DOMAIN="your-domain.com"
MONITOR_INTERVAL=60  # seconds
ALERT_THRESHOLD=3    # consecutive failures before alert
LOG_FILE="/var/log/monitor.log"
PID_FILE="/var/run/monitor.pid"
ALERT_EMAIL=""
SLACK_WEBHOOK=""
TELEGRAM_BOT_TOKEN=""
TELEGRAM_CHAT_ID=""
MAX_LOG_SIZE=10485760  # 10MB
RETENTION_DAYS=7

# Monitoring thresholds
MAX_RESPONSE_TIME=5
MAX_LOAD_AVERAGE=2.0
MAX_MEMORY_USAGE=80
MAX_DISK_USAGE=85
MAX_CPU_USAGE=80
MIN_FREE_MEMORY=100  # MB

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Global variables
FAILURE_COUNT=0
LAST_ALERT_TIME=0
ALERT_COOLDOWN=3600  # 1 hour
STATS_FILE="/tmp/monitor_stats.json"

# Logging functions
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
    rotate_log
}

log_success() {
    local message="[SUCCESS] $1"
    echo -e "${GREEN}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE" 2>/dev/null || true
}

log_warning() {
    local message="[WARNING] $1"
    echo -e "${YELLOW}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE" 2>/dev/null || true
}

log_error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE" 2>/dev/null || true
}

# Log rotation
rotate_log() {
    if [ -f "$LOG_FILE" ] && [ $(stat -f%z "$LOG_FILE" 2>/dev/null || stat -c%s "$LOG_FILE" 2>/dev/null || echo 0) -gt $MAX_LOG_SIZE ]; then
        mv "$LOG_FILE" "${LOG_FILE}.old"
        touch "$LOG_FILE"
        log "Log file rotated"
    fi
    
    # Clean old logs
    find "$(dirname "$LOG_FILE")" -name "$(basename "$LOG_FILE").old*" -mtime +$RETENTION_DAYS -delete 2>/dev/null || true
}

# Check if monitoring is already running
check_running() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            echo "Monitor is already running with PID $pid"
            exit 1
        else
            rm -f "$PID_FILE"
        fi
    fi
}

# Create PID file
create_pid_file() {
    echo $$ > "$PID_FILE"
    trap cleanup EXIT
}

# Cleanup function
cleanup() {
    log "Stopping monitor..."
    rm -f "$PID_FILE"
    exit 0
}

# Signal handlers
trap 'cleanup' SIGTERM SIGINT

# Check application health
check_application() {
    local status="healthy"
    local issues=()
    
    # Check HTTP endpoint
    local start_time=$(date +%s.%N)
    local response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" \
        --max-time "$MAX_RESPONSE_TIME" \
        --connect-timeout 5 \
        "$APP_URL" 2>/dev/null || echo "000,999")
    
    local http_code=$(echo "$response" | cut -d',' -f1)
    local response_time=$(echo "$response" | cut -d',' -f2)
    
    if [ "$http_code" != "200" ]; then
        issues+=("HTTP check failed: $http_code")
        status="unhealthy"
    elif (( $(echo "$response_time > $MAX_RESPONSE_TIME" | bc -l) )); then
        issues+=("Slow response: ${response_time}s")
        status="degraded"
    fi
    
    # Check PM2 process
    if ! pm2 list 2>/dev/null | grep -q "$APP_NAME.*online"; then
        issues+=("PM2 process not running")
        status="unhealthy"
    fi
    
    # Check Nginx
    if ! systemctl is-active --quiet nginx; then
        issues+=("Nginx service down")
        status="unhealthy"
    fi
    
    # Check database
    if ! systemctl is-active --quiet postgresql; then
        issues+=("Database service down")
        status="unhealthy"
    fi
    
    echo "$status|$(IFS=';'; echo "${issues[*]}")"
}

# Check system resources
check_system_resources() {
    local warnings=()
    
    # Load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$load_avg > $MAX_LOAD_AVERAGE" | bc -l) )); then
        warnings+=("High load: $load_avg")
    fi
    
    # Memory usage
    local memory_info=$(free -m)
    local total_mem=$(echo "$memory_info" | awk 'NR==2{print $2}')
    local used_mem=$(echo "$memory_info" | awk 'NR==2{print $3}')
    local free_mem=$(echo "$memory_info" | awk 'NR==2{print $4}')
    local memory_usage=$(echo "scale=1; $used_mem * 100 / $total_mem" | bc)
    
    if (( $(echo "$memory_usage > $MAX_MEMORY_USAGE" | bc -l) )); then
        warnings+=("High memory usage: ${memory_usage}%")
    fi
    
    if [ "$free_mem" -lt "$MIN_FREE_MEMORY" ]; then
        warnings+=("Low free memory: ${free_mem}MB")
    fi
    
    # CPU usage
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    if (( $(echo "$cpu_usage > $MAX_CPU_USAGE" | bc -l) )); then
        warnings+=("High CPU usage: ${cpu_usage}%")
    fi
    
    # Disk usage
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$MAX_DISK_USAGE" ]; then
        warnings+=("High disk usage: ${disk_usage}%")
    fi
    
    # Return warnings
    if [ ${#warnings[@]} -gt 0 ]; then
        echo "warning|$(IFS=';'; echo "${warnings[*]}")"
    else
        echo "normal|"
    fi
}

# Collect performance metrics
collect_metrics() {
    local timestamp=$(date +%s)
    
    # System metrics
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    local cpu_usage=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | sed 's/%us,//')
    
    # Application metrics
    local response_time=$(curl -s -o /dev/null -w "%{time_total}" \
        --max-time "$MAX_RESPONSE_TIME" \
        --connect-timeout 5 \
        "$APP_URL" 2>/dev/null || echo "999")
    
    # PM2 metrics
    local pm2_memory=0
    local pm2_cpu=0
    if command -v pm2 &> /dev/null; then
        pm2_memory=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.memory" 2>/dev/null || echo "0")
        pm2_cpu=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.cpu" 2>/dev/null || echo "0")
        pm2_memory=$((pm2_memory / 1024 / 1024))  # Convert to MB
    fi
    
    # Create metrics JSON
    local metrics=$(cat << EOF
{
    "timestamp": $timestamp,
    "system": {
        "load_avg": $load_avg,
        "memory_usage": $memory_usage,
        "disk_usage": $disk_usage,
        "cpu_usage": $cpu_usage
    },
    "application": {
        "response_time": $response_time,
        "pm2_memory": $pm2_memory,
        "pm2_cpu": $pm2_cpu
    }
}
EOF
    )
    
    # Append to stats file (keep last 100 entries)
    echo "$metrics" >> "$STATS_FILE"
    tail -100 "$STATS_FILE" > "${STATS_FILE}.tmp" && mv "${STATS_FILE}.tmp" "$STATS_FILE"
}

# Send email notification
send_email() {
    local subject="$1"
    local body="$2"
    
    if [ -n "$ALERT_EMAIL" ] && command -v mail &> /dev/null; then
        echo "$body" | mail -s "$subject" "$ALERT_EMAIL"
        log "Email alert sent to $ALERT_EMAIL"
    fi
}

# Send Slack notification
send_slack() {
    local title="$1"
    local message="$2"
    local color="$3"
    
    if [ -n "$SLACK_WEBHOOK" ]; then
        local payload=$(cat << EOF
{
    "attachments": [{
        "color": "$color",
        "title": "$title",
        "text": "$message",
        "fields": [
            {
                "title": "Host",
                "value": "$(hostname)",
                "short": true
            },
            {
                "title": "Time",
                "value": "$(date)",
                "short": true
            }
        ]
    }]
}
EOF
        )
        
        if curl -X POST -H 'Content-type: application/json' \
            --data "$payload" "$SLACK_WEBHOOK" &> /dev/null; then
            log "Slack alert sent"
        else
            log_error "Failed to send Slack alert"
        fi
    fi
}

# Send Telegram notification
send_telegram() {
    local message="$1"
    
    if [ -n "$TELEGRAM_BOT_TOKEN" ] && [ -n "$TELEGRAM_CHAT_ID" ]; then
        local url="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
        local payload=$(cat << EOF
{
    "chat_id": "$TELEGRAM_CHAT_ID",
    "text": "$message",
    "parse_mode": "Markdown"
}
EOF
        )
        
        if curl -X POST -H 'Content-type: application/json' \
            --data "$payload" "$url" &> /dev/null; then
            log "Telegram alert sent"
        else
            log_error "Failed to send Telegram alert"
        fi
    fi
}

# Send alert notifications
send_alert() {
    local alert_type="$1"
    local message="$2"
    
    local current_time=$(date +%s)
    
    # Check cooldown period
    if [ $((current_time - LAST_ALERT_TIME)) -lt $ALERT_COOLDOWN ]; then
        log "Alert cooldown active, skipping notification"
        return
    fi
    
    local subject="[$alert_type] $APP_NAME Alert - $(hostname)"
    local full_message="$message\n\nHost: $(hostname)\nTime: $(date)\nApp: $APP_NAME"
    
    case "$alert_type" in
        "CRITICAL")
            send_email "$subject" "$full_message"
            send_slack "$subject" "$message" "danger"
            send_telegram "🚨 *CRITICAL ALERT*\n\n$message\n\nHost: $(hostname)"
            ;;
        "WARNING")
            send_email "$subject" "$full_message"
            send_slack "$subject" "$message" "warning"
            send_telegram "⚠️ *WARNING*\n\n$message\n\nHost: $(hostname)"
            ;;
        "RECOVERY")
            send_email "$subject" "$full_message"
            send_slack "$subject" "$message" "good"
            send_telegram "✅ *RECOVERY*\n\n$message\n\nHost: $(hostname)"
            ;;
    esac
    
    LAST_ALERT_TIME=$current_time
}

# Auto-recovery actions
attempt_recovery() {
    local issue="$1"
    
    log "Attempting auto-recovery for: $issue"
    
    case "$issue" in
        *"PM2 process not running"*)
            log "Restarting PM2 process..."
            pm2 restart "$APP_NAME" 2>/dev/null || pm2 start ecosystem.config.js 2>/dev/null
            sleep 5
            ;;
        *"Nginx service down"*)
            log "Restarting Nginx service..."
            sudo systemctl restart nginx
            sleep 3
            ;;
        *"Database service down"*)
            log "Restarting PostgreSQL service..."
            sudo systemctl restart postgresql
            sleep 10
            ;;
        *"High memory usage"*)
            log "Clearing system caches..."
            sudo sync && echo 3 | sudo tee /proc/sys/vm/drop_caches > /dev/null
            ;;
    esac
}

# Generate status report
generate_status_report() {
    local app_status=$(check_application)
    local system_status=$(check_system_resources)
    
    local app_health=$(echo "$app_status" | cut -d'|' -f1)
    local app_issues=$(echo "$app_status" | cut -d'|' -f2)
    local system_health=$(echo "$system_status" | cut -d'|' -f1)
    local system_warnings=$(echo "$system_status" | cut -d'|' -f2)
    
    echo "Application Status: $app_health"
    if [ -n "$app_issues" ]; then
        echo "Issues: $app_issues"
    fi
    
    echo "System Status: $system_health"
    if [ -n "$system_warnings" ]; then
        echo "Warnings: $system_warnings"
    fi
    
    # Show recent metrics
    if [ -f "$STATS_FILE" ]; then
        echo "\nRecent Metrics:"
        tail -1 "$STATS_FILE" | jq -r '
            "Load: " + (.system.load_avg | tostring) +
            ", Memory: " + (.system.memory_usage | tostring) + "%" +
            ", Disk: " + (.system.disk_usage | tostring) + "%" +
            ", Response: " + (.application.response_time | tostring) + "s"
        ' 2>/dev/null || echo "Metrics unavailable"
    fi
}

# Main monitoring loop
monitor_loop() {
    log "Starting monitoring loop (interval: ${MONITOR_INTERVAL}s)"
    
    while true; do
        # Check application health
        local app_status=$(check_application)
        local app_health=$(echo "$app_status" | cut -d'|' -f1)
        local app_issues=$(echo "$app_status" | cut -d'|' -f2)
        
        # Check system resources
        local system_status=$(check_system_resources)
        local system_health=$(echo "$system_status" | cut -d'|' -f1)
        local system_warnings=$(echo "$system_status" | cut -d'|' -f2)
        
        # Collect metrics
        collect_metrics
        
        # Handle application issues
        if [ "$app_health" = "unhealthy" ]; then
            FAILURE_COUNT=$((FAILURE_COUNT + 1))
            log_error "Application unhealthy (failure $FAILURE_COUNT/$ALERT_THRESHOLD): $app_issues"
            
            # Attempt recovery
            attempt_recovery "$app_issues"
            
            # Send alert if threshold reached
            if [ $FAILURE_COUNT -ge $ALERT_THRESHOLD ]; then
                send_alert "CRITICAL" "Application is unhealthy after $FAILURE_COUNT consecutive checks.\n\nIssues: $app_issues"
            fi
        elif [ "$app_health" = "degraded" ]; then
            log_warning "Application degraded: $app_issues"
            
            # Reset failure count but don't send recovery alert
            if [ $FAILURE_COUNT -ge $ALERT_THRESHOLD ]; then
                FAILURE_COUNT=0
            fi
        else
            # Application is healthy
            if [ $FAILURE_COUNT -ge $ALERT_THRESHOLD ]; then
                log_success "Application recovered"
                send_alert "RECOVERY" "Application has recovered and is now healthy."
            fi
            FAILURE_COUNT=0
        fi
        
        # Handle system warnings
        if [ "$system_health" = "warning" ] && [ -n "$system_warnings" ]; then
            log_warning "System warnings: $system_warnings"
            
            # Attempt recovery for some issues
            attempt_recovery "$system_warnings"
        fi
        
        # Log status periodically
        local current_minute=$(date +%M)
        if [ "$((current_minute % 10))" -eq 0 ] && [ "$(date +%S)" -lt "$MONITOR_INTERVAL" ]; then
            log "Status - App: $app_health, System: $system_health"
        fi
        
        sleep "$MONITOR_INTERVAL"
    done
}

# Show monitoring statistics
show_stats() {
    if [ ! -f "$STATS_FILE" ]; then
        echo "No statistics available"
        return
    fi
    
    echo "Monitoring Statistics (last 24 hours):"
    echo "======================================"
    
    # Calculate averages
    local avg_load=$(jq -r '.system.load_avg' "$STATS_FILE" | awk '{sum+=$1; count++} END {printf "%.2f", sum/count}')
    local avg_memory=$(jq -r '.system.memory_usage' "$STATS_FILE" | awk '{sum+=$1; count++} END {printf "%.1f", sum/count}')
    local avg_response=$(jq -r '.application.response_time' "$STATS_FILE" | awk '{sum+=$1; count++} END {printf "%.3f", sum/count}')
    
    # Calculate max values
    local max_load=$(jq -r '.system.load_avg' "$STATS_FILE" | sort -n | tail -1)
    local max_memory=$(jq -r '.system.memory_usage' "$STATS_FILE" | sort -n | tail -1)
    local max_response=$(jq -r '.application.response_time' "$STATS_FILE" | sort -n | tail -1)
    
    echo "Load Average - Avg: $avg_load, Max: $max_load"
    echo "Memory Usage - Avg: ${avg_memory}%, Max: ${max_memory}%"
    echo "Response Time - Avg: ${avg_response}s, Max: ${max_response}s"
    
    # Show uptime
    local first_timestamp=$(head -1 "$STATS_FILE" | jq -r '.timestamp')
    local last_timestamp=$(tail -1 "$STATS_FILE" | jq -r '.timestamp')
    local uptime_hours=$(( (last_timestamp - first_timestamp) / 3600 ))
    
    echo "Monitoring Duration: ${uptime_hours} hours"
    
    # Show recent issues from logs
    echo "\nRecent Issues:"
    grep -E "\[(ERROR|WARNING)\]" "$LOG_FILE" 2>/dev/null | tail -5 || echo "No recent issues"
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start           Start monitoring daemon"
    echo "  stop            Stop monitoring daemon"
    echo "  status          Show current status"
    echo "  stats           Show monitoring statistics"
    echo "  test-alerts     Test alert notifications"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -a, --app-name      Application name (default: myapp)"
    echo "  -u, --app-url       Application URL (default: http://localhost:3000)"
    echo "  -d, --domain        Domain name"
    echo "  -i, --interval      Monitor interval in seconds (default: 60)"
    echo "  -t, --threshold     Alert threshold (default: 3)"
    echo "  -e, --email         Email for alerts"
    echo "  -s, --slack         Slack webhook URL"
    echo "  --telegram-token    Telegram bot token"
    echo "  --telegram-chat     Telegram chat ID"
    echo "  -l, --log-file      Log file path"
    echo "  --max-response      Max response time in seconds (default: 5)"
    echo "  --max-load          Max load average (default: 2.0)"
    echo "  --max-memory        Max memory usage % (default: 80)"
    echo "  --max-disk          Max disk usage % (default: 85)"
    echo "  --max-cpu           Max CPU usage % (default: 80)"
    echo ""
    echo "Examples:"
    echo "  $0 start                                    # Start monitoring"
    echo "  $0 -e admin@example.com start              # Start with email alerts"
    echo "  $0 -i 30 -t 5 start                       # Custom interval and threshold"
    echo "  $0 status                                   # Show current status"
    echo "  $0 stats                                    # Show statistics"
}

# Test alert notifications
test_alerts() {
    echo "Testing alert notifications..."
    
    send_alert "WARNING" "This is a test warning alert from the monitoring system."
    echo "Test alert sent. Check your configured notification channels."
}

# Stop monitoring daemon
stop_monitor() {
    if [ -f "$PID_FILE" ]; then
        local pid=$(cat "$PID_FILE")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid"
            rm -f "$PID_FILE"
            echo "Monitor stopped (PID: $pid)"
        else
            rm -f "$PID_FILE"
            echo "Monitor was not running"
        fi
    else
        echo "Monitor is not running"
    fi
}

# Parse command line arguments
COMMAND="start"

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
        -u|--app-url)
            APP_URL="$2"
            shift 2
            ;;
        -d|--domain)
            DOMAIN="$2"
            shift 2
            ;;
        -i|--interval)
            MONITOR_INTERVAL="$2"
            shift 2
            ;;
        -t|--threshold)
            ALERT_THRESHOLD="$2"
            shift 2
            ;;
        -e|--email)
            ALERT_EMAIL="$2"
            shift 2
            ;;
        -s|--slack)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        --telegram-token)
            TELEGRAM_BOT_TOKEN="$2"
            shift 2
            ;;
        --telegram-chat)
            TELEGRAM_CHAT_ID="$2"
            shift 2
            ;;
        -l|--log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        --max-response)
            MAX_RESPONSE_TIME="$2"
            shift 2
            ;;
        --max-load)
            MAX_LOAD_AVERAGE="$2"
            shift 2
            ;;
        --max-memory)
            MAX_MEMORY_USAGE="$2"
            shift 2
            ;;
        --max-disk)
            MAX_DISK_USAGE="$2"
            shift 2
            ;;
        --max-cpu)
            MAX_CPU_USAGE="$2"
            shift 2
            ;;
        start|stop|status|stats|test-alerts)
            COMMAND="$1"
            shift
            ;;
        *)
            echo "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

# Create log directory
mkdir -p "$(dirname "$LOG_FILE")"

# Install required packages if missing
if ! command -v bc &> /dev/null; then
    echo "Installing bc for calculations..."
    sudo apt-get update && sudo apt-get install -y bc
fi

if ! command -v jq &> /dev/null; then
    echo "Installing jq for JSON parsing..."
    sudo apt-get update && sudo apt-get install -y jq
fi

# Execute command
case $COMMAND in
    start)
        check_running
        create_pid_file
        log "Starting monitor for $APP_NAME (PID: $$)"
        monitor_loop
        ;;
    stop)
        stop_monitor
        ;;
    status)
        generate_status_report
        ;;
    stats)
        show_stats
        ;;
    test-alerts)
        test_alerts
        ;;
    *)
        echo "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac