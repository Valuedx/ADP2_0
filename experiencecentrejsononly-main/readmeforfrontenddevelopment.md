# Document Processing Backend API - Frontend Developer Guide

A comprehensive Django REST API for intelligent document processing with Google Vertex AI integration. This guide is specifically designed for frontend developers working with React applications.

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- PostgreSQL database
- Google Cloud service account with Vertex AI permissions
- Node.js and React for frontend development

### Backend Setup

1. **Clone and Setup Environment**
```bash
git clone <repository-url>
cd backend-project
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

2. **Environment Configuration**
```bash
cp .env.example .env
```

Configure your `.env` file:
```env
# Database
DB_NAME=your_database_name
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_HOST=localhost
DB_PORT=5432

# Vertex AI
LOCATION=us-central1
MODEL_ID=gemini-1.5-flash
SERVICE_ACCOUNT_KEY_PATH=path/to/service-account-key.json
FERNET_KEY=your_fernet_key_here
```

3. **Database Setup**
```bash
python manage.py migrate
python manage.py createsuperuser
```

4. **Start Development Server**
```bash
python manage.py runserver
```
API will be available at `http://127.0.0.1:8000/`

## 🏗️ API Architecture Overview

### Base URL
- **Development**: `http://127.0.0.1:8000/IDA`
- **Production**: Update in your frontend config

### Authentication
All endpoints (except registration/login) require JWT authentication:
```javascript
headers: {
  'Authorization': `Bearer ${accessToken}`,
  'Content-Type': 'application/json'
}
```

## 👥 User Management System

### User Types & Permissions

| User Type | Document Limit | Page Processing | Special Features |
|-----------|----------------|-----------------|------------------|
| **Default** | 20 documents | 3 pages max | Basic processing |
| **Power** | Unlimited | 3 pages + full option | Can process entire documents |
| **Admin** | Unlimited | 3 pages + full option | User management access |

### User Registration & Authentication

#### Register New User
```javascript
// POST /IDA/create_user/
const registerUser = async (userData) => {
  const response = await fetch(`${API_BASE_URL}/create_user/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      phone_number: userData.phone,
      password: userData.password
    })
  });
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| username | string | Unique username |
| email | string | User email address |
| phone_number | string | User's phone number |
| password | string | Account password |

**Response:**
```json
{
  "token": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "message": "User created successfully"
}
```

