// services/financialService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/financial';

const financialService = {
  // الحصول على المعاملات
  getTransactions: async (token, filters = {}) => {
    try {
      const response = await axios.get(`${API_URL}/transactions`, {
        headers: { Authorization: `Bearer ${token}` },
        params: filters
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  },

  // الإحصائيات المالية
  getFinancialStats: async (token) => {
    try {
      const response = await axios.get(`${API_URL}/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Network error' };
    }
  }
};

export default financialService;