#!/bin/bash

# Health Check Script for Full-Stack Application
# This script monitors the health of the deployed application and its dependencies

set -e  # Exit on any error

# Configuration
APP_NAME="myapp"
APP_URL="http://localhost:3000"
DOMAIN="your-domain.com"
DB_NAME="myapp_production"
DB_USER="myapp_user"
ALERT_EMAIL=""
SLACK_WEBHOOK=""
LOG_FILE="/var/log/health-check.log"
MAX_RESPONSE_TIME=5  # seconds
MAX_LOAD_AVERAGE=2.0
MAX_MEMORY_USAGE=80  # percentage
MAX_DISK_USAGE=85    # percentage

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Health check results
HEALTH_STATUS="HEALTHY"
ISSUES=()
WARNINGS=()

# Logging functions
log() {
    local message="[$(date +'%Y-%m-%d %H:%M:%S')] $1"
    echo -e "${BLUE}$message${NC}"
    echo "$message" >> "$LOG_FILE" 2>/dev/null || true
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
    WARNINGS+=("$1")
    if [ "$HEALTH_STATUS" = "HEALTHY" ]; then
        HEALTH_STATUS="WARNING"
    fi
}

log_error() {
    local message="[ERROR] $1"
    echo -e "${RED}$message${NC}"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $message" >> "$LOG_FILE" 2>/dev/null || true
    ISSUES+=("$1")
    HEALTH_STATUS="CRITICAL"
}

# Check if a service is running
check_service() {
    local service_name="$1"
    local display_name="${2:-$service_name}"
    
    if systemctl is-active --quiet "$service_name"; then
        log_success "$display_name service is running"
        return 0
    else
        log_error "$display_name service is not running"
        return 1
    fi
}

# Check if a process is running
check_process() {
    local process_name="$1"
    local display_name="${2:-$process_name}"
    
    if pgrep -f "$process_name" > /dev/null; then
        log_success "$display_name process is running"
        return 0
    else
        log_error "$display_name process is not running"
        return 1
    fi
}

# Check HTTP endpoint
check_http_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    local timeout="${3:-$MAX_RESPONSE_TIME}"
    local description="${4:-$url}"
    
    log "Checking HTTP endpoint: $description"
    
    local start_time=$(date +%s.%N)
    local response=$(curl -s -o /dev/null -w "%{http_code},%{time_total}" \
        --max-time "$timeout" \
        --connect-timeout 5 \
        "$url" 2>/dev/null || echo "000,999")
    
    local http_code=$(echo "$response" | cut -d',' -f1)
    local response_time=$(echo "$response" | cut -d',' -f2)
    
    if [ "$http_code" = "$expected_status" ]; then
        if (( $(echo "$response_time > $MAX_RESPONSE_TIME" | bc -l) )); then
            log_warning "$description responded with $http_code but took ${response_time}s (> ${MAX_RESPONSE_TIME}s)"
        else
            log_success "$description responded with $http_code in ${response_time}s"
        fi
        return 0
    else
        log_error "$description returned $http_code (expected $expected_status)"
        return 1
    fi
}

# Check database connectivity
check_database() {
    log "Checking database connectivity..."
    
    if ! systemctl is-active --quiet postgresql; then
        log_error "PostgreSQL service is not running"
        return 1
    fi
    
    # Test database connection
    if PGPASSWORD="$(grep DATABASE_URL /var/www/html/$APP_NAME/.env 2>/dev/null | cut -d'@' -f1 | cut -d':' -f3 || echo '')" \
       psql -h localhost -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;" > /dev/null 2>&1; then
        log_success "Database connection successful"
        
        # Check database size
        local db_size=$(PGPASSWORD="$(grep DATABASE_URL /var/www/html/$APP_NAME/.env 2>/dev/null | cut -d'@' -f1 | cut -d':' -f3 || echo '')" \
            psql -h localhost -U "$DB_USER" -d "$DB_NAME" -t -c \
            "SELECT pg_size_pretty(pg_database_size('$DB_NAME'));" 2>/dev/null | xargs || echo "Unknown")
        log "Database size: $db_size"
        
        return 0
    else
        log_error "Database connection failed"
        return 1
    fi
}

