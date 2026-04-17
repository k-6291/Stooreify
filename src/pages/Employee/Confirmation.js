// frontend/src/pages/Employee/Confirmation.js
import React, { useState, useEffect } from 'react';
import './Confirmation.css';
import { useAuth } from '../../context/AuthContext';

const Confirmation = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' أو 'assigned'
  const [pendingOrders, setPendingOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState({ new: [], attempt1: [], attempt2: [] });
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [callDuration, setCallDuration] = useState('');
  const [remarks, setRemarks] = useState('');
  const [activeSubTab, setActiveSubTab] = useState('new'); // 'new', 'attempt1', 'attempt2'
  const [processingOrderId, setProcessingOrderId] = useState(null);

  // جلب الطلبات غير المستلمة
  const fetchPendingOrders = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/confirmation/pending', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل في جلب الطلبات');
      const data = await res.json();
      setPendingOrders(data.orders || []);
    } catch (err) {
      console.error('خطأ في جلب الطلبات غير المستلمة:', err);
      alert('فشل في جلب الطلبات غير المستلمة');
    } finally {
      setLoading(false);
    }
  };

  // جلب الطلبات المستلمة
  const fetchAssignedOrders = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/confirmation/assigned', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل في جلب الطلبات المستلمة');
      const data = await res.json();
      setAssignedOrders(data);
    } catch (err) {
      console.error('خطأ في جلب الطلبات المستلمة:', err);
      alert('فشل في جلب الطلبات المستلمة');
    }
  };

  useEffect(() => {
    fetchPendingOrders();
    fetchAssignedOrders();
  }, [user?.token]);

  // استلام طلب
  const handleAssignOrder = async (orderId) => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/confirmation/assign', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId })
      });
      if (!res.ok) throw new Error('فشل في استلام الطلب');
      alert('تم استلام الطلب بنجاح');
      fetchPendingOrders();
      fetchAssignedOrders();
    } catch (err) {
      console.error('خطأ في استلام الطلب:', err);
      alert('فشل في استلام الطلب');
    }
  };

  // فتح مودال بدء التأكيد
  const handleStartConfirmation = (order) => {
    setSelectedOrder(order);
    setCallDuration('');
    setRemarks('');
    setShowModal(true);
  };

  // تسجيل نتيجة المحاولة
  const handleRecordAttempt = async (result) => {
    if (!user?.token || !selectedOrder) return;
    if (result === 'no_response' && !callDuration) {
      alert('الرجاء إدخال مدة المكالمة');
      return;
    }

    setProcessingOrderId(selectedOrder.id);
    try {
      const res = await fetch('http://localhost:5000/api/confirmation/record-attempt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          result,
          callDurationMinutes: result === 'no_response' ? parseInt(callDuration) : null,
          remarks: result !== 'confirmed' ? remarks : null
        })
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${res.status}`);
      }
      const data = await res.json();
      alert(data.message);
      setShowModal(false);
      fetchAssignedOrders();
    } catch (err) {
      console.error('خطأ في تسجيل نتيجة التأكيد:', err);
      alert('فشل في تسجيل النتيجة: ' + err.message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  return (
    <div className="confirmation-page">
      {/* الهيدر */}
      <header className="confirmation-header">
        <h1>فريق تأكيد الطلبات</h1>
        <div className="user-info">
          {user?.name} {user?.last_name} — فريق التأكيد
        </div>
      </header>

     {/* القائمة الجانبية */}
<aside className="sidebar">
  <nav className="sidebar-nav">
    <button
      className={activeTab === 'pending' ? 'nav-item active' : 'nav-item'}
      onClick={() => setActiveTab('pending')}
    >
      <span className="nav-icon">📥</span>
      <span className="nav-text">طلبات التأكيد</span>
    </button>
    
    <div className="nav-group">
      <button
        className={activeTab === 'assigned' ? 'nav-item active parent' : 'nav-item parent'}
        onClick={() => setActiveTab('assigned')}
      >
        <span className="nav-icon">📋</span>
        <span className="nav-text">مستلمة من طرفي</span>
      </button>
      
      {activeTab === 'assigned' && (
        <div className="sub-nav">
          <button
            className="sub-nav-item"
            onClick={() => setActiveSubTab('new')}
          >
            جديدة
          </button>
          <button
            className="sub-nav-item"
            onClick={() => setActiveSubTab('attempt1')}
          >
            لم يرد (المحاولة 1)
          </button>
          <button
            className="sub-nav-item"
            onClick={() => setActiveSubTab('attempt2')}
          >
            لم يرد (المحاولة 2)
          </button>
        </div>
      )}
    </div>
  </nav>
</aside>

{/* المحتوى الرئيسي */}
<main className="main-content">
  {activeTab === 'pending' && (
    <div className="section">
      <div className="section-header">
        <h2>طلبات التأكيد</h2>
      </div>
      {loading ? (
        <div className="loading">جارٍ التحميل...</div>
      ) : pendingOrders.length === 0 ? (
        <div className="empty-state">لا توجد طلبات تأكيد حاليًا.</div>
      ) : (
        <div className="orders-grid">
          {pendingOrders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-header">
                <span className="order-id">#{order.id}</span>
              </div>
              <div className="order-body">
                <div className="order-info">
                  <p><strong>المنتج:</strong> {order.product_name}</p>
                  <p><strong>المشتري:</strong> {order.buyer_name} {order.buyer_last_name}</p>
                  <p><strong>الولاية:</strong> {order.wilaya}</p>
                </div>
                <button
                  className="assign-btn"
                  onClick={() => handleAssignOrder(order.id)}
                  disabled={processingOrderId === order.id}
                >
                  {processingOrderId === order.id ? 'جارٍ الاستلام...' : 'استلام'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )}

  {activeTab === 'assigned' && (
    <div className="section">
      <div className="section-header">
        <h2>
          {activeSubTab === 'new' ? 'جديدة' : 
           activeSubTab === 'attempt1' ? 'لم يرد (المحاولة 1)' : 
           'لم يرد (المحاولة 2)'}
        </h2>
      </div>
      
      {(() => {
        const orders = assignedOrders[activeSubTab] || [];
        return orders.length === 0 ? (
          <div className="empty-state">
            {activeSubTab === 'new' ? 'لا توجد طلبات جديدة.' : 
             activeSubTab === 'attempt1' ? 'لا توجد طلبات للمحاولة الأولى.' : 
             'لا توجد طلبات للمحاولة الثانية.'}
          </div>
        ) : (
          <div className="orders-grid">
            {orders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <span className="order-id">#{order.id}</span>
                </div>
                <div className="order-body">
                  <div className="order-info">
                    <p><strong>المنتج:</strong> {order.product_name}</p>
                    <p><strong>المشتري:</strong> {order.buyer_name} {order.buyer_last_name}</p>
                    <p><strong>الولاية:</strong> {order.wilaya}</p>
                  </div>
                  <button
                    className="start-btn"
                    onClick={() => handleStartConfirmation(order)}
                  >
                    {activeSubTab === 'new' ? 'بدء التأكيد' : 
                     activeSubTab === 'attempt1' ? 'إعادة المحاولة' : 'المحاولة الأخيرة'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        );
      })()}
    </div>
  )}
</main>

      {/* مودال بدء التأكيد */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="confirmation-modal">
            <div className="modal-header">
              <h2>تأكيد الطلب #{selectedOrder.id}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}>×</button>
            </div>

            <div className="modal-body">
              {/* الجانب الأيمن: معلومات المتجر والمنتج */}
              <div className="store-product-info">
                <h3>معلومات المتجر والمنتج</h3>
                <p><strong>اسم المتجر:</strong> {selectedOrder.store_name}</p>
                <p><strong>اسم المنتج:</strong> {selectedOrder.product_name}</p>
                {selectedOrder.product_image && (
                  <img
                    src={`http://localhost:5000${selectedOrder.product_image}`}
                    alt={selectedOrder.product_name}
                    className="product-image"
                  />
                )}
                <p><strong>نوع المنتج:</strong> {selectedOrder.product_type || 'غير محدد'}</p>
              </div>

              {/* الجانب الأيسر: معلومات الطلب */}
              <div className="buyer-order-info">
                <h3>معلومات الطلب</h3>
                <p><strong>اسم المشتري:</strong> {selectedOrder.buyer_name} {selectedOrder.buyer_last_name}</p>
                <p><strong>الولاية:</strong> {selectedOrder.wilaya}</p>
                <p><strong>العنوان:</strong> {selectedOrder.address}</p>
                <p><strong>الكمية:</strong> {selectedOrder.quantity}</p>
                <p><strong>رقم الهاتف:</strong> {selectedOrder.buyer_phone}</p>
                <p><strong>مكان التوصيل:</strong> {selectedOrder.delivery_location === 'office' ? 'مكتب' : 'منزل'}</p>
                <p><strong>ملاحظة التاجر:</strong> {selectedOrder.confirmation_note || 'لا توجد'}</p>
                <p><strong>سعر المنتج:</strong> {selectedOrder.product_price} دج</p>
                <p><strong>سعر التوصيل:</strong> {selectedOrder.delivery_price} دج</p>
                <p><strong>الإجمالي:</strong> {selectedOrder.total_price} دج</p>
              </div>
            </div>

            {/* إدخال مدة المكالمة وملاحظة */}
            <div className="modal-inputs">
              <div className="input-group">
                <label>مدة المكالمة (بالدقائق):</label>
                <input
                  type="number"
                  min="0"
                  value={callDuration}
                  onChange={(e) => setCallDuration(e.target.value)}
                  placeholder="مثال: 3"
                />
              </div>
              <div className="input-group">
                <label>ملاحظة للتاجر:</label>
                <textarea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="اكتب ملاحظتك هنا..."
                />
              </div>
            </div>

            {/* أزرار النتيجة */}
            <div className="modal-actions">
              <button
                className="btn confirmed"
                onClick={() => handleRecordAttempt('confirmed')}
                disabled={processingOrderId === selectedOrder.id}
              >
                {processingOrderId === selectedOrder.id ? 'جاري التأكيد...' : '✅ تم التأكيد'}
              </button>
              <button
                className="btn no-response"
                onClick={() => handleRecordAttempt('no_response')}
                disabled={processingOrderId === selectedOrder.id}
              >
                📞 لم يرد
              </button>
              <button
                className="btn cancelled"
                onClick={() => handleRecordAttempt('cancelled')}
                disabled={processingOrderId === selectedOrder.id}
              >
                ❌ تم إلغاء الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Confirmation;