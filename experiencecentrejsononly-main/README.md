# Experience Centre Document Processing API

This project provides a Django-based REST API for extracting structured information from uploaded documents (PDF, images) using Google Vertex AI's Gemini models. It features a comprehensive three-tier user management system with document processing limits, real-time streaming updates, and admin tools for user management.

## 🚀 Features

### Core Functionality
- Upload PDFs or images and process them with Vertex AI to extract JSON data
- Store uploaded documents and extraction results in a PostgreSQL database
- Record API response time, database save time, and the LLM model used for each upload
- JWT-based authentication and user registration endpoints
- Prompts for Gemini are defined in `Prompts/prompts.yaml` and can be customized
- Endpoints to filter documents by date and retrieve them using encrypted IDs

### User Management System
- **Three-tier user system** with different access levels and processing limits
- **Real-time streaming updates** during document processing
- **Usage tracking and limits** with automatic enforcement
- **Admin dashboard** for comprehensive user management
- **Page limitation** for PDF processing based on user type

### User Types

#### 🟢 Default User (Customers)
- **Document limit**: Maximum 20 documents per user
- **Page limit**: Only first 3 pages of each document processed
- **Usage display**: Shows counter like "15/20 documents"
- **Restrictions**: Blocked after reaching 20 documents
- **Contact info**: Directed to `plg@valuedx.com` or `plg@automationedge.com` for upgrades
- **Warnings**: Alert at 80% usage (16/20 documents)

#### 🟡 Power User (Sales, BA, Leads, Demo Team)
- **Document limit**: Unlimited documents
- **Page processing**: 3 pages by default with "Load Full Document" option
- **Flexibility**: Can process full documents on demand
- **Promotion**: Can be upgraded from Default User via admin interface

#### 🔴 Admin User (Site Admin, Sales)
- **Document limit**: Unlimited documents
- **Page processing**: 3 pages by default with "Load Full Document" option
- **Full access**: Can process entire documents on demand
- **User management**: Can view reports of all users
- **User promotion**: Can change user types (Default ↔ Power ↔ Admin)
- **Usage reports**: Access to comprehensive usage statistics
- **Reset capabilities**: Can reset user usage counters

### Advanced Features
- **Streaming progress updates**: Real-time feedback during document processing
- **Page limitation**: Automatic PDF page restriction based on user type
- **Usage analytics**: Comprehensive tracking of documents, pages, and token consumption
- **Admin reporting**: Detailed user statistics and usage patterns
- **Enhanced Django admin**: User-friendly interface for user management

## 📋 Requirements

- Python 3.10+
- PostgreSQL database
- Google Cloud service account with Vertex AI permissions
- The `vertexai` Python package and other dependencies from `requirements.txt`

## 🛠️ Setup

### 1. Clone the Repository

```bash
git clone <repo-url>
cd experiencecentrejsononly
```

### 2. Create and Activate Virtual Environment

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

**Note**: The updated requirements include PyPDF2 for PDF page processing.

### 4. Configure Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database Configuration
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Vertex AI Configuration
LOCATION=us-central1
MODEL_ID=gemini-1.5-flash
SERVICE_ACCOUNT_KEY_PATH=path/to/your/service-account-key.json
FERNET_KEY=your_fernet_key_here

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_smtp_user
EMAIL_HOST_PASSWORD=your_smtp_password
EMAIL_USE_TLS=True
DEFAULT_FROM_EMAIL=no-reply@example.com

# Frontend Configuration
FRONTEND_URL=http://localhost:3000
```

The `FRONTEND_URL` defines the base URL of your frontend application and is used to construct password reset links sent to users.

### 5. Generate Fernet Key

```bash
python ImageApp1/key.py
```

Copy the generated key to your `.env` file and `ImageApp1/config.properties`.

### 6. Apply Database Migrations

```bash
python manage.py makemigrations authentication
python manage.py makemigrations ImageApp1
python manage.py migrate
```

### 7. Create Superuser

```bash
python manage.py createsuperuser
```

Choose "admin" as user type during creation or update later via Django admin.

### 8. Run Development Server

```bash
python manage.py runserver
```

The API will be available at `http://127.0.0.1:8000/` by default.

## 📡 API Endpoints

### Authentication
- `POST /IDA/create_user/` – Register a new user (defaults to 'default' user type)
- `POST /IDA/login/` – Obtain JWT tokens
- `POST /IDA/token/refresh/` – Refresh access token using a refresh token
- `GET /profile/` – Fetch details of the authenticated user
- `POST /IDA/password-reset/` – Send a password reset email
- `POST /IDA/password-reset-confirm/` – Reset password using provided token

### Password Reset Example
```bash
# Request password reset email
curl -X POST http://localhost:8000/IDA/password-reset/ \
  -H "Content-Type: application/json" \
  -d '{"username_or_email": "john@example.com"}'
# Confirm password reset using the UID and token from the email
curl -X POST http://localhost:8000/IDA/password-reset-confirm/ \
  -H "Content-Type: application/json" \
  -d '{"uid": "<uid>", "token": "<token>", "password": "NewP@ssw0rd"}'
```

