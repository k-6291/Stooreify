// frontend/src/pages/Merchant/Orders.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Orders.css';

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [products, setProducts] = useState([]);
  const [newOrderData, setNewOrderData] = useState({
    product_id: '',
    quantity: 1,
    buyer_name: '',
    buyer_last_name: '',
    wilaya: '',
    address: '',
    buyer_phone: ''
  });
  const [deliveryType, setDeliveryType] = useState('office');
  const [notifications, setNotifications] = useState([]);

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [orderToConfirm, setOrderToConfirm] = useState(null);
  const [confirmationMethod, setConfirmationMethod] = useState('self');
  const [confirmationNote, setConfirmationNote] = useState('');

  // دالة لإضافة إشعار مؤقت
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // جلب المنتجات
  const fetchProducts = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/products/get', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب المنتجات');
      const data = await res.json();
      setProducts(data.products.filter(p => p.quantity > 0) || []);
    } catch (error) {
      addNotification('خطأ في جلب المنتجات', 'error');
    }
  };

  // جلب الطلبات
  const fetchOrders = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/orders/get', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب الطلبات');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (error) {
      addNotification('خطأ في جلب الطلبات', 'error');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchProducts();
      fetchOrders();
    }
  }, [user, addNotification]);

  // === معالجة الأحداث ===
  const handleProductChange = (e) => {
    const productId = parseInt(e.target.value);
    setNewOrderData({ ...newOrderData, product_id: productId });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewOrderData({ ...newOrderData, [name]: value });
  };

  const handleAddOrder = async (e) => {
    e.preventDefault();
    if (!user?.token) return addNotification('يجب تسجيل الدخول', 'error');

    const requiredFields = ['product_id', 'quantity', 'buyer_name', 'buyer_last_name', 'wilaya', 'address', 'buyer_phone'];
    if (requiredFields.some(field => !newOrderData[field])) {
      return addNotification('جميع الحقول مطلوبة', 'error');
    }

    try {
      const res = await fetch('http://localhost:5000/api/orders/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ...newOrderData, delivery_location: deliveryType })
      });

      if (!res.ok) throw new Error('فشل إضافة الطلب');
      
      addNotification('تم إضافة الطلب بنجاح!');
      setShowAddModal(false);
      setNewOrderData({
        product_id: '',
        quantity: 1,
        buyer_name: '',
        buyer_last_name: '',
        wilaya: '',
        address: '',
        buyer_phone: ''
      });
      setDeliveryType('office');
      fetchOrders();
    } catch (error) {
      addNotification('خطأ في إضافة الطلب', 'error');
    }
  };

  const handleShowDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('هل أنت متأكد من الحذف؟')) return;
    if (!user?.token) return addNotification('يجب تسجيل الدخول', 'error');

    try {
      const res = await fetch(`http://localhost:5000/api/orders/delete/${orderId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل الحذف');
      fetchOrders();
      addNotification('تم حذف الطلب بنجاح');
    } catch (error) {
      addNotification('خطأ في الحذف', 'error');
    }
  };

  const handleConfirmOrder = (orderId) => {
    setOrderToConfirm(orderId);
    setConfirmationMethod('self');
    setConfirmationNote('');
    setShowConfirmModal(true);
  };

  const handleSendOrder = async (orderId) => {
    if (!user?.token) return addNotification('يجب تسجيل الدخول', 'error');
    try {
      const res = await fetch(`http://localhost:5000/api/orders/send/${orderId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل الإرسال');
      fetchOrders();
      addNotification('تم إرسال الطلب');
    } catch (error) {
      addNotification('خطأ في الإرسال', 'error');
    }
  };

  // === دالة تأكيد الطلب (محدثة) ===
  const submitConfirmation = async () => {
    if (!user?.token || !orderToConfirm) return;

    try {
      if (confirmationMethod === 'self') {
        const res = await fetch(`http://localhost:5000/api/orders/confirm/${orderToConfirm}`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${user.token}` }
        });
        if (!res.ok) throw new Error('فشل التأكيد');
        addNotification('تم تأكيد الطلب');
      } else {
        const res = await fetch('http://localhost:5000/api/orders/confirm-via-team', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId: orderToConfirm,
            confirmationNote: confirmationNote.trim() || null
          })
        });
        if (!res.ok) throw new Error('فشل طلب التأكيد عبر الفريق');
        addNotification('تم إرسال الطلب لفريق التأكيد');
      }

      fetchOrders();
      setShowConfirmModal(false);
    } catch (error) {
      addNotification('خطأ في التأكيد', 'error');
    }
  };

  // === قائمة الولايات ===
  const wilayas = [
    "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", 
    "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", 
    "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", 
    "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", 
    "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", 
    "عين تموشنت", "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس", 
    "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
  ].map((name, index) => ({ id: index + 1, name }));

  // === إغلاق النوافذ ===
  const handleOverlayClick = (e) => {
    if (e.target.classList.contains('modal-overlay')) {
      setShowAddModal(false);
      setShowDetailsModal(false);
      setShowConfirmModal(false);
    }
  };

  // === تحويل الحالة إلى نص عربي ===
  const getStatusText = (status) => {
    switch (status) {
      case 'unconfirmed': return 'غير مؤكد';
      case 'confirmed': return 'مؤكد';
      case 'shipping': return 'قيد التوصيل';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'unconfirmed': return 'unconfirmed';
      case 'confirmed': return 'confirmed';
      case 'shipping': return 'shipping';
      default: return '';
    }
  };

  return (
    <div className="orders-content">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="orders-section">
        <div className="section-header">
          <h2>الطلبات</h2>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            إضافة طلب جديد
          </button>
        </div>

        <div className="orders-table-container">
          <table className="orders-table">
            <thead>
              <tr>
                <th>ID الطلب</th>
                <th>اسم المنتج</th>
                <th>الكمية</th>
                <th>اسم المشتري</th>
                <th>الولاية</th>
                <th>مزيد من المعلومات</th>
                <th>الحالة</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan="8">لا توجد طلبات حاليًا.</td>
                </tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.product_name}</td>
                    <td>{order.quantity}</td>
                    <td>{order.buyer_name} {order.buyer_last_name}</td>
                    <td>{order.wilaya}</td>
                    <td>
                      <button className="details-btn" onClick={() => handleShowDetails(order)}>
                        تفاصيل
                      </button>
                    </td>
                    <td>
                      {/* عرض الحالة */}
                      {order.confirmation_status === 'pending_team' ? (
                        <span className="status pending-team">قيد التأكيد</span>
                      ) : (
                        <span className={`status ${getStatusClass(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        {/* إخفاء الأزرار إذا كان الطلب قيد التأكيد */}
                        {order.status === 'unconfirmed' && order.confirmation_status !== 'pending_team' && (
                          <>
                            <button className="delete-btn" onClick={() => handleDeleteOrder(order.id)}>
                              حذف
                            </button>
                            <button className="confirm-btn" onClick={() => handleConfirmOrder(order.id)}>
                              تأكيد
                            </button>
                          </>
                        )}
                        {order.status === 'confirmed' && (
                          <button className="send-btn" onClick={() => handleSendOrder(order.id)}>
                            إرسال
                          </button>
                        )}
                        {/* عرض حالة "قيد التأكيد" في الإجراءات أيضًا */}
                        {order.confirmation_status === 'pending_team' && (
                          <span className="status pending-team">قيد التأكيد</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* نافذة إضافة طلب */}
      {showAddModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal">
            <div className="modal-header">
              <h3>إضافة طلب جديد</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>
            <form className="add-order-form" onSubmit={handleAddOrder}>
              <div className="form-group">
                <label>المنتج:</label>
                <select name="product_id" value={newOrderData.product_id} onChange={handleProductChange} required>
                  <option value="">اختر المنتج</option>
                  {products.map(product => (
                    <option key={product.id} value={product.id}>
                      {product.name} {product.quantity > 0 && (
                        <span className="product-quantity"> (الكمية: {product.quantity})</span>
                      )}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>الكمية:</label>
                <input type="number" name="quantity" min="1" value={newOrderData.quantity} onChange={handleInputChange} required />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>اسم المشتري:</label>
                  <input type="text" name="buyer_name" value={newOrderData.buyer_name} onChange={handleInputChange} required />
                </div>
                <div className="form-group">
                  <label>لقب المشتري:</label>
                  <input type="text" name="buyer_last_name" value={newOrderData.buyer_last_name} onChange={handleInputChange} required />
                </div>
              </div>

              <div className="form-group">
                <label>الولاية:</label>
                <select name="wilaya" value={newOrderData.wilaya} onChange={handleInputChange} required>
                  <option value="">اختر الولاية</option>
                  {wilayas.map(w => (
                    <option key={w.id} value={w.name}>
                      {w.id}. {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>العنوان:</label>
                <textarea name="address" value={newOrderData.address} onChange={handleInputChange} rows="3" required></textarea>
              </div>

              <div className="form-group">
                <label>رقم الهاتف:</label>
                <input type="tel" name="buyer_phone" value={newOrderData.buyer_phone} onChange={handleInputChange} placeholder="05XXXXXXXX" required />
              </div>

              <div className="form-group">
                <label>مكان التوصيل:</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input type="radio" name="delivery_location" value="office" checked={deliveryType === 'office'} onChange={() => setDeliveryType('office')} />
                    مكتب
                  </label>
                  <label className="radio-label">
                    <input type="radio" name="delivery_location" value="home" checked={deliveryType === 'home'} onChange={() => setDeliveryType('home')} />
                    منزل
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>إلغاء</button>
                <button type="submit" className="submit-btn">إضافة الطلب</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة التفاصيل */}
      {showDetailsModal && selectedOrder && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal details-modal">
            <div className="modal-header">
              <h3>تفاصيل الطلب</h3>
              <button className="close-btn" onClick={() => setShowDetailsModal(false)}>×</button>
            </div>
            <div className="order-content">
              {Object.entries({
                'ID الطلب': selectedOrder.id,
                'اسم المنتج': selectedOrder.product_name,
                'الكمية': selectedOrder.quantity,
                'سعر المنتج': `${selectedOrder.product_price} دج`,
                'سعر التوصيل': `${selectedOrder.delivery_price} دج`,
                'الإجمالي': `${selectedOrder.total_price} دج`,
                'اسم المشتري': `${selectedOrder.buyer_name} ${selectedOrder.buyer_last_name}`,
                'رقم الهاتف': selectedOrder.buyer_phone,
                'العنوان': selectedOrder.address,
                'الولاية': selectedOrder.wilaya,
                'مكان التوصيل': selectedOrder.delivery_location === 'office' ? 'مكتب' : 'منزل'
              }).map(([label, value]) => (
                <div key={label} className="detail-row">
                  <span className="detail-label">{label}:</span>
                  <span className="detail-value">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* نافذة تأكيد الطلب */}
      {showConfirmModal && (
        <div className="modal-overlay" onClick={handleOverlayClick}>
          <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>تأكيد الطلب</h3>
              <button className="close-btn" onClick={() => setShowConfirmModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <p className="confirm-message">هل تريد تأكيد هذا الطلب عبر فريق Stooreify؟</p>
              
              <div className="confirmation-options">
                <label className="option-card">
                  <input
                    type="radio"
                    name="confirmationMethod"
                    checked={confirmationMethod === 'self'}
                    onChange={() => setConfirmationMethod('self')}
                  />
                  <div className="option-content">
                    <div className="option-icon">👤</div>
                    <div>
                      <div className="option-title">تأكيد ذاتي</div>
                      <div className="option-desc">سأقوم بالتأكيد بنفسي</div>
                    </div>
                  </div>
                </label>
                
                <label className="option-card">
                  <input
                    type="radio"
                    name="confirmationMethod"
                    checked={confirmationMethod === 'stooreify'}
                    onChange={() => setConfirmationMethod('stooreify')}
                  />
                  <div className="option-content">
                    <div className="option-icon">👥</div>
                    <div>
                      <div className="option-title">فريق Stooreify</div>
                      <div className="option-desc">سيقوم فريق الدعم بالتأكيد</div>
                    </div>
                  </div>
                </label>
              </div>

              {confirmationMethod === 'stooreify' && (
                <div className="form-group">
                  <label>ملاحظة لعامل التأكيد (اختياري):</label>
                  <textarea
                    value={confirmationNote}
                    onChange={(e) => setConfirmationNote(e.target.value)}
                    placeholder="مثال: اتصل على الرقم البديل: 07..."
                    rows="3"
                  />
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={() => setShowConfirmModal(false)}>
                إلغاء
              </button>
              <button className="submit-btn" onClick={submitConfirmation}>
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;