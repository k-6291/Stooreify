import React, { useState, useEffect } from 'react';
import './Support.css';
import { useAuth } from '../../context/AuthContext';

const Support = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('طلبات التفعيل');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [activationRequests, setActivationRequests] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [trackingOrders, setTrackingOrders] = useState([]);
  const [selectedDay, setSelectedDay] = useState(1);

  // جلب طلبات التفعيل
  const fetchActivationRequests = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:5000/api/support/activation-requests', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('فشل في جلب طلبات التفعيل');
      const data = await response.json();
      setActivationRequests(data.requests || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات التفعيل:', error.message);
      alert('حدث خطأ أثناء جلب طلبات التفعيل.');
    }
  };

  // جلب طلبات الإرجاع
  const fetchReturnRequests = async () => {
    if (!user?.token) return;
    try {
      const response = await fetch('http://localhost:5000/api/support/return-requests', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('فشل في جلب طلبات الإرجاع');
      const data = await response.json();
      setReturnRequests(data.requests || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات الإرجاع:', error.message);
      alert('حدث خطأ أثناء جلب طلبات الإرجاع.');
    }
  };

  // جلب طلبات التتبع حسب اليوم
  const fetchTrackingOrders = async (day) => {
    if (!user?.token) return;
    try {
      const response = await fetch(`http://localhost:5000/api/support/tracking-orders/${day}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!response.ok) throw new Error('فشل في جلب طلبات التتبع');
      const data = await response.json();
      setTrackingOrders(data.orders || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات التتبع:', error.message);
      alert('حدث خطأ أثناء جلب طلبات التتبع.');
    }
  };

  useEffect(() => {
    if (user?.token) {
      if (activeTab === 'طلبات التفعيل') {
        fetchActivationRequests();
      } else if (activeTab === 'طلبات الإرجاع') {
        fetchReturnRequests();
      } else if (activeTab === 'تتبع التوصيل') {
        fetchTrackingOrders(selectedDay);
      }
    }
  }, [user, activeTab, selectedDay]);

  // تفعيل حساب تاجر
  const handleActivateAccount = async (accountId) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/support/activate/${accountId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في تفعيل الحساب');

      setSuccessMessage('تم تفعيل الحساب بنجاح.');
      setShowSuccessMessage(true);

      fetchActivationRequests();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('خطأ في تفعيل الحساب:', error.message);
      alert('فشل في تفعيل الحساب.');
    }
  };

  // حذف حساب تاجر
  const handleDeleteAccount = async (accountId) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    if (!window.confirm('هل أنت متأكد أنك تريد حذف هذا الحساب؟')) return;

    try {
      const response = await fetch(`http://localhost:5000/api/support/delete/${accountId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في حذف الحساب');

      setSuccessMessage('تم حذف الحساب بنجاح.');
      setShowSuccessMessage(true);

      fetchActivationRequests();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('خطأ في حذف الحساب:', error.message);
      alert('فشل في حذف الحساب.');
    }
  };

  // قبول طلب إرجاع (مُعدّل)
  const handleApproveReturn = async (orderId) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    if (!window.confirm('هل أنت متأكد من قبول طلب الإرجاع؟')) return;

    try {
      const response = await fetch('http://localhost:5000/api/support/approve-return', {
        method: 'POST', // ← كان PUT، غيرته إلى POST
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في قبول الإرجاع');
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setShowSuccessMessage(true);

      fetchReturnRequests();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('خطأ في قبول الإرجاع:', error.message);
      alert('فشل في قبول الإرجاع: ' + error.message);
    }
  };

  // رفض طلب إرجاع (مُعدّل)
  const handleRejectReturn = async (orderId) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    if (!window.confirm('هل أنت متأكد من رفض طلب الإرجاع؟')) return;

    try {
      const response = await fetch('http://localhost:5000/api/support/reject-return', {
        method: 'POST', // ← كان PUT، غيرته إلى POST
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في رفض الإرجاع');
      }

      const data = await response.json();
      setSuccessMessage(data.message);
      setShowSuccessMessage(true);

      fetchReturnRequests();

      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 3000);
    } catch (error) {
      console.error('خطأ في رفض الإرجاع:', error.message);
      alert('فشل في رفض الإرجاع: ' + error.message);
    }
  };

  // تحديث حالة التتبع (موجودة وصحيحة)
  const handleUpdateTrackingStatus = async (orderId, newStatus) => {
  if (!user?.token) {
    alert('يجب تسجيل الدخول أولاً.');
    return;
  }

  const notes = prompt('أضف ملاحظة (اختياري):');

  try {
    const response = await fetch(`http://localhost:5000/api/support/update-tracking-status/${orderId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        day: selectedDay,
        status: newStatus, // ← مثلاً: 'not_delivered', 'in_office', 'returned', 'extended'
        notes: notes || null
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'فشل في تحديث الحالة');
    }

    const data = await response.json();
    setSuccessMessage(data.message);
    setShowSuccessMessage(true);

    // تحديث القائمة
    fetchTrackingOrders(selectedDay);

    setTimeout(() => {
      setShowSuccessMessage(false);
    }, 3000);
  } catch (error) {
    console.error('خطأ في تحديث الحالة:', error.message);
    alert('فشل في تحديث الحالة: ' + error.message);
  }
};

  const menuItems = [
    { id: 'طلبات التفعيل', icon: '📋', label: 'طلبات التفعيل' },
    { id: 'طلبات الإرجاع', icon: '↩️', label: 'طلبات الإرجاع' },
    { id: 'تتبع التوصيل', icon: '🚚', label: 'تتبع التوصيل' }
  ];

  return (
    <div className="support-page">
      {/* الهيدر العلوي */}
      <header className="support-header">
        <div className="logo">Stooreify</div>
        <div className="user-info">
          {user?.name} {user?.last_name} — فريق الدعم
        </div>
      </header>

      {/* القائمة الجانبية */}
      <aside className="support-sidebar">
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-text">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="support-main-content">
        {/* تبويب: طلبات التفعيل */}
        {activeTab === 'طلبات التفعيل' && (
          <div className="section">
            <h2>طلبات التفعيل</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>الاسم</th>
                    <th>اسم المتجر</th>
                    <th>الهاتف</th>
                    <th>البريد الإلكتروني</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {activationRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">لا توجد طلبات تفعيل</td>
                    </tr>
                  ) : (
                    activationRequests.map((req) => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>{req.merchantName}</td>
                        <td>{req.storeName}</td>
                        <td>{req.phone}</td>
                        <td>{req.email}</td>
                        <td>
                          <button className="action-btn approve" onClick={() => handleActivateAccount(req.id)}>تفعيل</button>
                          <button className="action-btn reject" onClick={() => handleDeleteAccount(req.id)}>حذف</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تبويب: طلبات الإرجاع */}
        {activeTab === 'طلبات الإرجاع' && (
          <div className="section">
            <h2>طلبات الإرجاع</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID الطلب</th>
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>اسم المشتري</th>
                    <th>السبب</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">لا توجد طلبات إرجاع</td>
                    </tr>
                  ) : (
                    returnRequests.map((req) => (
                      <tr key={req.orderId}>
                        <td>{req.orderId}</td>
                        <td>{req.productName}</td>
                        <td>{req.quantity}</td>
                        <td>{req.buyerName}</td>
                        <td>{req.returnReason || 'غير محدد'}</td>
                        <td>
                          <button className="action-btn approve" onClick={() => handleApproveReturn(req.orderId)}>قبول</button>
                          <button className="action-btn reject" onClick={() => handleRejectReturn(req.orderId)}>رفض</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* تبويب: تتبع التوصيل */}
        {activeTab === 'تتبع التوصيل' && (
          <div className="section">
            <h2>تتبع التوصيل — اليوم {selectedDay}</h2>
            <div className="day-selector">
              {[1, 2, 3].map(day => (
                <button
                  key={day}
                  className={`day-btn ${selectedDay === day ? 'active' : ''}`}
                  onClick={() => setSelectedDay(day)}
                >
                  اليوم {day}
                </button>
              ))}
            </div>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID الطلب</th>
                    <th>اسم المتجر</th>
                    <th>اسم المشتري</th>
                    <th>الهاتف</th>
                    <th>الحالة الحالية</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {trackingOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">لا توجد طلبات اليوم</td>
                    </tr>
                  ) : (
                    trackingOrders.map((order) => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.storeName}</td>
                        <td>{order.buyerName}</td>
                        <td>{order.buyerPhone}</td>
                        <td className={order.isUpdatedToday ? 'updated-today' : ''}>
  {order.lastStatus || 'لم تُحدث'}
</td>
                        <td>
  {/* إذا كان اليوم 3، نعرض زر "تمديد" */}
  {selectedDay === 3 ? (
    <>
      <button className="action-btn update" onClick={() => handleUpdateTrackingStatus(order.orderId, 'extended')}>تمديد</button>
      <button className="action-btn return" onClick={() => handleUpdateTrackingStatus(order.orderId, 'returned')}>إرجاع</button>
    </>
  ) : (
    <>
      <button className="action-btn update" onClick={() => handleUpdateTrackingStatus(order.orderId, 'delivered')}>تم التسليم</button>
      <button className="action-btn update" onClick={() => handleUpdateTrackingStatus(order.orderId, 'not_delivered')}>لم يُستلم</button>
      <button className="action-btn update" onClick={() => handleUpdateTrackingStatus(order.orderId, 'in_office')}>في المكتب</button>
    </>
  )}
</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* رسالة النجاح */}
      {showSuccessMessage && (
        <div className="success-message">
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default Support;