#### User Login
```javascript
// POST /IDA/login/
const loginUser = async (credentials) => {
  const response = await fetch(`${API_BASE_URL}/login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: credentials.username,
      password: credentials.password
    })
  });
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| username | string | Username or email |
| password | string | Account password |

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "username": "john_doe",
  "id": 123,
  "role": "default",
  "message": "Login successful"
}
```

#### Request Password Reset
```javascript
// POST /IDA/password-reset/
const requestPasswordReset = async (emailOrUsername) => {
  const response = await fetch(`${API_BASE_URL}/password-reset/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username_or_email: emailOrUsername })
  });
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| username_or_email | string | Username or email associated with the account |

#### Confirm Password Reset
```javascript
// POST /IDA/password-reset-confirm/
const confirmPasswordReset = async (uid, token, newPassword) => {
  const response = await fetch(`${API_BASE_URL}/password-reset-confirm/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ uid, token, password: newPassword })
  });
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| uid | string | User identifier from email |
| token | string | Reset token from email |
| password | string | New account password |

## 📄 Document Processing

### Upload and Process Document

The core functionality for document processing with real-time progress updates.

```javascript
// POST /IDA/upload/
const uploadDocument = async (file, options = {}) => {
  const formData = new FormData();
  formData.append('pdf_file', file);
  formData.append('doc_type', options.docType || 'docextraction');
  
  // Optional: Custom prompt
  if (options.prompt) {
    formData.append('prompt_text', options.prompt);
  }
  
  // Power users can process full documents
  if (options.processFullDocument && userType === 'power') {
    formData.append('process_full_document', 'true');
  }

  const response = await fetch(`${API_BASE_URL}/upload/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    body: formData
  });
  
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| pdf_file | file | PDF or image to process |
| doc_type | string | Processing mode |
| prompt_text | string | Optional custom prompt |
| process_full_document | boolean | 'true' to process all pages (power users) |

**Response:**
```json
{
  "status": "success",
  "document_id": "encrypted_document_id",
  "pages_processed": 3,
  "is_full_document": false,
  "progress_messages": [
    {"timestamp": 1640995200, "message": "Starting document processing..."},
    {"timestamp": 1640995205, "message": "Processing AI response..."}
  ],
  "usage_info": {
    "documents_processed": 15,
    "max_documents_allowed": 20,
    "user_type": "default",
    "can_process_more": true
  },
  "can_load_full_document": true,
  "message": "Processed first 3 pages. You can load the full document if needed."
}
```

### Document Types

| Type | Description | Use Case |
|------|-------------|----------|
| `docextraction` | General document extraction | Invoices, forms, certificates |
| `Bill Reimbursment` | Expense processing | Travel expenses, receipts |

### Process Full Document (Power Users Only)

```javascript
// POST /IDA/process-full-document/
const processFullDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/process-full-document/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      document_id: documentId
    })
  });
  
  return response.json();
};
```

## 📊 Document Management

### Get User Documents

```javascript
// GET /IDA/documents/
const getUserDocuments = async () => {
  const response = await fetch(`${API_BASE_URL}/documents/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
};
```

**Response:**
```json
{
  "count": 15,
  "documents": [
    {
      "id": "encrypted_id",
      "filename": "invoice_001.pdf",
      "entry_date": "2024-01-15",
      "pages_processed": 3,
      "is_full_document": false,
      "input_token": 1250,
      "output_token": 850,
      "document_type": "docextraction"
    }
  ],
  "total_input_tokens": 18750,
  "total_output_tokens": 12850,
  "user_usage": {
    "documents_processed": 15,
    "max_documents_allowed": 20,
    "user_type": "default",
    "can_process_more": true
  }
}
```

### Get Document by ID

```javascript
// GET /IDA/get-document/{encrypted_id}/
const getDocument = async (documentId) => {
  const response = await fetch(`${API_BASE_URL}/get-document/${documentId}/`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| documentId | string | Encrypted document ID |

**Response:**
```json
{
  "status": "success",
  "filePath": "http://127.0.0.1:8000/media/uploads/pdf_files/invoice_001.pdf",
  "json_data": {
    "page_1": {
      "metadata": {...},
      "parties": {...},
      "line_items": [...],
      "financial_summary": {...}
    }
  },
  "input_token": 1250,
  "output_token": 850,
  "api_response_time": 2.45,
  "pages_processed": 3,
  "is_full_document": false
}
```

### Filter Documents

```javascript
// POST /IDA/document-filter/
const filterDocuments = async (userId, date) => {
  const response = await fetch(`${API_BASE_URL}/document-filter/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      userid: userId,
      date: date // Format: YYYY-MM-DD
    })
  });
  
  return response.json();
};
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| userid | integer | ID of the user whose documents to filter |
| date | string | Date in `YYYY-MM-DD` format |

## 📈 Usage Statistics

### Get Current User Usage

```javascript
// GET /IDA/usage-stats/
const getUsageStats = async () => {
  const response = await fetch(`${API_BASE_URL}/usage-stats/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
};
```

**Response:**
```json
{
  "status": "success",
  "usage_stats": {
    "documents_processed": 15,
    "max_documents_allowed": 20,
    "total_pages_processed": 45,
    "user_type": "default",
    "can_process_more": true,
    "recent_documents_30d": 8,
    "last_document_date": "2024-01-15",
    "registration_date": "2023-12-01",
    "days_registered": 45,
    "usage_percentage": 75.0,
    "warning": "You're approaching your document limit. Contact plg@valuedx.com for upgrade."
  }
}
```

## 👨‍💼 Admin Endpoints

### Get User Report (Admin Only)

```javascript
// GET /IDA/admin/user-report/
const getUserReport = async () => {
  const response = await fetch(`${API_BASE_URL}/admin/user-report/`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });
  
  return response.json();
};
```

### Manage Users (Admin Only)

```javascript
// POST /IDA/admin/manage-user/
const manageUser = async (userId, action, data = {}) => {
  const response = await fetch(`${API_BASE_URL}/admin/manage-user/`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      user_id: userId,
      action: action, // 'change_type', 'update_limit', 'reset_usage'
      ...data
    })
  });
  
  return response.json();
};

// Examples:
// Change user type
await manageUser(123, 'change_type', { new_type: 'power' });

// Update document limit
await manageUser(123, 'update_limit', { new_limit: 50 });

// Reset usage
await manageUser(123, 'reset_usage');
```

**Request Fields**

| Field | Type | Description |
|-------|------|-------------|
| user_id | integer | Target user's ID |
| action | string | 'change_type', 'update_limit', or 'reset_usage' |
| new_type | string | Required when action is 'change_type' |
| new_limit | integer | Required when action is 'update_limit' |

## 🔧 Frontend Integration Examples

### React Hooks for API Integration

#### Custom Hook for Document Upload

```javascript
// hooks/useDocumentUpload.js
import { useState } from 'react';
import { toast } from 'sonner';

export const useDocumentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState([]);

  const uploadDocument = async (file, options = {}) => {
    setIsUploading(true);
    setProgress(['Starting upload...']);

    try {
      const formData = new FormData();
      formData.append('pdf_file', file);
      formData.append('doc_type', options.docType || 'docextraction');

      if (options.processFullDocument) {
        formData.append('process_full_document', 'true');
      }

      const response = await fetch(`${API_BASE_URL}/upload/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${options.accessToken}`
        },
        body: formData
      });

      const result = await response.json();

      if (result.status === 'success') {
        setProgress(result.progress_messages?.map(p => p.message) || []);
        toast.success('Document processed successfully!');
        return result;
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      toast.error(error.message);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadDocument, isUploading, progress };
};
```

#### Custom Hook for Usage Statistics

```javascript
// hooks/useUsageStats.js
import { useState, useEffect } from 'react';

export const useUsageStats = (accessToken) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/usage-stats/`, {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        });
        const data = await response.json();
        setStats(data.usage_stats);
      } catch (error) {
        console.error('Failed to fetch usage stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchStats();
      // Refresh every 30 seconds
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [accessToken]);

  return { stats, loading };
};
```

### Redux Integration Example

```javascript
// store/authSlice.js
import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    accessToken: null,
    user: null,
    userType: null,
    documentsProcessed: 0,
    maxDocumentsAllowed: 0
  },
  reducers: {
    setAuthData: (state, action) => {
      const { access, user, role } = action.payload;
      state.accessToken = access;
      state.user = user;
      state.userType = role;
    },
    updateUsageStats: (state, action) => {
      const { documents_processed, max_documents_allowed } = action.payload;
      state.documentsProcessed = documents_processed;
      state.maxDocumentsAllowed = max_documents_allowed;
    }
  }
});

export const { setAuthData, updateUsageStats } = authSlice.actions;
export default authSlice.reducer;
```

## 🚨 Error Handling

### Common Error Responses

```javascript
// Document limit reached (403)
{
  "error": "Document limit reached (15/20). Please contact plg@valuedx.com for upgrade.",
  "usage_info": {
    "documents_processed": 20,
    "max_documents_allowed": 20,
    "user_type": "default"
  }
}

// Unauthorized (401)
{
  "detail": "Token has expired"
}

// Permission denied (403)
{
  "error": "You do not have permission to view this document."
}

// Server error (500)
{
  "error": "An internal server error occurred"
}
```

### Error Handling Utility

```javascript
// utils/errorHandler.js
export const handleApiError = (error, navigate) => {
  if (error.status === 401) {
    // Token expired
    localStorage.clear();
    navigate('/login');
    toast.error('Session expired. Please login again.');
  } else if (error.status === 403) {
    if (error.message?.includes('document limit')) {
      toast.error('Document limit reached. Please contact support for upgrade.');
    } else {
      toast.error('Access denied.');
    }
  } else {
    toast.error(error.message || 'An unexpected error occurred.');
  }
};
```

## 🎯 Frontend Configuration

### Environment Variables

Create a `.env` file in your React project:

```env
# Development
REACT_APP_API_BASE_URL=http://127.0.0.1:8000/IDA
REACT_APP_IMG_BASE_URL=http://127.0.0.1:8000

# Production
# REACT_APP_API_BASE_URL=https://your-production-api.com/IDA
# REACT_APP_IMG_BASE_URL=https://your-production-api.com
```

### API Configuration

```javascript
// config/api.js
const config = {
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/IDA',
  IMG_BASE_URL: process.env.REACT_APP_IMG_BASE_URL || 'http://127.0.0.1:8000'
};

export default config;
```

## 🔐 Security Best Practices

### JWT Token Management

```javascript
// utils/tokenManager.js
export const TokenManager = {
  setTokens: (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
  },

  getAccessToken: () => localStorage.getItem('accessToken'),

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  }
};
```

### Axios Interceptor for Auto Token Refresh

```javascript
// utils/apiClient.js
import axios from 'axios';
import { TokenManager } from './tokenManager';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL
});