# Check PM2 processes
check_pm2() {
    log "Checking PM2 processes..."
    
    if ! command -v pm2 &> /dev/null; then
        log_error "PM2 is not installed"
        return 1
    fi
    
    local pm2_status=$(pm2 jlist 2>/dev/null)
    
    if [ "$pm2_status" = "[]" ]; then
        log_error "No PM2 processes are running"
        return 1
    fi
    
    # Check specific app
    local app_status=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.status" 2>/dev/null || echo "")
    
    if [ "$app_status" = "online" ]; then
        log_success "PM2 process '$APP_NAME' is online"
        
        # Get process details
        local memory=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.memory" 2>/dev/null || echo "0")
        local cpu=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .monit.cpu" 2>/dev/null || echo "0")
        local uptime=$(pm2 jlist 2>/dev/null | jq -r ".[] | select(.name==\"$APP_NAME\") | .pm2_env.pm_uptime" 2>/dev/null || echo "0")
        
        local memory_mb=$((memory / 1024 / 1024))
        local uptime_hours=$(( ($(date +%s) * 1000 - uptime) / 1000 / 3600 ))
        
        log "Process stats: ${memory_mb}MB RAM, ${cpu}% CPU, ${uptime_hours}h uptime"
        
        return 0
    elif [ -n "$app_status" ]; then
        log_error "PM2 process '$APP_NAME' is $app_status"
        return 1
    else
        log_error "PM2 process '$APP_NAME' not found"
        return 1
    fi
}

# Check system resources
check_system_resources() {
    log "Checking system resources..."
    
    # Check load average
    local load_avg=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
    if (( $(echo "$load_avg > $MAX_LOAD_AVERAGE" | bc -l) )); then
        log_warning "High load average: $load_avg (threshold: $MAX_LOAD_AVERAGE)"
    else
        log_success "Load average: $load_avg"
    fi
    
    # Check memory usage
    local memory_usage=$(free | awk 'NR==2{printf "%.1f", $3*100/$2}')
    if (( $(echo "$memory_usage > $MAX_MEMORY_USAGE" | bc -l) )); then
        log_warning "High memory usage: ${memory_usage}% (threshold: ${MAX_MEMORY_USAGE}%)"
    else
        log_success "Memory usage: ${memory_usage}%"
    fi
    
    # Check disk usage
    local disk_usage=$(df / | awk 'NR==2{print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt "$MAX_DISK_USAGE" ]; then
        log_warning "High disk usage: ${disk_usage}% (threshold: ${MAX_DISK_USAGE}%)"
    else
        log_success "Disk usage: ${disk_usage}%"
    fi
    
    # Check available disk space
    local available_space=$(df -h / | awk 'NR==2{print $4}')
    log "Available disk space: $available_space"
}

# Check SSL certificate
check_ssl_certificate() {
    if [ "$DOMAIN" = "your-domain.com" ]; then
        log "SSL check skipped (domain not configured)"
        return 0
    fi
    
    log "Checking SSL certificate for $DOMAIN..."
    
    local cert_info=$(echo | openssl s_client -servername "$DOMAIN" -connect "$DOMAIN:443" 2>/dev/null | \
        openssl x509 -noout -dates 2>/dev/null || echo "")
    
    if [ -z "$cert_info" ]; then
        log_error "Could not retrieve SSL certificate for $DOMAIN"
        return 1
    fi
    
    local expiry_date=$(echo "$cert_info" | grep "notAfter" | cut -d'=' -f2)
    local expiry_timestamp=$(date -d "$expiry_date" +%s 2>/dev/null || echo "0")
    local current_timestamp=$(date +%s)
    local days_until_expiry=$(( (expiry_timestamp - current_timestamp) / 86400 ))
    
    if [ "$days_until_expiry" -lt 0 ]; then
        log_error "SSL certificate for $DOMAIN has expired"
        return 1
    elif [ "$days_until_expiry" -lt 30 ]; then
        log_warning "SSL certificate for $DOMAIN expires in $days_until_expiry days"
    else
        log_success "SSL certificate for $DOMAIN is valid (expires in $days_until_expiry days)"
    fi
}

# Check log files for errors
check_logs() {
    log "Checking application logs for recent errors..."
    
    local error_count=0
    
    # Check PM2 logs
    if [ -f "/var/log/pm2/${APP_NAME}-error.log" ]; then
        local recent_errors=$(tail -100 "/var/log/pm2/${APP_NAME}-error.log" 2>/dev/null | \
            grep "$(date +'%Y-%m-%d')" | wc -l)
        if [ "$recent_errors" -gt 0 ]; then
            log_warning "Found $recent_errors recent errors in PM2 error log"
            error_count=$((error_count + recent_errors))
        fi
    fi
    
    # Check Nginx error logs
    if [ -f "/var/log/nginx/error.log" ]; then
        local nginx_errors=$(tail -100 "/var/log/nginx/error.log" 2>/dev/null | \
            grep "$(date +'%Y/%m/%d')" | grep -E "(error|crit|alert|emerg)" | wc -l)
        if [ "$nginx_errors" -gt 0 ]; then
            log_warning "Found $nginx_errors recent errors in Nginx error log"
            error_count=$((error_count + nginx_errors))
        fi
    fi
    
    if [ "$error_count" -eq 0 ]; then
        log_success "No recent errors found in logs"
    fi
}

# Check network connectivity
check_network() {
    log "Checking network connectivity..."
    
    # Check internet connectivity
    if ping -c 1 8.8.8.8 > /dev/null 2>&1; then
        log_success "Internet connectivity is working"
    else
        log_error "No internet connectivity"
    fi
    
    # Check DNS resolution
    if nslookup google.com > /dev/null 2>&1; then
        log_success "DNS resolution is working"
    else
        log_error "DNS resolution failed"
    fi
    
    # Check listening ports
    local listening_ports=$(ss -tlnp | grep -E ":(80|443|3000|5432)" | wc -l)
    if [ "$listening_ports" -gt 0 ]; then
        log_success "Required ports are listening ($listening_ports ports)"
    else
        log_warning "Some required ports may not be listening"
    fi
}

# Check firewall status
check_firewall() {
    log "Checking firewall status..."
    
    if command -v ufw &> /dev/null; then
        local ufw_status=$(ufw status | head -1 | awk '{print $2}')
        if [ "$ufw_status" = "active" ]; then
            log_success "UFW firewall is active"
        else
            log_warning "UFW firewall is not active"
        fi
    else
        log_warning "UFW firewall is not installed"
    fi
    
    # Check fail2ban
    if systemctl is-active --quiet fail2ban; then
        log_success "Fail2Ban is running"
        
        # Check banned IPs
        local banned_ips=$(fail2ban-client status sshd 2>/dev/null | grep "Banned IP list" | awk -F: '{print $2}' | wc -w || echo "0")
        if [ "$banned_ips" -gt 0 ]; then
            log "Currently banned IPs: $banned_ips"
        fi
    else
        log_warning "Fail2Ban is not running"
    fi
}

# Send notification
send_notification() {
    local status="$1"
    local summary="$2"
    
    # Email notification
    if [ -n "$ALERT_EMAIL" ] && command -v mail &> /dev/null; then
        local subject="Health Check $status - $APP_NAME on $(hostname)"
        echo "$summary" | mail -s "$subject" "$ALERT_EMAIL"
    fi
    
    # Slack notification
    if [ -n "$SLACK_WEBHOOK" ]; then
        local color="good"
        case "$status" in
            "CRITICAL") color="danger" ;;
            "WARNING") color="warning" ;;
        esac
        
        local payload=$(cat << EOF
{
    "attachments": [{
        "color": "$color",
        "title": "Health Check $status - $APP_NAME",
        "text": "$summary",
        "fields": [
            {
                "title": "Host",
                "value": "$(hostname)",
                "short": true
            },
            {
                "title": "Timestamp",
                "value": "$(date)",
                "short": true
            }
        ]
    }]
}
EOF
        )
        
        curl -X POST -H 'Content-type: application/json' \
            --data "$payload" "$SLACK_WEBHOOK" &> /dev/null
    fi
}