### Document Processing
- `POST /IDA/upload/` – Upload a document and receive extracted JSON
  - **New fields**: `pages_processed`, `is_full_document`, `progress_messages`, `usage_info`
  - **Parameters**: `process_full_document=true` (for power users only)
- `POST /IDA/process-full-document/` – Process full document (power users only)
- `GET /IDA/get-document/<doc_id>/` – Retrieve a document by encrypted ID

-### Document Management
- `GET /IDA/documents/` – List documents for authenticated user
  - **Default & Power users**: Only their own documents are returned
  - **Admin users**: Receive all documents in the system
  - **Includes**: User usage information and document page counts
- `POST /IDA/document-filter/` – Filter documents by date range

### User Statistics
- `GET /IDA/usage-stats/` – Get current user's usage statistics and limits

### Admin Endpoints (Admin users only)
- `GET /IDA/admin/user-report/` – Comprehensive user report with statistics
- `POST /IDA/admin/manage-user/` – Manage users (change type, reset usage, update limits)

### User Management (Admin functionality)
- `GET /users/` – List all users (admin access)

### Request Field Data Types

| Endpoint | Field | Type | Description |
|----------|-------|------|-------------|
| `POST /IDA/create_user/` | `username` | string | Unique username |
| `POST /IDA/create_user/` | `email` | string | User email address |
| `POST /IDA/create_user/` | `phone_number` | string | User's phone number |
| `POST /IDA/create_user/` | `password` | string | Account password |
| `POST /IDA/login/` | `username` | string | Username or email |
| `POST /IDA/login/` | `password` | string | Account password |
| `POST /IDA/password-reset/` | `username_or_email` | string | Username or email to reset |
| `POST /IDA/password-reset-confirm/` | `uid` | string | User identifier from email |
| `POST /IDA/password-reset-confirm/` | `token` | string | Reset token from email |
| `POST /IDA/password-reset-confirm/` | `password` | string | New account password |
| `POST /IDA/upload/` | `pdf_file` | file | PDF or image file |
| `POST /IDA/upload/` | `doc_type` | string | Processing mode |
| `POST /IDA/upload/` | `process_full_document` | boolean | Set `true` to process all pages (power users) |
| `POST /IDA/document-filter/` | `userid` | integer | User ID to filter by |
| `POST /IDA/document-filter/` | `date` | string | Date in `YYYY-MM-DD` format |
| `POST /IDA/admin/manage-user/` | `user_id` | integer | Target user's ID |
| `POST /IDA/admin/manage-user/` | `action` | string | `change_type`, `update_limit`, or `reset_usage` |

## 🎯 Usage Examples

### Default User Upload
```bash
curl -X POST http://localhost:8000/IDA/upload/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "pdf_file=@document.pdf" \
  -F "doc_type=docextraction"

# Response includes usage info:
{
  "status": "success",
  "document_id": "encrypted_id",
  "pages_processed": 3,
  "is_full_document": false,
  "progress_messages": [...],
  "usage_info": {
    "documents_processed": 15,
    "max_documents_allowed": 20,
    "user_type": "default",
    "can_process_more": true
  }
}
```

### Power User Full Document Processing
```bash
curl -X POST http://localhost:8000/IDA/process-full-document/ \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"document_id": "encrypted_document_id"}'
```

### Admin User Report
```bash
curl -X GET http://localhost:8000/IDA/admin/user-report/ \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN"

# Returns comprehensive user statistics and usage patterns
```

### Change User Type (Admin)
```bash
curl -X POST http://localhost:8000/IDA/admin/manage-user/ \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "action": "change_type",
    "new_type": "power"
  }'
```

## 🔧 Configuration

### Prompts Configuration
Edit `Prompts/prompts.yaml` to customize AI prompts:

```yaml
prompts:
  doc_extraction_prompt: |
    Extract all information from the document...
  
  reimbursement_extraction_prompt: |
    Classify expenses and determine reimbursement eligibility...
```

### User Type Configuration
Default settings in `authentication/models.py`:

```python
USER_TYPE_CHOICES = [
    ('default', 'Default User'),    # 20 docs, 3 pages
    ('power', 'Power User'),        # Unlimited docs, 3 pages + full option
    ('admin', 'Admin User'),        # Unlimited docs, 3 pages + full option
]
```

### Document Processing Limits
Configure in `ImageApp1/views.py`:

```python
# Page limits by user type
if user.user_type == 'default':
    max_pages = 3                   # Always 3 pages
elif user.user_type == 'power' and not process_full_document:
    max_pages = 3                   # 3 pages unless full requested
# Admin users get no limit (max_pages = None)
```

## 👨‍💼 Admin Features

### Django Admin Interface
Access at `http://localhost:8000/admin/` with superuser credentials.

**Enhanced features:**
- User type management with dropdown selection
- Usage statistics display with color-coded warnings
- Bulk actions: Convert to Power User, Reset Usage, Increase Limits
- Document processing history and token consumption tracking

