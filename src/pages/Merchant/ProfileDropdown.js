// dashboard.js - النسخة المصححة بالكامل
لاشيء
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Dashboard.css';
import Orders from './Orders';
import Inventory from './Inventory';
import Shipping from './Shipping';
import Bank from './Bank';
import ConfirmationRequests from './ConfirmationRequests';
import Deleted from './Deleted';
import ProfileDropdown from '../../components/ProfileDropdown';

// Chart.js
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip
} from 'chart.js';
import { Line, Pie } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip);

// ✅ تعريف AnalyticsPage كمكون منفصل
const AnalyticsPage = ({ darkMode }) => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState({
    confirmedOrders: 0,
    completedOrders: 0,
    shippingOrders: 0,
    cancelledOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // جلب تحليلات الطلبات
  const fetchAnalytics = useCallback(async () => {
    if (!user?.token) return;
    try {
      const [analyticsRes, chartRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/analytics', {
          headers: { Authorization: `Bearer ${user.token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/chart-data', {
          headers: { Authorization: `Bearer ${user.token}` }
        })
      ]);

      if (!analyticsRes.ok || !chartRes.ok) throw new Error('فشل جلب البيانات');
      setAnalytics(await analyticsRes.json());
      setChartData(await chartRes.json());
    } catch (error) {
      console.error(error);
      alert('حدث خطأ أثناء جلب البيانات.');
    }
  }, [user?.token]);

  // جلب أكثر المنتجات مبيعاً
  const fetchTopProducts = useCallback(async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/dashboard/top-products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب المنتجات');
      const data = await res.json();
      setTopProducts(data);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    }
  }, [user?.token]);

  // جلب البيانات عند التحميل
  useEffect(() => {
    if (user?.token) {
      fetchAnalytics();
      fetchTopProducts();
    }
  }, [user, fetchAnalytics, fetchTopProducts]);

  // إعدادات المخطط المنحني
  const lineChartData = {
    labels: chartData.map(item => item.day),
    datasets: [
      {
        data: chartData.map(item => item.orders),
        borderColor: darkMode ? '#4FC3F7' : '#FF6B00',
        borderWidth: 3,
        pointBackgroundColor: darkMode ? '#0288D1' : '#E65100',
        pointRadius: 6,
        pointHoverRadius: 8,
        tension: 0.4,
        fill: false,
        spanGaps: false
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: 'index',
        intersect: false,
        bodyColor: darkMode ? '#FFF' : '#333',
        titleColor: darkMode ? '#4FC3F7' : '#FF6B00'
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { 
          color: darkMode ? '#BBB' : '#666',
          font: { size: 12 }
        }
      },
      y: {
        beginAtZero: true,
        grid: { 
          color: darkMode ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' 
        },
        ticks: { 
          display: false
        }
      }
    },
    interaction: {
      mode: 'index',
      axis: 'x',
      intersect: false
    }
  };

  // إعدادات الرسم الدائري
  const pieData = {
    labels: topProducts.map(item => item.product_name),
    datasets: [
      {
        data: topProducts.map(item => item.total_quantity),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF'
        ],
        borderColor: darkMode ? '#333' : '#fff',
        borderWidth: 2
      }
    ]
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: darkMode ? '#E0E0E0' : '#333',
          font: { size: 13 }
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
            return `${label}: ${value} (${percentage}%)`;
          }
        },
        bodyColor: darkMode ? '#FFF' : '#333',
        titleColor: darkMode ? '#FFD54F' : '#FF6B00'
      }
    },
    cutout: '60%'
  };

  return (
    <div className="analytics-page">
      <h2>التحليلات</h2>

      <div className="stats-grid">
        {[
          { key: 'confirmed', label: 'الطلبات المؤكدة', icon: '✅', color: '#4CAF50' },
          { key: 'completed', label: 'طلبات تمت', icon: '✔️', color: '#2196F3' },
          { key: 'shipping', label: 'قيد التوصيل', icon: '🚚', color: '#FF9800' },
          { key: 'cancelled', label: 'الطلبات المحذوفة', icon: '❌', color: '#F44336' }
        ].map((card) => (
          <div 
            key={card.key}
            className="stat-card"
            style={{
              '--card-color': card.color,
              '--card-icon': `"${card.icon}"`
            }}
          >
            <div className="stat-number">{analytics[card.key + 'Orders']}</div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      {/* قسم المخططات */}
      <div className="charts-section">
        {/* أكثر 3 منتجات مبيعاً */}
<div className="top-products-section">
  <h3>أكثر 3 منتجات مبيعاً</h3>
  {topProducts.length > 0 ? (
    <div className="top-products-list">
      {topProducts.map((product, index) => (
        <div 
          key={product.product_name} 
          className={`top-product-item rank-${index + 1}`}
        >
          <span className="product-rank">
            {index === 0 ? '🏆' : index === 1 ? '🥈' : '🥉'}
          </span>
          <span className="product-name">{product.product_name}</span>
          <span className="product-quantity">{product.total_quantity} وحدة</span>
        </div>
      ))}
    </div>
  ) : (
    <p className="no-data-message">لا توجد منتجات مباعة بعد.</p>
  )}
</div>


        {/* المخطط المنحني */}
        <div className="chart-container">
          <h3>عدد الطلبات خلال آخر 7 أيام</h3>
          <div className="line-chart-wrapper">
            {chartData.length > 0 ? (
              <Line data={lineChartData} options={chartOptions} />
            ) : (
              <p className="no-data-message">لا توجد بيانات متاحة.</p>
            )}
          </div>
        </div>
        
      </div>
    </div>
  );
};

// المكون الرئيسي
const Dashboard = () => {
  const [activePage, setActivePage] = useState('تحليلات');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    return sessionStorage.getItem('sidebarCollapsed') === 'true';
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });

  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

 const menuItems = [
  { id: 'تحليلات', icon: '📊', label: 'تحليلات' },
  { id: 'الطلبات', icon: '📥', label: 'الطلبات' },
  { id: 'المخزون', icon: '📦', label: 'المخزون' },
  { id: 'المرسل', icon: '🚚', label: 'المرسل' },
  { id: 'البنك', icon: '💰', label: 'البنك' },
  { id: 'المحذوفات', icon: '🗑️', label: 'المحذوفات' },
  { id: 'تأكيد عبر Stooreify', icon: '📞', label: 'تأكيد عبر Stooreify' }, // ← جديد
];

  const toggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    sessionStorage.setItem('sidebarCollapsed', String(newState));
    if (window.innerWidth <= 768) setIsMobileMenuOpen(false);
  };

  const handleMenuItemClick = (id) => {
    setActivePage(id);
    if (window.innerWidth <= 768) setIsMobileMenuOpen(false);
  };

  const renderContent = () => {
    switch (activePage) {
      case 'الطلبات': return <Orders />;
      case 'المخزون': return <Inventory />;
      case 'المرسل': return <Shipping />;
      case 'البنك': return <Bank />;
      case 'المحذوفات': return <Deleted />;
      case 'تأكيد عبر Stooreify': return <ConfirmationRequests />;
      case 'تحليلات': return <AnalyticsPage darkMode={darkMode} />;
      default:
        return (
          <div className="empty-page">
            <h2>{activePage}</h2>
            <p>سيتم إضافة المحتوى قريباً...</p>
          </div>
        );
    }
  };

  return (
    <div className={`dashboard ${isSidebarCollapsed ? 'sidebar-collapsed' : ''} ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}>
      <header className="dashboard-header">
        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          ☰
        </button>
        <div className="logo">Stooreify</div>
        <div className="header-actions">
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <div className="user-info">
            <ProfileDropdown />
          </div>
        </div>
      </header>

      <aside className="sidebar">
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activePage === item.id ? 'active' : ''}`}
                  onClick={() => handleMenuItemClick(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <button className="collapse-btn" onClick={toggleSidebar}>
          {isSidebarCollapsed ? '»' : '«'}
        </button>
      </aside>

      <main className="main-content">
        {renderContent()}
      </main>

      {isMobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </div>
  );
};

export default Dashboard;