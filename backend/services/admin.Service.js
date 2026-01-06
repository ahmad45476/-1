// services/adminService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// إنشاء instance من axios للإعدادات العامة
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// interceptor لإضافة التوكن تلقائياً
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('adminToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// interceptor للتعامل مع الأخطاء
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminData');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

const adminService = {
  // تسجيل دخول الأدمن
  login: async (email, password) => {
    try {
      const response = await api.post('/login', {
        email,
        password
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // إنشاء سوبر أدمن (للتجربة فقط)
  createSuperAdmin: async (adminData) => {
    try {
      const response = await api.post('/createsuper', adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // الحصول على إحصائيات الداشبورد
  getDashboardStats: async () => {
    try {
      const response = await api.get('/dashboard/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 الدوال الناقصة - إدارة الأدمن
  getAdminsList: async () => {
    try {
      const response = await api.get('/admins');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  createAdmin: async (adminData) => {
    try {
      const response = await api.post('/admins', adminData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  updateAdmin: async (adminId, updateData) => {
    try {
      const response = await api.put(`/admins/${adminId}`, updateData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  deleteAdmin: async (adminId) => {
    try {
      const response = await api.delete(`/admins/${adminId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  toggleAdminStatus: async (adminId, isActive) => {
    try {
      const response = await api.patch(`/admins/${adminId}/status`, {
        isActive
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال التقارير
  getReports: async (filters = {}) => {
    try {
      const response = await api.get('/reports', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  generateReport: async (reportData) => {
    try {
      const response = await api.post('/reports/generate', reportData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  exportReport: async (reportId, format = 'pdf') => {
    try {
      const response = await api.get(`/reports/export/${reportId}`, {
        params: { format },
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال المستخدمين
  getUsers: async (filters = {}) => {
    try {
      const response = await api.get('/users', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  getUserStats: async () => {
    try {
      const response = await api.get('/users/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال الأعمال الفنية
  getArtworks: async (filters = {}) => {
    try {
      const response = await api.get('/artworks', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  getArtworkStats: async () => {
    try {
      const response = await api.get('/artworks/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال مالية
  getFinancialStats: async (period = 'monthly') => {
    try {
      const response = await api.get('/financial/stats', {
        params: { period }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  getTransactions: async (filters = {}) => {
    try {
      const response = await api.get('/financial/transactions', {
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال الإعدادات
  getSettings: async () => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  updateSettings: async (settings) => {
    try {
      const response = await api.put('/settings', settings);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال الملفات والتحميل
  uploadFile: async (file, type) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال التسجيل والنشاط
  getActivityLogs: async (filters = {}) => {
    try {
      const response = await api.get('/activity-logs', { params: filters });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال التحقق
  verifyToken: async () => {
    try {
      const response = await api.get('/verify-token');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // 🔹 دوال النسخ الاحتياطي
  createBackup: async () => {
    try {
      const response = await api.post('/backup');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  restoreBackup: async (backupId) => {
    try {
      const response = await api.post(`/backup/${backupId}/restore`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

export default adminService;