### User Management Dashboard
Programmatic access via API endpoints:

- **User Reports**: Complete statistics, usage patterns, registration info
- **User Type Changes**: Promote/demote users between types
- **Usage Management**: Reset counters, adjust limits
- **Activity Monitoring**: Track active/inactive users, approaching limits

### Monitoring and Analytics
Track key metrics:
- Total users by type (Default/Power/Admin)
- Users at or approaching limits
- Document and page processing statistics
- Token consumption and API usage patterns
- Recent registrations and activity levels

## 🔄 Migration Guide

### Upgrading Existing Installation

1. **Backup your database**
2. **Install new dependencies**:
   ```bash
   pip install PyPDF2==3.0.1
   ```
3. **Apply migrations**:
   ```bash
   python manage.py migrate
   ```
4. **Update existing users**:
   ```bash
   python manage.py shell
   >>> from authentication.models import CustomUser
   >>> CustomUser.objects.filter(user_type='').update(user_type='default')
   ```

### Data Migration Notes
- Existing users will be set to 'default' type
- Document processing history is preserved
- New usage tracking starts from migration date
- Admin users need to be manually designated

## 🧪 Testing

### Testing User Restrictions

**Default User Testing:**
```bash
# Test document limits
for i in {1..21}; do
  curl -X POST .../upload/ ... # Should block at 21
done

# Test page limitations
# Upload a 10-page PDF, verify only 3 pages processed
```

**Power User Testing:**
```bash
# Test unlimited documents
# Test "Load Full Document" functionality
curl -X POST .../process-full-document/ ...
```

**Admin Testing:**
```bash
# Test user management
curl -X GET .../admin/user-report/
curl -X POST .../admin/manage-user/ ...
```

### Load Testing
- Test concurrent uploads with streaming updates
- Verify database usage counter accuracy
- Test PDF page limitation with various file sizes

## 📁 Project Structure

```
experiencecentrejsononly/
├── ImageApp1/                  # Main application
│   ├── migrations/            # Database migrations
│   ├── admin_views.py         # Admin user management views
│   ├── models.py              # Document model with page tracking
│   ├── vertex_model.py        # AI processing with streaming
│   ├── views.py               # API views with restrictions
│   └── ...
├── authentication/            # User management
│   ├── models.py              # Enhanced user model
│   ├── admin.py               # Django admin integration
│   └── ...
├── Prompts/
│   └── prompts.yaml           # AI prompts configuration
├── .env.example               # Environment variables template
├── requirements.txt           # Python dependencies
└── README.md                  # This file
```

## 🚨 Security Considerations

- **Document ID Encryption**: All document IDs are encrypted using Fernet
- **JWT Authentication**: All endpoints require valid JWT tokens
- **User Permission Checks**: Strict access control based on user types
- **File Upload Validation**: Restricted to PDF, JPG, PNG formats
- **Usage Limit Enforcement**: Server-side validation prevents bypass

## 📊 Monitoring and Logging

### Log Files
- Location: `logs/ImageExtraction_logs/`
- Format: Structured logging with timestamps and levels
- Includes: API calls, user actions, processing status, errors

### Key Metrics to Monitor
- **User Growth**: New registrations by type
- **Usage Patterns**: Documents processed per user type
- **Limit Adherence**: Users approaching/at limits
- **Processing Performance**: API response times, page processing rates
- **Error Rates**: Failed uploads, processing errors

## 🤝 Support and Contacts

### For Users Reaching Limits
- **Email**: plg@valuedx.com, plg@automationedge.com
- **Message**: Displayed automatically when users hit 20 document limit
- **Upgrade Path**: Contact sales team for Power User promotion

### For Technical Issues
- Check logs in `logs/ImageExtraction_logs/`
- Verify environment variables and API keys
- Ensure PostgreSQL and Vertex AI connectivity
- Review Django admin for user/document status

## 📈 Scaling Considerations

### Database Optimization
- Index on `user_type`, `documents_processed` for admin queries
- Archive old documents to manage storage
- Monitor token consumption for cost management

### Performance Optimization
- Implement caching for user usage statistics
- Consider async processing for large documents
- Use database connection pooling for high load

### Feature Extensions
- **Rate limiting**: API call limits per user type
- **Storage quotas**: File size limits per user type
- **Advanced analytics**: Usage dashboards and reporting
- **Notification system**: Email alerts for limit warnings

## 📄 License

This project is provided as-is without any warranty.

---

## 🚀 Quick Start Commands

```bash
# Complete setup
git clone <repo-url> && cd experiencecentrejsononly
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env with your values
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver

# Test default user upload
curl -X POST http://localhost:8000/IDA/upload/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "pdf_file=@test.pdf" \
  -F "doc_type=docextraction"

# Access admin dashboard
# Visit: http://localhost:8000/admin/
```

This implementation provides a robust, scalable document processing system with comprehensive user management and real-time processing feedback.
