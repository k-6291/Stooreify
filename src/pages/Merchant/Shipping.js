import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Shipping.css';

const Shipping = () => {
  const { user } = useAuth();
  const [shippingOrders, setShippingOrders] = useState([]);

  // جلب طلبات المرسل من الخادم
  const fetchShippingOrders = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/shipping/get', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب طلبات المرسل');

      const data = await response.json();
      setShippingOrders(data.orders || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات المرسل:', error.message);
      alert('حدث خطأ أثناء جلب طلبات المرسل.');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchShippingOrders();
    }
  }, [user]);

  return (
    <div className="shipping-page">
      <div className="shipping-header">
        <h2>المرسل</h2>
      </div>

      <div className="shipping-table-container">
        <table className="shipping-table">
          <thead>
            <tr>
              <th>ID الطلب</th>
              <th>الكمية</th>
              <th>المنتج</th>
              <th>اسم المشتري</th>
              <th>الولاية</th>
              <th>السعر الإجمالي</th>
              <th>الحالة</th>
            </tr>
          </thead>
          <tbody>
            {shippingOrders.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                  لا توجد طلبات مرسلة حاليًا.
                </td>
              </tr>
            ) : (
              shippingOrders.map((order, index) => (
                <tr key={order.id}>
  <td>{order.id}</td>
  <td>{order.quantity}</td>
  <td>{order.product_name || '—'}</td>        {/* ✅ */}
  <td>{(order.buyer_name || '') + ' ' + (order.buyer_last_name || '') || '—'}</td> {/* ✅ */}
  <td>{order.wilaya}</td>
  <td>{order.total_price} دج</td>             {/* ✅ total_price وليس totalPrice */}
  <td>
    <span className="status delivered">
      {order.status === 'packaging' ? 'قيد التجهيز' :
       order.status === 'shipping' ? 'قيد التوصيل' : 'تم التوصيل'}
    </span>
  </td>
</tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Shipping;