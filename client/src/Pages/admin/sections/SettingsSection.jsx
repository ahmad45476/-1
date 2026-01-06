import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  Bell, 
  Shield, 
  Palette, 
  Globe,
  User,
  Lock,
  Eye,
  Download,
  Trash2,
  Mail,
  Smartphone
} from 'lucide-react';

const SettingsSection = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false
    },
    appearance: {
      theme: 'dark',
      language: 'ar'
    },
    security: {
      loginAlerts: true,
      sessionTimeout: 30
    }
  });

  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // محاكاة حفظ الإعدادات
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    alert('✅ تم حفظ الإعدادات بنجاح');
  };

  const updateSettings = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const settingSections = [
    {
      id: 'notifications',
      title: 'الإشعارات',
      icon: Bell,
      fields: [
        {
          key: 'email',
          label: 'الإشعارات عبر البريد الإلكتروني',
          type: 'toggle',
          description: 'استقبال الإشعارات على بريدك الإلكتروني',
          icon: Mail
        },
        {
          key: 'push',
          label: 'الإشعارات الفورية',
          type: 'toggle',
          description: 'إشعارات فورية في المتصفح',
          icon: Bell
        }
      ]
    },
    {
      id: 'appearance',
      title: 'المظهر',
      icon: Palette,
      fields: [
        {
          key: 'theme',
          label: 'السمة',
          type: 'select',
          options: [
            { value: 'dark', label: 'داكن' },
            { value: 'light', label: 'فاتح' }
          ],
          description: 'اختر المظهر المناسب لك',
          icon: Palette
        },
        {
          key: 'language',
          label: 'اللغة',
          type: 'select',
          options: [
            { value: 'ar', label: 'العربية' },
            { value: 'en', label: 'English' }
          ],
          description: 'لغة واجهة المستخدم',
          icon: Globe
        }
      ]
    },
    {
      id: 'security',
      title: 'الأمان',
      icon: Lock,
      fields: [
        {
          key: 'loginAlerts',
          label: 'تنبيهات تسجيل الدخول',
          type: 'toggle',
          description: 'إشعار عند تسجيل الدخول من جهاز جديد',
          icon: Bell
        },
        {
          key: 'sessionTimeout',
          label: 'مدة الجلسة (دقيقة)',
          type: 'number',
          description: 'المدة قبل انتهاء الجلسة تلقائيًا',
          icon: Lock
        }
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">الإعدادات</h1>
          <p className="text-gray-400">إدارة إعدادات الحساب والمنصة</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center gap-2"
        >
          {saving ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Save className="w-5 h-5" />
          )}
          {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
        </button>
      </motion.div>

      <div className="space-y-6">
        {settingSections.map((section, sectionIndex) => (
          <motion.div
            key={section.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: sectionIndex * 0.1 }}
            className="bg-gray-800 rounded-2xl border border-gray-700 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-r from-[#d5006d] to-[#ff4081] rounded-xl">
                <section.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white">{section.title}</h3>
            </div>

            <div className="space-y-6">
              {section.fields.map((field, fieldIndex) => (
                <motion.div
                  key={field.key}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: (sectionIndex + fieldIndex) * 0.05 }}
                  className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 bg-gray-700/50 rounded-xl"
                >
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-600 rounded-lg mt-1">
                      <field.icon className="w-4 h-4 text-gray-300" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-white font-medium mb-1">
                        {field.label}
                      </label>
                      <p className="text-gray-400 text-sm">
                        {field.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex-shrink-0">
                    {field.type === 'toggle' && (
                      <button
                        onClick={() => updateSettings(section.id, field.key, !settings[section.id][field.key])}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          settings[section.id][field.key]
                            ? 'bg-[#d5006d]'
                            : 'bg-gray-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            settings[section.id][field.key]
                              ? 'translate-x-6'
                              : 'translate-x-1'
                          }`}
                        />
                      </button>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={settings[section.id][field.key]}
                        onChange={(e) => updateSettings(section.id, field.key, e.target.value)}
                        className="bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent"
                      >
                        {field.options.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={settings[section.id][field.key]}
                        onChange={(e) => updateSettings(section.id, field.key, parseInt(e.target.value))}
                        className="bg-gray-600 border border-gray-500 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#d5006d] focus:border-transparent w-24"
                        min="1"
                        max="120"
                      />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      {/* معلومات النظام */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gray-800 rounded-2xl border border-gray-700 p-6"
      >
        <h3 className="text-lg font-semibold text-white mb-4">معلومات النظام</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-400">إصدار النظام:</span>
            <span className="text-white">v2.1.0</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-400">آخر تحديث:</span>
            <span className="text-white">2024-01-15</span>
          </div>
          <div className="flex justify-between p-3 bg-gray-700/50 rounded-lg">
            <span className="text-gray-400">حالة الخادم:</span>
            <span className="text-green-400">نشط</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SettingsSection;