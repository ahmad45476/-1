import React, { useState } from 'react';
import axios from 'axios';

const AddArtwork = () => {
  const [isSaved, setIsSaved] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    image: null
  });

  if (isSaved) {
    return <div className="text-center mt-10 text-green-600 font-bold text-xl">
      تم حفظ العمل الفني بنجاح! 🎉
    </div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const form = new FormData();
      form.append('title', formData.title);
      form.append('description', formData.description);
      form.append('category', formData.category);
      form.append('image', formData.image);
      form.append('artistId', '68c91efc4f6e3fafd7f65b05'); // عدل حسب المستخدم الحقيقي

      const response = await axios.post('http://localhost:5000/api/artworks', form, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('تم النشر:', response.data);
      setIsSaved(true);  // <-- مهم هنا لتغيير العرض
      setFormData({
        title: '',
        description: '',
        category: '',
        image: null
      });
    } catch (error) {
      console.error('فشل في النشر:', error.response?.data || error.message);
      alert('❌ حدث خطأ أثناء النشر');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">إضافة عمل فني جديد</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">عنوان العمل</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
        </div>

        <div>
          <label className="block mb-1">وصف العمل</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            rows="4"
          />
        </div>

        <div>
          <label className="block mb-1">التصنيف</label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({...formData, category: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="أدخل تصنيف العمل الفني"
            required
          />
        </div>

        <div>
          <label className="block mb-1">الصورة</label>
          <input
            type="file"
            onChange={(e) => setFormData({...formData, image: e.target.files[0]})}
            className="w-full px-4 py-2 border rounded-lg"
            accept="image/*"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-[#d5006d] text-white py-3 rounded-lg hover:bg-[#b0005a]"
        >
          نشر العمل
        </button>
      </form>
    </div>
  );
};

export default AddArtwork;
