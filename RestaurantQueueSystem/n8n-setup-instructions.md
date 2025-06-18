# TableQ n8n Workflow Setup Instructions

## Complete n8n Integration for Restaurant Queue Management

This guide provides step-by-step instructions to set up the complete n8n workflow for TableQ restaurant queuing system.

## 📋 Prerequisites

- n8n instance (Replit, self-hosted, or n8n Cloud)
- Google Account with Sheets access
- Email service (Gmail SMTP or any SMTP provider)
- Basic understanding of n8n workflow concepts

## 🚀 Quick Setup Steps

### 1. Deploy n8n on Replit

1. **Create New Repl**
   ```bash
   # Fork or create new Node.js repl
   npm install n8n
   ```

2. **Configure Environment Variables**
   ```bash
   # Add to .env file or Replit secrets
   N8N_HOST=0.0.0.0
   N8N_PORT=3000
   N8N_PROTOCOL=https
   WEBHOOK_URL=https://your-repl-name.your-username.repl.co
   ```

3. **Start n8n**
   ```bash
   npx n8n start
   ```

### 2. Import the TableQ Workflow

1. **Download Workflow File**
   - Save the `n8n-tableq-workflow.json` file to your computer

2. **Import to n8n**
   - Open your n8n interface
   - Click "Import from file" 
   - Select the `n8n-tableq-workflow.json` file
   - Click "Import"

### 3. Configure Google Sheets Integration

#### A. Create Google Sheet

1. **Create New Sheet**
   - Go to Google Sheets
   - Create new spreadsheet named "TableQ_Data"
   - Rename Sheet1 to "Queues"

2. **Setup Column Headers (Row 1)**
   ```
   A1: ID
   B1: Restaurant  
   C1: User Email
   D1: Party Size
   E1: Join Time
   F1: Status
   G1: ETA
   ```

#### B. Setup Google Sheets API Credentials

1. **Enable Google Sheets API**
   - Go to Google Cloud Console
   - Create new project or select existing
   - Enable Google Sheets API
   - Enable Google Drive API

2. **Create Service Account**
   ```bash
   # In Google Cloud Console:
   # 1. Go to IAM & Admin > Service Accounts
   # 2. Create Service Account
   # 3. Download JSON key file
   # 4. Share your Google Sheet with service account email
   ```

3. **Configure in n8n**
   - Go to n8n Credentials
   - Add "Google Sheets API" credential
   - Upload service account JSON file
   - Test connection

#### C. Update Workflow Sheet ID

1. **Get Sheet ID**
   ```
   # From Google Sheets URL:
   # https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit
   ```

2. **Update n8n Node**
   - Edit "Add to Google Sheets" node
   - Replace "your-google-sheet-id" with actual Sheet ID
   - Save workflow

### 4. Configure Email Service

#### A. Gmail SMTP Setup

1. **Enable 2-Factor Authentication**
   - Go to Google Account settings
   - Enable 2FA if not already enabled

2. **Generate App Password**
   ```bash
   # In Google Account:
   # Security > 2-Step Verification > App passwords
   # Generate password for "Mail"
   # Copy 16-character password
   ```

#### B. Configure SMTP in n8n

1. **Add SMTP Credentials**
   - Go to n8n Credentials
   - Add "SMTP" credential
   - Configure settings:
     ```
     Host: smtp.gmail.com
     Port: 587
     Security: STARTTLS
     Username: your-email@gmail.com
     Password: your-app-password
     ```

2. **Test Email**
   - Send test email from n8n
   - Verify delivery

#### C. Alternative Email Services

**Mailgun**
```
Host: smtp.mailgun.org
Port: 587
Username: postmaster@your-domain.mailgun.org
Password: your-mailgun-password
```

**SendGrid**
```
Host: smtp.sendgrid.net
Port: 587
Username: apikey
Password: your-sendgrid-api-key
```

### 5. Activate and Test Workflow

#### A. Activate Workflow

1. **Enable Workflow**
   - Open TableQ workflow in n8n
   - Click "Active" toggle
   - Workflow should show as "Active"

2. **Get Webhook URL**
   ```
   # Format:
   https://your-n8n-instance.com/webhook/tableq-webhook
   
   # Example:
   https://my-n8n.user.repl.co/webhook/tableq-webhook
   ```

#### B. Test with Sample Data

1. **Test POST Request**
   ```bash
   curl -X POST https://your-n8n-instance.com/webhook/tableq-webhook \
     -H "Content-Type: application/json" \
     -d '{
       "name": "John Doe",
       "email": "john.doe@email.com",
       "restaurant": "bella-vista",
       "party_size": 4,
       "join_time": "2024-01-15T18:30:00Z"
     }'
   ```

