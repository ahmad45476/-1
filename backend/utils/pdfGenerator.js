const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const generatePdfReport = async (reportData, reportTitle, type) => {
  let browser = null;
  
  try {
    console.log('📄 بدء إنشاء PDF مع puppeteer...');
    
    const safeTitle = (reportTitle || 'تقرير').replace(/\s+/g, '_');
    const fileName = `${safeTitle}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../files/reports', fileName);

    // إنشاء المجلد
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // إنشاء محتوى HTML بتصميم احترافي
    const htmlContent = createHtmlContent(reportData, reportTitle, type);
    
    // استخدام puppeteer لتحويل HTML إلى PDF
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
    
    await page.pdf({ 
      path: filePath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    console.log('✅ تم إنشاء PDF بنجاح:', filePath);
    return `/files/reports/${fileName}`;

  } catch (error) {
    console.error('❌ خطأ في إنشاء PDF:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

// دالة لإنشاء محتوى HTML بتصميم احترافي
const createHtmlContent = (reportData, reportTitle, type) => {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
    <meta charset="UTF-8">
    <title>${reportTitle}</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Tajawal', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
            color: #333;
        }
        
        .report-card {
            max-width: 1000px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.1);
            overflow: hidden;
        }
        
        .report-header {
            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
            color: white;
            padding: 40px;
            text-align: center;
            position: relative;
        }
        
        .report-header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.1"><circle cx="50" cy="50" r="2" fill="white"/></svg>');
        }
        
        .report-title {
            font-size: 2.5em;
            font-weight: 700;
            margin-bottom: 10px;
            position: relative;
        }
        
        .report-subtitle {
            font-size: 1.1em;
            opacity: 0.9;
            margin-bottom: 20px;
        }
        
        .report-meta {
            display: flex;
            justify-content: center;
            gap: 30px;
            flex-wrap: wrap;
            margin-top: 20px;
        }
        
        .meta-item {
            background: rgba(255,255,255,0.1);
            padding: 10px 20px;
            border-radius: 25px;
            backdrop-filter: blur(10px);
        }
        
        .report-body {
            padding: 40px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }
        
        .stat-card {
            background: white;
            border-radius: 15px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            border: 1px solid #f0f0f0;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.15);
        }
        
        .stat-icon {
            font-size: 2.5em;
            margin-bottom: 15px;
        }
        
        .stat-value {
            font-size: 2.2em;
            font-weight: 700;
            color: #2c3e50;
            margin-bottom: 5px;
        }
        
        .stat-label {
            color: #7f8c8d;
            font-size: 0.9em;
            font-weight: 500;
        }
        
        .section {
            margin-bottom: 40px;
        }
        
        .section-title {
            font-size: 1.5em;
            font-weight: 600;
            color: #2c3e50;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #3498db;
            display: inline-block;
        }
        
        .data-table {
            width: 100%;
            border-collapse: collapse;
            background: white;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        }
        
        .data-table th {
            background: #34495e;
            color: white;
            padding: 15px;
            text-align: right;
            font-weight: 600;
        }
        
        .data-table td {
            padding: 12px 15px;
            border-bottom: 1px solid #ecf0f1;
        }
        
        .data-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .data-table tr:hover {
            background: #e8f4f8;
        }
        
        .report-footer {
            background: #f8f9fa;
            padding: 30px 40px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            color: #6c757d;
            font-size: 0.9em;
        }
        
        .badge {
            display: inline-block;
            padding: 5px 12px;
            border-radius: 15px;
            font-size: 0.8em;
            font-weight: 600;
            margin: 0 5px;
        }
        
        .badge-success {
            background: #d4edda;
            color: #155724;
        }
        
        .badge-warning {
            background: #fff3cd;
            color: #856404;
        }
        
        .badge-info {
            background: #d1ecf1;
            color: #0c5460;
        }
        
        @media (max-width: 768px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .report-header {
                padding: 30px 20px;
            }
            
            .report-body {
                padding: 20px;
            }
        }
    </style>
</head>
<body>
    <div class="report-card">
        <div class="report-header">
            <h1 class="report-title">${reportTitle}</h1>
            <div class="report-subtitle">تقرير احترافي - نظام إدارة المنصة</div>
            <div class="report-meta">
                <div class="meta-item">
                    📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
                <div class="meta-item">
                    🕒 ${new Date().toLocaleTimeString('ar-EG')}
                </div>
                <div class="meta-item">
                    📊 ${getTypeArabicName(type)}
                </div>
            </div>
        </div>
        
        <div class="report-body">
            ${generateReportContent(reportData, type)}
        </div>
        
        <div class="report-footer">
            <div class="footer-text">
                <p>تم إنشاء هذا التقرير تلقائياً من نظام إدارة المنصة</p>
                <p>جميع الحقوق محفوظة © ${new Date().getFullYear()} - ArtsGateway Platform</p>
            </div>
        </div>
    </div>
</body>
</html>
  `;
};

// دالة للحصول على الاسم العربي لنوع التقرير
const getTypeArabicName = (type) => {
  const typeNames = {
    'users': 'المستخدمين',
    'artworks': 'الأعمال الفنية',
    'financial': 'المالي',
    'sales': 'المبيعات',
    'artist-performance': 'أداء الفنانين',
    'platform-analytics': 'تحليلات المنصة',
    'admins': 'المشرفين',
    'reports': 'الإبلاغات'
  };
  return typeNames[type] || type;
};

// دالة لتوليد محتوى التقرير حسب النوع
const generateReportContent = (reportData, type) => {
  switch(type) {
    case 'users':
      return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👥</div>
                <div class="stat-value">${reportData.totalUsers || 0}</div>
                <div class="stat-label">إجمالي المستخدمين</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🆕</div>
                <div class="stat-value">${reportData.newUsers || 0}</div>
                <div class="stat-label">مستخدمين جدد</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🎨</div>
                <div class="stat-value">${reportData.artists || 0}</div>
                <div class="stat-label">فنانين</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👤</div>
                <div class="stat-value">${reportData.regularUsers || 0}</div>
                <div class="stat-label">مستخدمين عاديين</div>
            </div>
        </div>
        
        ${reportData.recentUsers && reportData.recentUsers.length > 0 ? `
        <div class="section">
            <h3 class="section-title">المستخدمون المضافة حديثاً</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>اسم المستخدم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الدور</th>
                        <th>تاريخ الانضمام</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.recentUsers.map(user => `
                        <tr>
                            <td>${user.username}</td>
                            <td>${user.email}</td>
                            <td><span class="badge ${user.role === 'artist' ? 'badge-success' : 'badge-info'}">${user.role === 'artist' ? 'فنان' : 'مستخدم'}</span></td>
                            <td>${new Date(user.joined).toLocaleDateString('ar-EG')}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
      `;
    
    case 'artworks':
      return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🖼️</div>
                <div class="stat-value">${reportData.totalArtworks || 0}</div>
                <div class="stat-label">إجمالي الأعمال</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✨</div>
                <div class="stat-value">${reportData.newArtworks || 0}</div>
                <div class="stat-label">أعمال جديدة</div>
            </div>
        </div>
        
        ${reportData.categories && reportData.categories.length > 0 ? `
        <div class="section">
            <h3 class="section-title">التوزيع حسب الفئة</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>الفئة</th>
                        <th>عدد الأعمال</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.categories.map(cat => `
                        <tr>
                            <td>${cat._id || 'غير مصنف'}</td>
                            <td>${cat.count}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
      `;
    
    case 'financial':
      return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-value">$${(reportData.totalRevenue || 0).toLocaleString()}</div>
                <div class="stat-label">إجمالي الإيرادات</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🛒</div>
                <div class="stat-value">${reportData.totalSales || 0}</div>
                <div class="stat-label">عدد المبيعات</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🏢</div>
                <div class="stat-value">$${(reportData.platformEarnings || 0).toLocaleString()}</div>
                <div class="stat-label">أرباح المنصة</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">$${reportData.averageSale || 0}</div>
                <div class="stat-label">متوسط المبيعات</div>
            </div>
        </div>
      `;
    
    case 'sales':
      return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-value">${reportData.totalSales || 0}</div>
                <div class="stat-label">إجمالي المبيعات</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">💵</div>
                <div class="stat-value">$${(reportData.totalRevenue || 0).toLocaleString()}</div>
                <div class="stat-label">إجمالي الإيرادات</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📈</div>
                <div class="stat-value">$${(reportData.averageSale || 0).toFixed(2)}</div>
                <div class="stat-label">متوسط المبيعات</div>
            </div>
        </div>
      `;
    
    case 'admins':
      return `
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">👨‍💼</div>
                <div class="stat-value">${reportData.stats?.totalAdmins || 0}</div>
                <div class="stat-label">إجمالي المشرفين</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-value">${reportData.stats?.activeAdmins || 0}</div>
                <div class="stat-label">نشطون</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">👑</div>
                <div class="stat-value">${reportData.stats?.superAdmins || 0}</div>
                <div class="stat-label">مشرفون رئيسيون</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">🔧</div>
                <div class="stat-value">${reportData.stats?.regularAdmins || 0}</div>
                <div class="stat-label">مشرفون عاديون</div>
            </div>
        </div>
        
        ${reportData.admins && reportData.admins.length > 0 ? `
        <div class="section">
            <h3 class="section-title">قائمة المشرفين</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>اسم المستخدم</th>
                        <th>البريد الإلكتروني</th>
                        <th>الصلاحيات</th>
                        <th>آخر دخول</th>
                    </tr>
                </thead>
                <tbody>
                    ${reportData.admins.map(admin => `
                        <tr>
                            <td><strong>${admin.username}</strong></td>
                            <td>${admin.email}</td>
                            <td>${(admin.permissions || []).slice(0, 3).join('، ')}${(admin.permissions || []).length > 3 ? '...' : ''}</td>
                            <td>${admin.lastLogin ? new Date(admin.lastLogin).toLocaleDateString('ar-EG') : 'لم يسجل'}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        ` : ''}
      `;
    
    default:
      return `
        <div class="section">
            <h3 class="section-title">بيانات التقرير</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>المفتاح</th>
                        <th>القيمة</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.entries(reportData).map(([key, value]) => `
                        <tr>
                            <td><strong>${key}</strong></td>
                            <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
      `;
  }
};

module.exports = generatePdfReport;