# Generate health report
generate_report() {
    local report="Health Check Report for $APP_NAME\n"
    report+="Generated: $(date)\n"
    report+="Host: $(hostname)\n"
    report+="Status: $HEALTH_STATUS\n\n"
    
    if [ ${#ISSUES[@]} -gt 0 ]; then
        report+="CRITICAL ISSUES:\n"
        for issue in "${ISSUES[@]}"; do
            report+="- $issue\n"
        done
        report+="\n"
    fi
    
    if [ ${#WARNINGS[@]} -gt 0 ]; then
        report+="WARNINGS:\n"
        for warning in "${WARNINGS[@]}"; do
            report+="- $warning\n"
        done
        report+="\n"
    fi
    
    if [ ${#ISSUES[@]} -eq 0 ] && [ ${#WARNINGS[@]} -eq 0 ]; then
        report+="All systems are operating normally.\n"
    fi
    
    echo -e "$report"
}

# Main health check function
main() {
    log "Starting health check for $APP_NAME..."
    
    # Create log directory if it doesn't exist
    mkdir -p "$(dirname "$LOG_FILE")"
    
    # System checks
    check_service nginx "Nginx"
    check_service postgresql "PostgreSQL"
    check_pm2
    
    # Application checks
    check_http_endpoint "$APP_URL" 200 "$MAX_RESPONSE_TIME" "Application (local)"
    
    if [ "$DOMAIN" != "your-domain.com" ]; then
        check_http_endpoint "http://$DOMAIN" 200 "$MAX_RESPONSE_TIME" "Application (external HTTP)"
        check_http_endpoint "https://$DOMAIN" 200 "$MAX_RESPONSE_TIME" "Application (external HTTPS)"
        check_ssl_certificate
    fi
    
    # Database checks
    check_database
    
    # System resource checks
    check_system_resources
    
    # Security checks
    check_firewall
    
    # Network checks
    check_network
    
    # Log checks
    check_logs
    
    # Generate and display report
    echo
    log "Health check completed with status: $HEALTH_STATUS"
    echo
    
    local report=$(generate_report)
    echo "$report"
    
    # Send notifications if there are issues
    if [ "$HEALTH_STATUS" != "HEALTHY" ]; then
        send_notification "$HEALTH_STATUS" "$report"
    fi
    
    # Exit with appropriate code
    case "$HEALTH_STATUS" in
        "HEALTHY") exit 0 ;;
        "WARNING") exit 1 ;;
        "CRITICAL") exit 2 ;;
    esac
}

# Quick check function (minimal checks)
quick_check() {
    log "Performing quick health check..."
    
    local quick_status="HEALTHY"
    
    # Check if main services are running
    if ! systemctl is-active --quiet nginx; then
        echo "❌ Nginx is not running"
        quick_status="CRITICAL"
    else
        echo "✅ Nginx is running"
    fi
    
    if ! pm2 list | grep -q "$APP_NAME.*online"; then
        echo "❌ Application is not running"
        quick_status="CRITICAL"
    else
        echo "✅ Application is running"
    fi
    
    # Quick HTTP check
    if curl -f "$APP_URL" > /dev/null 2>&1; then
        echo "✅ Application is responding"
    else
        echo "❌ Application is not responding"
        quick_status="CRITICAL"
    fi
    
    echo "Quick check status: $quick_status"
    
    case "$quick_status" in
        "HEALTHY") exit 0 ;;
        *) exit 1 ;;
    esac
}

# Script usage
usage() {
    echo "Usage: $0 [OPTIONS] [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  full            Perform full health check (default)"
    echo "  quick           Perform quick health check"
    echo "  status          Show current status"
    echo ""
    echo "Options:"
    echo "  -h, --help          Show this help message"
    echo "  -a, --app-name      Application name (default: myapp)"
    echo "  -u, --app-url       Application URL (default: http://localhost:3000)"
    echo "  -d, --domain        Domain name for external checks"
    echo "  -e, --email         Email for alerts"
    echo "  -s, --slack         Slack webhook URL for alerts"
    echo "  -l, --log-file      Log file path (default: /var/log/health-check.log)"
    echo "  -t, --timeout       HTTP timeout in seconds (default: 5)"
    echo "  --max-load          Maximum load average threshold (default: 2.0)"
    echo "  --max-memory        Maximum memory usage percentage (default: 80)"
    echo "  --max-disk          Maximum disk usage percentage (default: 85)"
    echo ""
    echo "Examples:"
    echo "  $0                                    # Full health check"
    echo "  $0 quick                             # Quick health check"
    echo "  $0 -d example.com -e admin@example.com  # With domain and email alerts"
}

# Parse command line arguments
COMMAND="full"

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
        -e|--email)
            ALERT_EMAIL="$2"
            shift 2
            ;;
        -s|--slack)
            SLACK_WEBHOOK="$2"
            shift 2
            ;;
        -l|--log-file)
            LOG_FILE="$2"
            shift 2
            ;;
        -t|--timeout)
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
        full|quick|status)
            COMMAND="$1"
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            usage
            exit 1
            ;;
    esac
done

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
    full)
        main
        ;;
    quick)
        quick_check
        ;;
    status)
        echo "Current system status:"
        echo "Nginx: $(systemctl is-active nginx)"
        echo "PostgreSQL: $(systemctl is-active postgresql)"
        echo "PM2 processes: $(pm2 list 2>/dev/null | grep -c online || echo 0)"
        echo "Load average: $(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')"
        echo "Memory usage: $(free | awk 'NR==2{printf "%.1f%%", $3*100/$2}')"
        echo "Disk usage: $(df / | awk 'NR==2{print $5}')"
        ;;
    *)
        log_error "Unknown command: $COMMAND"
        usage
        exit 1
        ;;
esac