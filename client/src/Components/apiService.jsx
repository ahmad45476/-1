import axios from 'axios';

// إعداد axios للاتصال بخدمة المنشورات
const postApi = axios.create({
  baseURL: 'http://localhost:5002/api/posts',
  timeout: 10000,
});

// إضافة التوكن تلقائياً لكل طلب
postApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('artAppToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// إعداد axios للاتصال بخدمة التفاعلات (Likes, Comments, Ratings)
const interactionApi = axios.create({
  baseURL: 'http://localhost:5002/api/posts',  // عدل حسب بورت خدمة التفاعل
  timeout: 10000,
});

// نفس فكرة التوكن إذا تستخدمه في التفاعلات أيضاً
interactionApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('artAppToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// تعريف خدمات المنشورات
export const postService = {
  createPost: (postData) => postApi.post('/posts', postData),
  getAllPosts: () => postApi.get('/posts'),
  getPostById: (id) => postApi.get(`/posts/${id}`),
  updatePost: (id, postData) => postApi.put(`/posts/${id}`, postData),
  deletePost: (id) => postApi.delete(`/posts/${id}`),

  // للتحقق من صحة اتصال الخادم
  checkHealth: () => postApi.get('/health'),
};

// تعريف خدمات التفاعل
export const interactionService = {
  getLikesCount: (artworkId) => interactionApi.get(`/interactions/${artworkId}/likes`),
  getComments: (artworkId) => interactionApi.get(`/interactions/${artworkId}/comments`),
  getAverageRating: (artworkId) => interactionApi.get(`/interactions/${artworkId}/rating`),
};
