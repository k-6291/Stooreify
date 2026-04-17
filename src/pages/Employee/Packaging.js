// frontend/src/pages/Employee/Packaging.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import './Packaging.css';

const Packaging = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('طلبات التغليف');
  const [showProductFetchModal, setShowProductFetchModal] = useState(false);
  const [showPackagingModal, setShowPackagingModal] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [showDeliveryInfoModal, setShowDeliveryInfoModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [boxSize, setBoxSize] = useState('');
  const [protectionType, setProtectionType] = useState('');
  const [packagingOrders, setPackagingOrders] = useState([]);
  const [receivedOrders, setReceivedOrders] = useState([]);
  // --- المتغيرات الجديدة للمرحلة الجديدة ---
  const [orderStorageDetails, setOrderStorageDetails] = useState([]); // لتخزين تفاصيل الصناديق
  const [fetchedBoxes, setFetchedBoxes] = useState({}); // لتتبع الصناديق التي تم جلبها
  const [allBoxesFetched, setAllBoxesFetched] = useState(false); // لمعرفة إذا تم جلب الجميع

  // --- الدوال الجديدة للاتصال بالباك إند ---

  // جلب طلبات التغليف من الخادم
  const fetchPackagingOrders = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/packaging/pending-orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب طلبات التغليف');

      const data = await response.json();
      setPackagingOrders(data.orders || []);
    } catch (error) {
      console.error('خطأ في جلب طلبات التغليف:', error.message);
      alert('حدث خطأ أثناء جلب طلبات التغليف.');
    }
  };

  // جلب الطلبات المستلمة من الخادم
  const fetchReceivedOrders = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/packaging/received-orders', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب الطلبات المستلمة');

      const data = await response.json();
      setReceivedOrders(data.orders || []);
    } catch (error) {
      console.error('خطأ في جلب الطلبات المستلمة:', error.message);
      alert('حدث خطأ أثناء جلب الطلبات المستلمة.');
    }
  };

  // --- دالة جديدة: جلب تفاصيل الصناديق لطلب معين ---
  const fetchOrderStorageDetails = async (orderId) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/packaging/order-storage-details/${orderId}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في جلب تفاصيل الصناديق');
      }

      const data = await response.json();
      setOrderStorageDetails(data.storageDetails || []);

      // تهيئة حالة الصناديق إلى "لم تُجلَب"
      const initialFetchedState = {};
      (data.storageDetails || []).forEach(detail => {
        initialFetchedState[detail.boxId] = false;
      });
      setFetchedBoxes(initialFetchedState);
      setAllBoxesFetched(false); // إعادة تعيين حالة "تم جلب الجميع"

    } catch (error) {
      alert('فشل في جلب تفاصيل الصناديق: ' + error.message);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchPackagingOrders();
      
      fetchReceivedOrders();
    }
  }, [user, activeTab]);

  const handleReceiveOrder = async (order) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/packaging/receive-order', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ orderId: order.id })
      });

      if (!response.ok) throw new Error('فشل في تأكيد الاستلام');

      fetchPackagingOrders();
      fetchReceivedOrders();
    } catch (error) {
      alert('فشل في تأكيد الاستلام: ' + error.message);
    }
  };

  // --- تعديل الدالة: عند الضغط على "بدء التغليف" ---
  const handleStartPackaging = async (order) => {
    setSelectedOrder(order);
    // --- استدعاء الدالة الجديدة لجلب تفاصيل الصناديق ---
    await fetchOrderStorageDetails(order.id);
    setShowProductFetchModal(true); // عرض الواجهة الجديدة
  };

  // --- دالة جديدة: عند الضغط على "تم الجلب" لصندوق معين ---
  const handleFetchFromBox = async (boxId, fetchQuantity) => {
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/packaging/fetch-from-box', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          boxId: boxId,
          fetchQuantity: fetchQuantity
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'فشل في تنفيذ الجلب من الصندوق');
      }

      const data = await response.json();
      alert(data.message); // عرض رسالة النجاح

      // تحديث حالة الصندوق إلى "مُجلَب"
      setFetchedBoxes(prev => ({
        ...prev,
        [boxId]: true
      }));

      // التحقق مما إذا تم جلب جميع الصناديق
      const newFetchedState = {
        ...fetchedBoxes,
        [boxId]: true
      };
      const allFetched = orderStorageDetails.every(detail => newFetchedState[detail.boxId]);
      setAllBoxesFetched(allFetched);

    } catch (error) {
      alert('فشل في تنفيذ الجلب من الصندوق: ' + error.message);
    }
  };

  const handleCompletePackaging = async (e) => {
    e.preventDefault();

    if (!boxSize || !protectionType) {
      alert('يرجى اختيار حجم الصندوق ونوع الحماية.');
      return;
    }

    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    // التحقق من أن جميع الصناديق تم جلبها
    const allFetched = orderStorageDetails.every(detail => fetchedBoxes[detail.boxId]);
    if (!allFetched) {
      alert('يجب جلب جميع القطع من الصناديق أولاً.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/packaging/update-status', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: selectedOrder.id,
          // newStatus: 'shipping', // هذا غير مطلوب الآن، لأن الباك إند يحدده تلقائيًا
          boxSize,
          protectionType
        })
      });

      if (!response.ok) throw new Error('فشل في إتمام التغليف');

      // جلب معلومات التوصيل من الخادم
      const deliveryResponse = await fetch(`http://localhost:5000/api/packaging/delivery-info/${selectedOrder.id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!deliveryResponse.ok) throw new Error('فشل في جلب معلومات التوصيل');

      const deliveryData = await deliveryResponse.json();
      setDeliveryInfo(deliveryData);
      setShowProductFetchModal(false);
      setShowPackagingModal(false);
      setShowDeliveryInfoModal(true);
    } catch (error) {
      alert('فشل في إتمام التغليف: ' + error.message);
    }
  };

  const handleCloseDeliveryInfo = () => {
    setShowDeliveryInfoModal(false);
    setShowSuccessMessage(`تم تجهيز الطلب ${selectedOrder.id} بنجاح.`);

    // إخفاء الرسالة بعد 3 ثوانٍ
    setTimeout(() => {
      setShowSuccessMessage('');
      fetchPackagingOrders();
      fetchReceivedOrders();
    }, 3000);
  };

  // --- دالة جديدة: إغلاق نافذة تفاصيل الصناديق ---
  const handleCloseProductFetchModal = () => {
    setShowProductFetchModal(false);
    setSelectedOrder(null);
    setOrderStorageDetails([]); // مسح التفاصيل
    setFetchedBoxes({}); // مسح حالة الصناديق
    setAllBoxesFetched(false); // إعادة تعيين الحالة
  };

  return (
    <div className="packaging-page">
      {/* الهيدر العلوي */}
      <header className="packaging-header">
        <div className="logo">Stooreify</div>
        <div className="user-info">
          {user?.name} {user?.last_name} — {user?.team === 'packaging' ? 'فريق التغليف' : 'غير محدد'}
          <LogoutButton />
        </div>
      </header>

      {/* القائمة الجانبية */}
      <aside className="packaging-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={`nav-item ${activeTab === 'طلبات التغليف' ? 'active' : ''}`}
                onClick={() => setActiveTab('طلبات التغليف')}
              >
                طلبات التغليف
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'مستلمة من طرفي' ? 'active' : ''}`}
                onClick={() => setActiveTab('مستلمة من طرفي')}
              >
                مستلمة من طرفي
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="packaging-main-content">
        {activeTab === 'طلبات التغليف' && (
          <div className="packaging-section">
            <h2>طلبات التغليف</h2>

            <div className="packaging-table-container">
              <table className="packaging-table">
                <thead>
                  <tr>
                    <th>ID عملية التغليف</th>
                    {/* <th>مكان التخزين</th> --> ملغى حسب التصميم الجديد */}
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>فعل</th>
                  </tr>
                </thead>
                <tbody>
                  {packagingOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد طلبات تغليف حاليًا.
                      </td>
                    </tr>
                  ) : (
                    packagingOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        {/* <td>{order.storageLocation}</td> --> ملغى حسب التصميم الجديد */}
                        <td>{order.productName}</td>
                        <td>{order.quantity}</td>
                        <td>
                          <button
                            className="receive-btn"
                            onClick={() => handleReceiveOrder(order)}
                          >
                            استلام
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'مستلمة من طرفي' && (
          <div className="received-section">
            <h2>مستلمة من طرفي</h2>

            <div className="received-table-container">
              <table className="received-table">
                <thead>
                  <tr>
                    <th>ID عملية التغليف</th>
                    {/* <th>مكان التخزين</th> --> ملغى حسب التصميم الجديد */}
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>فعل</th>
                  </tr>
                </thead>
                <tbody>
                  {receivedOrders.length === 0 ? (
                    <tr>
                      <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد طلبات مستلمة حاليًا.
                      </td>
                    </tr>
                  ) : (
                    receivedOrders.map((order) => (
                      <tr key={order.id}>
                        <td>{order.id}</td>
                        {/* <td>{order.storageLocation}</td> --> ملغى حسب التصميم الجديد */}
                        <td>{order.productName}</td>
                        <td>{order.quantity}</td>
                        <td>
                          <button
                            className="package-btn"
                            onClick={() => handleStartPackaging(order)}
                          >
                            بدء التغليف
                          </button>
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

      {/* نموذج تفاصيل الصناديق (واجهة "جلب المنتج من الصناديق") الجديدة */}
      {showProductFetchModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal fetch-modal">
            <div className="modal-header">
              <h3>جلب المنتج من الصناديق</h3>
              <button
                className="close-btn"
                onClick={handleCloseProductFetchModal}
              >
                ×
              </button>
            </div>
            <div className="product-fetch-details">
              <h4>الطلب #{selectedOrder.id} - {selectedOrder.productName} (الكمية: {selectedOrder.quantity})</h4>

              {/* جدول تفاصيل الصناديق */}
              <div className="storage-details-table-container">
                <table className="storage-details-table">
                  <thead>
                    <tr>
                      <th>ID الصندوق</th>
                      <th>مكان التخزين</th>
                      <th>منطقة التخزين</th>
                      <th>الكمية المطلوب جلبها</th>
                      <th>الحالة</th>
                      <th>فعل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orderStorageDetails.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                          جاري تحميل تفاصيل الصناديق...
                        </td>
                      </tr>
                    ) : (
                      orderStorageDetails.map((detail) => (
                        <tr key={detail.boxId}>
                          <td>{detail.boxId}</td>
                          <td>{detail.slotNumber}</td>
                          <td>{detail.zone}</td>
                          <td>{detail.fetchQuantity}</td>
                          <td>
                            {fetchedBoxes[detail.boxId] ? (
                              <span className="status fetched">تم الجلب</span>
                            ) : (
                              <span className="status pending">قيد الانتظار</span>
                            )}
                          </td>
                          <td>
                            {!fetchedBoxes[detail.boxId] ? (
                              <button
                                className="fetch-btn"
                                onClick={() => handleFetchFromBox(detail.boxId, detail.fetchQuantity)}
                              >
                                تم الجلب
                              </button>
                            ) : (
                              <button className="fetch-btn" disabled>
                                ✓ تم
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* زر "إتمام عملية التغليف" يظهر فقط إذا تم جلب جميع الصناديق */}
              {allBoxesFetched && (
                <div className="modal-actions" style={{ marginTop: '20px' }}>
                  <button
                    className="submit-btn"
                    onClick={() => {
                      setShowProductFetchModal(false);
                      setShowPackagingModal(true);
                      setBoxSize('');
                      setProtectionType('');
                    }}
                  >
                    إتمام عملية التغليف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* نموذج اختيار حجم الصندوق ونوع الحماية */}
      {showPackagingModal && (
        <div className="modal-overlay">
          <div className="modal packaging-modal">
            <div className="modal-header">
              <h3>اختيار حجم الصندوق ونوع الحماية</h3>
              <button
                className="close-btn"
                onClick={() => setShowPackagingModal(false)}
              >
                ×
              </button>
            </div>
            <form className="packaging-form" onSubmit={handleCompletePackaging}>
              <div className="form-group">
                <label>حجم الصندوق:</label>
                <select
                  value={boxSize}
                  onChange={(e) => setBoxSize(e.target.value)}
                  required
                >
                  <option value="">اختر حجم الصندوق</option>
                  <option value="صغير">صغير</option>
                  <option value="متوسط">متوسط</option>
                  <option value="كبير">كبير</option>
                </select>
              </div>

              <div className="form-group">
                <label>نوع الحماية:</label>
                <select
                  value={protectionType}
                  onChange={(e) => setProtectionType(e.target.value)}
                  required
                >
                  <option value="">اختر نوع الحماية</option>
                  <option value="فقاعات">فقاعات</option>
                  <option value="أكياس هواء">أكياس هواء</option>
                  <option value="بدون حماية">بدون حماية</option>
                </select>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => setShowPackagingModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  إتمام عملية التغليف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج معلومات التوصيل */}
      {showDeliveryInfoModal && deliveryInfo && (
        <div className="modal-overlay">
          <div className="modal delivery-info-modal">
            <div className="modal-header">
              <h3>معلومات التوصيل</h3>
              <button
                className="close-btn"
                onClick={handleCloseDeliveryInfo}
              >
                ×
              </button>
            </div>
            <div className="delivery-info-content">
              <h4>اكتب هذه المعلومات على ورقة — والصقها على الطرد:</h4>
              <div className="info-section">
                <div className="detail-row">
                  <span className="detail-label">اسم المشتري:</span>
                  <span className="detail-value">{deliveryInfo.buyerName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">هاتف المشتري:</span>
                  <span className="detail-value">{deliveryInfo.buyerPhone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">العنوان:</span>
                  <span className="detail-value">{deliveryInfo.address}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">الولاية:</span>
                  <span className="detail-value">{deliveryInfo.wilaya}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">مكان التوصيل:</span>
                  <span className="detail-value">{deliveryInfo.deliveryLocation}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ID الطلب:</span>
                  <span className="detail-value">{deliveryInfo.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">اسم المتجر:</span>
                  <span className="detail-value">{deliveryInfo.storeName}</span>
                </div>
              </div>

              <h4 style={{ marginTop: '30px' }}>اكتب هذه المعلومات في الظرف — وسلمه لفريق الدعم بعد التوصيل:</h4>
              <div className="info-section">
                <div className="detail-row">
                  <span className="detail-label">ID الطلب:</span>
                  <span className="detail-value">{deliveryInfo.orderId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">ID التاجر:</span>
                  <span className="detail-value">{deliveryInfo.merchantId}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">السعر الإجمالي:</span>
                  <span className="detail-value">{deliveryInfo.totalPrice} دج</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">سعر المنتج:</span>
                  <span className="detail-value">{deliveryInfo.productPrice} دج</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">سعر التوصيل:</span>
                  <span className="detail-value">{deliveryInfo.deliveryPrice} دج</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">عدد القطع:</span>
                  <span className="detail-value">{deliveryInfo.quantity}</span>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: '30px' }}>
                <button
                  className="submit-btn"
                  onClick={handleCloseDeliveryInfo}
                >
                  تم كتابة المعلومات
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* رسالة النجاح */}
      {showSuccessMessage && (
        <div className="success-message">
          {showSuccessMessage}
        </div>
      )}
    </div>
  );
};

export default Packaging;
