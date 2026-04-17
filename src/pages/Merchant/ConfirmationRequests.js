// ConfirmationRequests.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ConfirmationRequests.css';

const ConfirmationRequests = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  // دالة لإضافة إشعار مؤقت
  const addNotification = useCallback((message, type = 'error') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  useEffect(() => {
    const fetchConfirmationRequests = async () => {
      if (!user?.token) return;
      try {
        const res = await fetch('http://localhost:5000/api/orders/confirmation-requests', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!res.ok) throw new Error('فشل في جلب البيانات');
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (err) {
        console.error('خطأ:', err);
        addNotification('حدث خطأ أثناء جلب طلبات التأكيد');
      } finally {
        setLoading(false);
      }
    };

    fetchConfirmationRequests();
  }, [user?.token, addNotification]);

 // تحويل حالة الطلب إلى نص مع أيقونة
const getStatusDisplay = (status) => {
  switch (status) {
    case 'shipping':
      return { text: 'تم التأكيد', icon: '✅', className: 'confirmed' };
    case 'cancelled':
      return { text: 'ملغى', icon: '❌', className: 'cancelled' };
    case 'no_response':
      return { text: 'لم يتم الرد', icon: '📞', className: 'no-response' };
    default:
      return { text: status, icon: '❓', className: 'unknown' };
  }
};

  return (
    <div className="confirmation-requests-page">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="page-header">
        <h2>تأكيد عبر Stooreify</h2>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>جارٍ التحميل...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <p>لا توجد طلبات تأكيد حاليًا.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="confirmation-table">
            <thead>
              <tr>
                <th>ID الطلب</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>اسم المشتري</th>
                <th>عدد المحاولات</th>
                <th>ملاحظة العامل</th>
                <th>الحالة</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.product_name}</td>
                  <td>{order.quantity}</td>
                  <td>{order.buyer_name} {order.buyer_last_name}</td>
                  <td>{order.confirmation_attempts}</td>
                  <td>{order.confirmation_remarks || '—'}</td>
                    <td>
  {(() => {
    const { text, icon, className } = getStatusDisplay(order.status);
    return (
      <span className={`status-badge ${className}`}>
        {icon} {text}
      </span>
    );
  })()}
</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ConfirmationRequests;