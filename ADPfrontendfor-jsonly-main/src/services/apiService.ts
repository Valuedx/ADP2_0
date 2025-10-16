import { apiClient } from '@/services/apiClient';
import config from '@/config';
import { store } from '@/store';

export interface LoginResponse {
  access: string;
  refresh: string;
  username: string;
  userType: 'default' | 'power' | 'admin';
  id: number;
  message?: string;
}

export interface DocumentListResponse {
  count: number;
  documents: Record<string, unknown>[];
  totalInputTokens: number;
  totalOutputTokens: number;
}

export const apiService = {
  login: async (username: string, password: string): Promise<LoginResponse> => {
    return apiClient('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }) as Promise<LoginResponse>;
  },

  createUser: async (
    username: string,
    email: string,
    phoneNumber: string,
    password: string
  ) => {
    return apiClient('/create_user/', {
      method: 'POST',
      body: JSON.stringify({
        username,
        email,
        phone_number: phoneNumber,
        password,
      }),
    });
  },

  confirmPasswordReset: async (
    uid: string,
    token: string,
    newPassword: string
  ) => {
    return apiClient(
      '/password-reset-confirm/',
      {
        method: 'POST',
        body: JSON.stringify({ uid, token, new_password: newPassword }),
      },
      false
    );
  },

  listDocuments: async (): Promise<DocumentListResponse> => {
    return apiClient('/documents/') as Promise<DocumentListResponse>;
  },

  filterDocuments: async (userId: string, date: string) => {
    return apiClient('/document-filter/', {
      method: 'POST',
      body: JSON.stringify({ userid: userId, date }),
    });
  },
  uploadDocument: async (
    file: File,
    docType: string,
    processFullDocument = false,
    prompt?: string
  ) => {
    const formData = new FormData();
    formData.append('pdf_file', file);
    formData.append('doc_type', docType);
    if (prompt) {
      formData.append('prompt_text', prompt);
    }
    if (processFullDocument) {
      formData.append('process_full_document', 'true');
    }
    return apiClient('/upload/', {
      method: 'POST',
      body: formData,
    });
  },

  processFullDocument: async (documentId: string) => {
    return apiClient('/process-full-document/', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId }),
    });
  },

  getUsageStats: async () => {
    return apiClient('/usage-stats/');
  },

  getUserReport: async () => {
    return apiClient('/admin/user-report/');
  },

  getDocument: async (documentId: string) => {
    return apiClient(`/get-document/${encodeURIComponent(documentId)}/`);
  },

  requestPasswordReset: async (value: string) => {
    return apiClient(
      '/password-reset/',
      {
        method: 'POST',
        body: JSON.stringify({ username_or_email: value }),
      },
      false
    );
  },

  manageUser: async (userId: string, action: string, data = {}) => {
    return apiClient('/admin/manage-user/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, action, ...data }),
    });
  },

  generateHTML: async (documentId: string) => {
    return apiClient('/generate-html/', {
      method: 'POST',
      body: JSON.stringify({ document_id: documentId }),
    });
  },

  generatePDF: async (documentId: string) => {
    const response = await fetch(`${config.API_BASE_URL}/generate-pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.getState().auth.accessToken}`
      },
      body: JSON.stringify({ document_id: documentId })
    });
    return response;
  },

  generateDOC: async (documentId: string) => {
    const response = await fetch(`${config.API_BASE_URL}/generate-doc/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${store.getState().auth.accessToken}`
      },
      body: JSON.stringify({ document_id: documentId })
    });
    return response;
  },
};