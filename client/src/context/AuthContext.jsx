import { createContext, useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // دالة للتحقق من صحة التوكن
  const verifyToken = async (token) => {
    try {
      // إرسال طلب للتحقق من التوكن
      const response = await axios.get('http://localhost:5000/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Token verification failed:', error);
      return null;
    }
  };

  // تحميل بيانات المستخدم عند التهيئة
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('artAppToken');
      const storedUser = localStorage.getItem('artAppUser');
      
      if (token) {
        try {
          // التحقق من صحة التوكن
          const userData = await verifyToken(token);
          
          if (userData) {
            // إذا كان التوكن صالحًا، تحديث بيانات المستخدم
            setCurrentUser(userData);
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            // إذا كان التوكن غير صالح، تسجيل الخروج
            logout();
          }
        } catch (error) {
          console.error('Auth initialization error:', error);
          logout();
        }
      } else if (storedUser) {
        // إذا كان هناك مستخدم مخزن ولكن بدون توكن، تسجيل الخروج
        logout();
      }
      
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // تسجيل الدخول بعد التسجيل
  const loginWithRegister = async (user, token) => {
    try {
      // التحقق من صحة التوكن
      const verifiedUser = await verifyToken(token);
      
      if (!verifiedUser) {
        throw new Error('Token verification failed');
      }
      
      // حفظ البيانات في localStorage
      localStorage.setItem('artAppUser', JSON.stringify(verifiedUser));
      localStorage.setItem('artAppToken', token);
      
      // تعيين الهيدر الافتراضي لطلبات axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(verifiedUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'فشل تسجيل الدخول بعد التسجيل'
      };
    }
  };

  // تسجيل الدخول العادي
  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password
      });
      
      const { user, token } = response.data.data;
      
      // التحقق من صحة التوكن
      const verifiedUser = await verifyToken(token);
      
      if (!verifiedUser) {
        throw new Error('Token verification failed');
      }
      
      // حفظ البيانات في localStorage
      localStorage.setItem('artAppUser', JSON.stringify(verifiedUser));
      localStorage.setItem('artAppToken', token);
      
      // تعيين الهيدر الافتراضي لطلبات axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setCurrentUser(verifiedUser);
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'فشل تسجيل الدخول'
      };
    }
  };

  // تسجيل الخروج
  const logout = () => {
    localStorage.removeItem('artAppUser');
    localStorage.removeItem('artAppToken');
    delete axios.defaults.headers.common['Authorization'];
    setCurrentUser(null);
    navigate('/login');
  };

  const value = {
    currentUser,
    login,
    logout,
    isAuthenticated: !!currentUser,
    loginWithRegister,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}