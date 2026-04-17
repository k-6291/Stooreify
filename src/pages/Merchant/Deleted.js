// Deleted.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Deleted.css';

const Deleted = () => {
  const { user } = useAuth();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [deletedOrders, setDeletedOrders] = useState([]);

  // دالة لإضافة إشعار مؤقت
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // جلب الطلبات المحذوفة
  const fetchDeletedOrders = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/orders/deleted', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب الطلبات المحذوفة');
      const data = await res.json();
      setDeletedOrders(data.orders || []);
    } catch (error) {
      addNotification('خطأ في جلب الطلبات المحذوفة', 'error');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDeletedOrders();
    }
  }, [user, addNotification]);

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleRestore = async (orderId) => {
    if (!user?.token) return addNotification('يجب تسجيل الدخول', 'error');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/restore/${orderId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل استرجاع الطلب');
      addNotification(`تم استرجاع الطلب ${orderId} بنجاح!`);
      fetchDeletedOrders();
    } catch (error) {
      addNotification('فشل في استرجاع الطلب', 'error');
    }
  };

  // إغلاق النافذة عند الضغط خارجها
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowDetailsModal(false);
    }
  };

  return (
    <div className="deleted-page">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="deleted-header">
        <h2>المحذوفات</h2>
      </div>

      <div className="deleted-table-container">
        <table className="deleted-table">
          <thead>
            <tr>
              <th>ID الطلب</th>
              <th>المنتج</th>
              <th>الكمية</th>
              <th>اسم المشتري</th>
              <th>الولاية</th>
              <th>مزيد من المعلومات</th>
              <th>فعل</th>
            </tr>
          </thead>
          <tbody>
            {deletedOrders.length === 0 ? (
              <tr>
                <td colSpan="7">لا توجد طلبات محذوفة حاليًا.</td>
              </tr>
            ) : (
              deletedOrders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.product_name || '—'}</td>
                  <td>{order.quantity}</td>
                  <td>{order.buyer_name} {order.buyer_last_name}</td>
                  <td>{order.wilaya}</td>
                  <td>
                    <button className="details-btn" onClick={() => handleShowDetails(order)}>
                      تفاصيل
                    </button>
                  </td>
                  <td>
                    <button className="restore-btn" onClick={() => handleRestore(order.id)}>
                      استرجاع
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* نافذة التفاصيل */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تفاصيل الطلب</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="order-details">
              {Object.entries({
                'ID الطلب': selectedOrder.id,
                'المنتج': selectedOrder.product_name,
                'الكمية': selectedOrder.quantity,
                'سعر المنتج': `${selectedOrder.product_price} دج`,
                'سعر التوصيل': `${selectedOrder.delivery_price} دج`,
                'الإجمالي': `${selectedOrder.total_price} دج`,
                'اسم المشتري': `${selectedOrder.buyer_name} ${selectedOrder.buyer_last_name}`,
                'هاتف المشتري': selectedOrder.buyer_phone,
                'العنوان': selectedOrder.address,
                'الولاية': selectedOrder.wilaya,
                'مكان التوصيل': selectedOrder.delivery_location === 'office' ? 'مكتب' : 'منزل'
              }).map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}:</span>
                  <span className="detail-value">{value || '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Deleted;