apiClient.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      TokenManager.clearTokens();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

## 📋 Testing API Endpoints

### Using curl Commands

```bash
# Login
curl -X POST http://127.0.0.1:8000/IDA/login/ \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "testpass"}'

# Upload document
curl -X POST http://127.0.0.1:8000/IDA/upload/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "pdf_file=@/path/to/document.pdf" \
  -F "doc_type=docextraction"

# Get documents
curl -X GET http://127.0.0.1:8000/IDA/documents/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Postman Collection

You can create a Postman collection with these endpoints for easy testing:

1. **Authentication**
   - POST `/IDA/login/`
   - POST `/IDA/create_user/`

2. **Document Processing**
   - POST `/IDA/upload/`
   - POST `/IDA/process-full-document/`
   - GET `/IDA/get-document/{id}/`

3. **Document Management**
   - GET `/IDA/documents/`
   - POST `/IDA/document-filter/`

4. **Admin Endpoints**
   - GET `/IDA/admin/user-report/`
   - POST `/IDA/admin/manage-user/`

## 🚀 Performance Optimization

### File Upload Progress

```javascript
// components/FileUploadWithProgress.jsx
const FileUploadWithProgress = ({ onUpload }) => {
  const [progress, setProgress] = useState(0);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('doc_type', 'docextraction');

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        setProgress((e.loaded / e.total) * 100);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        onUpload(response);
      }
    });

    xhr.open('POST', `${API_BASE_URL}/upload/`);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
    xhr.send(formData);
  };

  return (
    <div>
      {progress > 0 && (
        <div className="progress-bar">
          <div style={{ width: `${progress}%` }}></div>
        </div>
      )}
      {/* File input component */}
    </div>
  );
};
```

## 📞 Support and Contact

### For Users Reaching Limits
- **Email**: plg@valuedx.com, plg@automationedge.com
- **Upgrade Path**: Contact sales team for Power User promotion

### For Technical Issues
- Check backend logs in `logs/ImageExtraction_logs/`
- Verify environment variables and API keys
- Ensure PostgreSQL and Vertex AI connectivity

## 📝 Changelog

### Recent Updates
- Added real-time processing progress updates
- Implemented three-tier user management system
- Enhanced page limitation for PDF processing
- Added comprehensive admin dashboard endpoints
- Improved error handling and validation

---

This documentation provides everything needed for frontend developers to integrate with the document processing backend. The API is designed to be developer-friendly with consistent response formats, comprehensive error handling, and real-time feedback capabilities.
