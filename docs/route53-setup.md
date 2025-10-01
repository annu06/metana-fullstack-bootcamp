# AWS Route 53 DNS Setup Guide

## Overview

Configure AWS Route 53 to manage DNS for your domain, as mentioned in the assignment requirements for domain name configuration.

## Prerequisites

- Domain name purchased (from any registrar)
- AWS account with Route 53 access
- EC2 instance with public IP address

## Option 1: Using AWS Route 53 as DNS Provider

### Step 1: Create Hosted Zone

1. **AWS Console Method:**

   - Go to Route 53 in AWS Console
   - Click "Create hosted zone"
   - Enter your domain name (e.g., `yourdomain.com`)
   - Select "Public hosted zone"
   - Click "Create hosted zone"

2. **AWS CLI Method:**
   ```bash
   aws route53 create-hosted-zone \
     --name yourdomain.com \
     --caller-reference $(date +%s)
   ```

### Step 2: Update Nameservers

After creating the hosted zone, AWS provides 4 nameservers:

- ns-xxx.awsdns-xx.com
- ns-xxx.awsdns-xx.net
- ns-xxx.awsdns-xx.org
- ns-xxx.awsdns-xx.co.uk

**Update at your domain registrar:**

1. Log into your domain registrar (GoDaddy, Namecheap, etc.)
2. Find DNS/Nameserver settings
3. Replace existing nameservers with AWS nameservers
4. Save changes (can take 24-48 hours to propagate)

### Step 3: Create DNS Records

```bash
# Get your hosted zone ID
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones --query "HostedZones[?Name=='yourdomain.com.'].Id" --output text | cut -d'/' -f3)

# Create A record for root domain
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_EC2_PUBLIC_IP"}]
      }
    }]
  }'

# Create A record for www subdomain
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "www.yourdomain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_EC2_PUBLIC_IP"}]
      }
    }]
  }'
```

### Step 4: Console Method for DNS Records

1. In Route 53 hosted zone, click "Create record"
2. **For root domain:**
   - Record name: (leave blank)
   - Record type: A
   - Value: Your EC2 public IP
   - TTL: 300
3. **For www subdomain:**
   - Record name: www
   - Record type: A
   - Value: Your EC2 public IP
   - TTL: 300

## Option 2: Using External DNS Provider

If you prefer to keep your existing DNS provider:

### Step 1: Create A Records

At your DNS provider (GoDaddy, Cloudflare, etc.):

```
Type: A
Name: @             (or leave blank for root domain)
Value: YOUR_EC2_PUBLIC_IP
TTL: 300 (5 minutes)

Type: A
Name: www
Value: YOUR_EC2_PUBLIC_IP
TTL: 300
```

### Step 2: Optional CNAME for subdomains

```
Type: CNAME
Name: api
Value: yourdomain.com
TTL: 300
```

## DNS Verification Commands

### Test DNS Resolution

```bash
# Test root domain
nslookup yourdomain.com
dig yourdomain.com A

# Test www subdomain
nslookup www.yourdomain.com
dig www.yourdomain.com A

# Test from different locations
dig @8.8.8.8 yourdomain.com
dig @1.1.1.1 yourdomain.com
```

### Monitor DNS Propagation

```bash
# Check multiple DNS servers
for dns in 8.8.8.8 1.1.1.1 208.67.222.222 9.9.9.9; do
  echo "Testing DNS server $dns:"
  dig @$dns yourdomain.com A +short
  echo
done
```

### Online DNS Checker

Use these tools to verify global DNS propagation:

- https://www.whatsmydns.net/#A/yourdomain.com
- https://dnschecker.org/
- https://www.dnswatch.info/

## Integration with Deployment Scripts

### Update deploy.sh for automatic DNS setup

Add this function to your `deploy.sh`:

