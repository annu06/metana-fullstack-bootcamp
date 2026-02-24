# AWS CloudWatch Setup and Log Monitoring

## Overview

Configure AWS CloudWatch to monitor your EC2 instance and application logs, meeting the assignment requirement for log monitoring.

## Prerequisites

- EC2 instance with IAM role that has CloudWatch permissions
- AWS CLI configured (optional, for advanced setup)

## CloudWatch Agent Installation

### 1. Create IAM Role for CloudWatch

```bash
# On your local machine or AWS CLI
aws iam create-role --role-name CloudWatchAgentServerRole \
  --assume-role-policy-document file://trust-policy.json

aws iam attach-role-policy \
  --role-name CloudWatchAgentServerRole \
  --policy-arn arn:aws:iam::aws:policy/CloudWatchAgentServerPolicy
```

### 2. Install CloudWatch Agent on EC2

```bash
# Run on your EC2 instance
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb

# Configure the agent
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard
```

### 3. CloudWatch Configuration

Create `/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json`:

```json
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "namespace": "CWAgent",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": ["used_percent"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "diskio": {
        "measurement": ["io_time"],
        "metrics_collection_interval": 60,
        "resources": ["*"]
      },
      "mem": {
        "measurement": ["mem_used_percent"],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/aws/ec2/nginx/access",
            "log_stream_name": "{instance_id}-access",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/aws/ec2/nginx/error",
            "log_stream_name": "{instance_id}-error",
            "timezone": "UTC"
          },
          {
            "file_path": "/home/ubuntu/.pm2/logs/*.log",
            "log_group_name": "/aws/ec2/pm2/app",
            "log_stream_name": "{instance_id}-pm2",
            "timezone": "UTC"
          },
          {
            "file_path": "/var/log/auth.log",
            "log_group_name": "/aws/ec2/auth",
            "log_stream_name": "{instance_id}-auth",
            "timezone": "UTC"
          }
        ]
      }
    }
  }
}
```

### 4. Start CloudWatch Agent

```bash
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config -m ec2 -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json

# Enable auto-start on boot
sudo systemctl enable amazon-cloudwatch-agent
```

## Manual Log Monitoring (Alternative)

If CloudWatch agent setup is complex, use these commands for manual monitoring:

### Application Logs

```bash
# PM2 logs (real-time)
pm2 logs

# PM2 logs (specific app)
pm2 logs myapp

# View recent PM2 logs
pm2 logs --lines 100
```

### System Logs

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Nginx error logs
sudo tail -f /var/log/nginx/error.log

# System auth logs (SSH attempts)
sudo tail -f /var/log/auth.log

# System messages
sudo tail -f /var/log/syslog
```

### Log Analysis Commands

```bash
# Check for errors in the last hour
sudo journalctl --since "1 hour ago" | grep -i error

# Monitor disk space (logs can fill up)
df -h

# Check PM2 process status
pm2 status
pm2 monit

# Nginx status
sudo systemctl status nginx
```

## CloudWatch Dashboard Setup

### 1. Create Custom Dashboard

1. Go to AWS CloudWatch Console
2. Click "Dashboards" → "Create dashboard"
3. Add widgets for:
   - CPU Utilization
   - Memory Usage
   - Disk Usage
   - Network I/O
   - Application Error Count

### 2. Set Up Alarms

```bash
# Example: High CPU alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "HighCPUUtilization" \
  --alarm-description "Alarm when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2
```

## Integration with Deploy Script

Add these to your `deploy.sh` script:

```bash
# Setup CloudWatch agent if not already configured
setup_cloudwatch() {
    if ! command -v /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl &> /dev/null; then
        echo "Setting up CloudWatch agent..."
        wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
        sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
        rm amazon-cloudwatch-agent.deb
    fi
}

# Monitor deployment logs
check_deployment_logs() {
    echo "Checking recent application logs..."
    pm2 logs --lines 50 | tail -20

    echo "Checking Nginx status..."
    sudo systemctl status nginx --no-pager

    echo "Recent Nginx errors (if any):"
    sudo tail -n 10 /var/log/nginx/error.log 2>/dev/null || echo "No recent errors"
}
```

## Assignment Compliance

This setup satisfies the assignment requirement to:

> "Monitor Logs: Regularly check app logs using AWS CloudWatch to track errors"

### What This Provides:

- ✅ CloudWatch integration for log collection
- ✅ Real-time monitoring of application and system metrics
- ✅ Centralized log management
- ✅ Alert capabilities for issues
- ✅ Historical log analysis

### CloudWatch Benefits:

- Automated log collection from multiple sources
- Real-time monitoring and alerting
- Integration with other AWS services
- Scalable log storage and analysis
- Compliance with AWS best practices

## Troubleshooting

### Common Issues:

1. **IAM Permissions**: Ensure EC2 instance has CloudWatch permissions
2. **Log File Permissions**: CloudWatch agent needs read access to log files
3. **Network**: Ensure security group allows CloudWatch communication
4. **Disk Space**: Monitor `/var/log` disk usage

### Verification:

```bash
# Check CloudWatch agent status
sudo systemctl status amazon-cloudwatch-agent

# Test log forwarding
echo "Test log entry" | sudo tee -a /var/log/test.log

# View CloudWatch agent logs
sudo tail -f /opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log
```
