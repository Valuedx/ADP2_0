import { apiClient } from '@/services/apiClient';

export const apiService = {
  login: async (username: string, password: string) => {
    return apiClient('/login/', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
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

  listDocuments: async () => {
    return apiClient('/documents/');
  },

  filterDocuments: async (userId: string, date: string) => {
    return apiClient('/document-filter/', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, date }),
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
    return apiClient(`/get-document/${documentId}/`);
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
};