2. **Verify Results**
   - Check Google Sheets for new row
   - Check email inbox for confirmation
   - Verify webhook response

## 🔧 Workflow Node Configuration Details

### 1. Webhook Node Configuration
```json
{
  "httpMethod": "POST",
  "path": "tableq-webhook",
  "responseMode": "responseNode"
}
```

### 2. Google Sheets Node Configuration
```json
{
  "operation": "appendOrUpdate",
  "sheetName": "Queues",
  "values": {
    "Restaurant": "={{ $json.restaurant }}",
    "User Email": "={{ $json.email }}",
    "Party Size": "={{ $json.party_size }}",
    "Join Time": "={{ $json.join_time }}",
    "Status": "Waiting",
    "ETA": "={{ DateTime.fromISO($json.join_time).plus({minutes: 45}).toISO() }}"
  }
}
```

### 3. Email Node Configuration
- Professional HTML template with TableQ branding
- Dynamic data insertion from webhook
- Responsive design for mobile devices
- Automatic ETA calculation

## 🧪 Testing Scenarios

### Test Case 1: Basic Queue Join
```json
{
  "name": "Alice Smith",
  "email": "alice@example.com",
  "restaurant": "sakura-sushi",
  "party_size": 2,
  "join_time": "2024-01-15T19:00:00Z"
}
```

### Test Case 2: Large Party
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com", 
  "restaurant": "prime-steakhouse",
  "party_size": 8,
  "join_time": "2024-01-15T20:15:00Z"
}
```

### Test Case 3: Different Restaurant
```json
{
  "name": "Carol Johnson",
  "email": "carol@example.com",
  "restaurant": "garden-bistro", 
  "party_size": 3,
  "join_time": "2024-01-15T18:45:00Z"
}
```

## 🔒 Security Best Practices

### API Security
- Use HTTPS for all webhook URLs
- Implement webhook signature verification
- Rate limit webhook endpoints
- Validate all input data

### Credential Management
- Store all credentials securely in n8n
- Use environment variables for sensitive data
- Rotate API keys regularly
- Monitor credential usage

### Data Privacy
- Implement data retention policies
- Encrypt sensitive customer data
- Comply with GDPR/privacy regulations
- Audit data access logs

## 📊 Monitoring and Analytics

### Workflow Monitoring
```javascript
// Add logging to workflow nodes
console.log('Queue entry processed:', {
  restaurant: $json.restaurant,
  timestamp: new Date().toISOString(),
  partySize: $json.party_size
});
```

### Performance Metrics
- Track webhook response times
- Monitor email delivery rates
- Analyze queue join patterns
- Generate daily/weekly reports

## 🚨 Troubleshooting

### Common Issues

**1. Webhook Not Responding**
```bash
# Check n8n logs
docker logs n8n-container

# Verify webhook URL
curl -X GET https://your-n8n-instance.com/webhook/test
```

**2. Google Sheets Permission Error**
```bash
# Verify service account email has edit access
# Check API quotas in Google Cloud Console
# Ensure correct Sheet ID in workflow
```

**3. Email Delivery Issues**
```bash
# Test SMTP credentials
# Check spam folder
# Verify sender reputation
# Monitor bounce rates
```

**4. Data Format Errors**
```javascript
// Validate input data format
if (!$json.join_time || !Date.parse($json.join_time)) {
  throw new Error('Invalid join_time format');
}
```

## 🔄 Workflow Enhancements

### Advanced Features
1. **Queue Position Calculation**
   - Query existing Google Sheets data
   - Calculate real-time position
   - Update positions on status changes

2. **SMS Notifications**
   - Integrate Twilio or similar service
   - Send SMS updates for queue status
   - Support multiple notification channels

3. **Wait Time Prediction**
   - Analyze historical data
   - Machine learning predictions
   - Dynamic ETA updates

4. **Multi-Restaurant Support**
   - Restaurant-specific configurations
   - Custom branding per location
   - Separate sheet tabs per restaurant

## 📈 Production Deployment

### Scaling Considerations
- Use n8n Cloud for high availability
- Implement database backend for large volumes
- Set up monitoring and alerting
- Configure backup and disaster recovery

### Integration with TableQ App
```javascript
// Update webhook URL in TableQ application
const WEBHOOK_URL = 'https://your-n8n-instance.com/webhook/tableq-webhook';

// Make POST request from TableQ app
fetch(WEBHOOK_URL, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(queueData)
});
```

## 📞 Support

For technical support:
- Check n8n community forums
- Review Google Sheets API documentation
- Consult email service provider docs
- Contact TableQ support team

---

**Note**: Replace placeholder values (URLs, IDs, credentials) with your actual configuration before using in production.