```bash
setup_route53_dns() {
    local domain=$1
    local ec2_ip=$2

    if [ -z "$domain" ] || [ -z "$ec2_ip" ]; then
        echo "Usage: setup_route53_dns <domain> <ec2_ip>"
        return 1
    fi

    # Check if AWS CLI is configured
    if ! aws sts get-caller-identity &>/dev/null; then
        echo "AWS CLI not configured. Please run 'aws configure' first."
        return 1
    fi

    # Get hosted zone ID
    local zone_id=$(aws route53 list-hosted-zones \
        --query "HostedZones[?Name=='${domain}.'].Id" \
        --output text | cut -d'/' -f3)

    if [ -z "$zone_id" ]; then
        echo "Hosted zone for $domain not found. Create it first in Route 53."
        return 1
    fi

    echo "Creating DNS records for $domain..."

    # Create/update A record for root domain
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$zone_id" \
        --change-batch "{
            \"Changes\": [{
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"$domain\",
                    \"Type\": \"A\",
                    \"TTL\": 300,
                    \"ResourceRecords\": [{\"Value\": \"$ec2_ip\"}]
                }
            }]
        }"

    # Create/update A record for www
    aws route53 change-resource-record-sets \
        --hosted-zone-id "$zone_id" \
        --change-batch "{
            \"Changes\": [{
                \"Action\": \"UPSERT\",
                \"ResourceRecordSet\": {
                    \"Name\": \"www.$domain\",
                    \"Type\": \"A\",
                    \"TTL\": 300,
                    \"ResourceRecords\": [{\"Value\": \"$ec2_ip\"}]
                }
            }]
        }"

    echo "DNS records created. Propagation may take up to 48 hours."
    echo "Test with: dig $domain A"
}

# Usage in deploy script
if [ ! -z "$DOMAIN" ]; then
    EC2_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
    setup_route53_dns "$DOMAIN" "$EC2_IP"
fi
```

## Common DNS Configurations

### For Single Page Applications (SPA)

```bash
# Add CNAME for common subdomains
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "app.yourdomain.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "yourdomain.com"}]
      }
    }]
  }'
```

### For API Endpoints

```bash
# Create subdomain for API
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.yourdomain.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "YOUR_EC2_PUBLIC_IP"}]
      }
    }]
  }'
```

## Security Considerations

### DNS Security Best Practices

1. **Enable DNSSEC** (if supported by registrar)
2. **Use short TTL values** during initial setup (300 seconds)
3. **Increase TTL** after DNS is stable (3600+ seconds)
4. **Monitor DNS changes** with AWS CloudTrail
5. **Restrict Route 53 permissions** to necessary users

### CAA Records for SSL

```bash
# Add CAA record to allow Let's Encrypt certificates
aws route53 change-resource-record-sets \
  --hosted-zone-id $HOSTED_ZONE_ID \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "yourdomain.com",
        "Type": "CAA",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "0 issue \"letsencrypt.org\""},
          {"Value": "0 issuewild \"letsencrypt.org\""}
        ]
      }
    }]
  }'
```

## Troubleshooting DNS Issues

### Common Problems

1. **DNS not resolving**: Check nameserver propagation
2. **Wrong IP address**: Verify A record value
3. **SSL certificate issues**: Ensure both domain and www point to same IP
4. **Slow propagation**: Use lower TTL values

### Debugging Commands

```bash
# Check DNS propagation status
dig +trace yourdomain.com

# Test specific nameserver
dig @ns1.example.com yourdomain.com

# Check all record types
dig yourdomain.com ANY

# Test reverse DNS
dig -x YOUR_EC2_PUBLIC_IP
```

### Route 53 Health Checks (Optional)

```bash
# Create health check for your domain
aws route53 create-health-check \
  --caller-reference $(date +%s) \
  --health-check-config \
    Type=HTTPS,ResourcePath="/",FullyQualifiedDomainName="yourdomain.com",Port=443
```

## Cost Considerations

### Route 53 Pricing (as of 2024)

- **Hosted Zone**: $0.50 per month
- **DNS Queries**: $0.40 per million queries
- **Health Checks**: $0.50 per health check per month

### Cost Optimization

- Use external DNS if cost is a concern
- Combine multiple domains in same hosted zone when possible
- Monitor query volume in CloudWatch

## Assignment Compliance

This setup satisfies the assignment requirement:

> "Configure Domain Name (Optional): Use AWS Route 53 or another domain registrar to link your application to a custom domain"

### What This Provides:

- ✅ Professional domain name setup
- ✅ AWS Route 53 integration
- ✅ Automated DNS record management
- ✅ SSL certificate compatibility
- ✅ Scalable DNS infrastructure

## Next Steps

After DNS setup:

1. **Wait for propagation** (up to 48 hours)
2. **Test domain resolution** with dig/nslookup
3. **Run SSL setup** with your domain
4. **Update application configuration** to use domain
5. **Test HTTPS access** via domain name

## Alternative Providers

If not using Route 53:

- **Cloudflare**: Free DNS with additional features
- **Google Cloud DNS**: Competitive pricing
- **Namecheap**: Simple DNS management
- **GoDaddy**: Basic DNS service
