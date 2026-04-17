import React, { useState, useEffect } from 'react';
import './Office.css';
import LogoutButton from '../../components/LogoutButton';
import { useAuth } from '../../context/AuthContext';

const Office = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('عملية جلب');
  const [deliveryOperations, setDeliveryOperations] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [withdrawalOperations, setWithdrawalOperations] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState('');
  const [merchantPassword, setMerchantPassword] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState({
    deliveries: false,
    withdrawals: false,
    warehouses: false
  });
  const [processingPickupId, setProcessingPickupId] = useState(null);

  // التحقق من الفريق
  useEffect(() => {
    if (user && user.team !== 'office') {
      setErrorMessage('غير مسموح لك بالوصول إلى هذه الصفحة.');
    }
  }, [user]);

  // دالة جلب عمليات الجلب (المنتجات القادمة)
  const fetchDeliveryOperations = async () => {
    if (!user?.token) return;

    setLoading(prev => ({ ...prev, deliveries: true }));
    setErrorMessage('');

    try {
      const res = await fetch('http://localhost:5000/api/office/incoming-products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('📦 incoming-products response:', data);
      setDeliveryOperations(data.products || []);
    } catch (err) {
      console.error('خطأ في جلب عمليات الجلب:', err);
      setErrorMessage('فشل في جلب بيانات الجلب. تحقق من الخادم والتوكن.');
    } finally {
      setLoading(prev => ({ ...prev, deliveries: false }));
    }
  };

  // دالة جلب طلبات السحب
  const fetchWithdrawalOperations = async () => {
    if (!user?.token) return;

    setLoading(prev => ({ ...prev, withdrawals: true }));

    try {
      const res = await fetch('http://localhost:5000/api/office/pending-withdrawals', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      console.log('💸 pending-withdrawals response:', data);
      setWithdrawalOperations(data.withdrawals || []);
    } catch (err) {
      console.error('خطأ في جلب عمليات السحب:', err);
      setErrorMessage('فشل في جلب بيانات السحب.');
    } finally {
      setLoading(prev => ({ ...prev, withdrawals: false }));
    }
  };

  // جلب المستودعات
  const fetchWarehouses = async () => {
    if (!user?.token) return;

    setLoading(prev => ({ ...prev, warehouses: true }));

    try {
      const res = await fetch('http://localhost:5000/api/admin/warehouses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setWarehouses(data.warehouses || []);
    } catch (err) {
      console.error('فشل في جلب المستودعات:', err);
      setErrorMessage('فشل في جلب المستودعات.');
    } finally {
      setLoading(prev => ({ ...prev, warehouses: false }));
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchDeliveryOperations();
     
      fetchWithdrawalOperations();
      
      fetchWarehouses();
     
    }
  }, [user?.token]);

  // مساعدة: دالة لاستخراج قيمة المعرف بأمان من كائن المنتج
  const getPickupIdFromDelivery = (delivery) => {
    return delivery?.pickupId || delivery?.pickup_id || delivery?.id || delivery?._id || null;
  };

  const openConfirmModal = (product) => {
    setSelectedProduct(product);
    setSelectedWarehouseId('');
    setShowConfirmModal(true);
  };
  

  const handleConfirmProductReceipt = async () => {
    if (!selectedProduct || !selectedWarehouseId) {
      setErrorMessage('يرجى اختيار مستودع.');
      return;
    }

    try {
      setProcessingPickupId(selectedProduct.id);

      const res = await fetch('http://localhost:5000/api/office/confirm-product-receipt', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ productId: selectedProduct.id, warehouse_id: selectedWarehouseId })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      await fetchDeliveryOperations();
      setShowSuccessMessage(`تم تأكيد وصول المنتج ${selectedProduct.id} وربطه بالمستودع.`);
      setTimeout(() => setShowSuccessMessage(''), 3500);
    } catch (err) {
      console.error(err);
      setErrorMessage('حدث خطأ أثناء التأكيد: ' + (err.message || 'خطأ غير معروف'));
    } finally {
      setShowConfirmModal(false);
      setSelectedProduct(null);
      setProcessingPickupId(null);
    }
  };

  const handleWithdrawClick = (withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setShowWithdrawModal(true);
    setMerchantPassword('');
  };

  const handleConfirmWithdrawal = async (e) => {
    e.preventDefault();

    if (!selectedWithdrawal) {
      setErrorMessage('لا توجد عملية سحب محددة.');
      return;
    }

    if (!merchantPassword) {
      setErrorMessage('الرجاء إدخال كلمة سر التاجر.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/office/confirm-withdrawal/${selectedWithdrawal.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ merchantPassword })
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setShowWithdrawModal(false);
      setShowSuccessMessage(data.message);
      
      setTimeout(() => {
        setShowSuccessMessage('');
        fetchWithdrawalOperations();
        window.location.reload();
      }, 3000);
    } catch (err) {
      console.error('خطأ في تأكيد السحب:', err);
      setErrorMessage('حدث خطأ أثناء تأكيد السحب: ' + (err.message || 'خطأ غير معروف'));
    }
  };

  return (
    <div className="office-page">
      {/* الهيدر العلوي */}
      <header className="office-header">
        <div className="logo">Stooreify</div>
        <div className="user-info">
          {user?.name} {user?.last_name} — {user?.team === 'office' ? 'فريق المكتب' : 'غير محدد'}
          <LogoutButton />
        </div>
      </header>

      {/* القائمة الجانبية */}
      <aside className="office-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button
                className={`nav-item ${activeTab === 'عملية جلب' ? 'active' : ''}`}
                onClick={() => setActiveTab('عملية جلب')}
              >
                عملية جلب
              </button>
            </li>
            <li>
              <button
                className={`nav-item ${activeTab === 'عملية سحب' ? 'active' : ''}`}
                onClick={() => setActiveTab('عملية سحب')}
              >
                عملية سحب
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="office-main-content">
        {errorMessage && (
          <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{errorMessage}</div>
        )}

        {activeTab === 'عملية جلب' && (
          <div className="delivery-section">
            <h2>عملية الجلب</h2>

            {loading.deliveries && <p>جاري تحميل البيانات...</p>}

            <div className="delivery-table-container">
              <table className="delivery-table">
                <thead>
                  <tr>
                    <th>ID عملية الجلب</th>
                    <th>اسم التاجر</th>
                    <th>الكمية</th>
                    <th>اسم المنتج</th>
                    <th>مزيد من المعلومات</th>
                    <th>فعل</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryOperations.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد عمليات جلب حالياً.
                      </td>
                    </tr>
                  ) : (
                    deliveryOperations.map((delivery, idx) => {
                      const pickupId = getPickupIdFromDelivery(delivery);
                      return (
                        <tr key={idx}>
                          <td>{pickupId || '-'}</td>
                          <td>{delivery.merchantName || delivery.storeName || '-'}</td>
                          <td>{delivery.quantity ?? '-'}</td>
                          <td>{delivery.productName || delivery.name || '-'}</td>
                          <td>
                            <button
                              className="details-btn"
                              onClick={() => {
                                console.log('تفاصيل:', delivery);
                                alert(JSON.stringify({
                                  id: pickupId,
                                  merchant: delivery.merchantName,
                                  product: delivery.productName,
                                  quantity: delivery.quantity
                                }, null, 2));
                              }}
                            >
                              تفاصيل
                            </button>
                          </td>
                          <td>
                            <button
                              className="confirm-btn"
                              onClick={() => openConfirmModal(delivery)}
                              disabled={processingPickupId === delivery.id}
                            >
                              {processingPickupId === delivery.id ? 'جاري المعالجة...' : 'تأكيد'}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'عملية سحب' && (
          <div className="withdrawal-section">
            <h2>عملية السحب</h2>

            {loading.withdrawals && <p>جاري تحميل البيانات...</p>}

            <div className="withdrawal-table-container">
              <table className="withdrawal-table">
                <thead>
                  <tr>
                    <th>ID عملية السحب</th>
                    <th>اسم التاجر</th>
                    <th>رقم الهاتف</th>
                    <th>المبلغ المطلوب</th>
                    <th>فعل</th>
                  </tr>
                </thead>
                <tbody>
                  {withdrawalOperations.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد عمليات سحب حالياً.
                      </td>
                    </tr>
                  ) : (
                    withdrawalOperations.map((withdrawal, index) => (
                      <tr key={index}>
                        <td>{withdrawal.id}</td>
                        <td>{withdrawal.merchantName}</td>
                        <td>{withdrawal.merchantPhone || withdrawal.phone}</td>
                        <td>{withdrawal.amount} دج</td>
                        <td>
                          <button
                            className="withdraw-btn"
                            onClick={() => handleWithdrawClick(withdrawal)}
                          >
                            تأكيد عملية السحب
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

      {/* مودال تأكيد وصول المنتج */}
      {showConfirmModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تأكيد وصول المنتج</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedProduct(null);
                }}
              >
                ×
              </button>
            </div>
            <div className="confirm-product-content">
              <p><strong>اسم المنتج:</strong> {selectedProduct.productName || selectedProduct.name || 'غير محدد'}</p>
              <p><strong>الكمية:</strong> {selectedProduct.quantity ?? 'غير محدد'}</p>
              <p><strong>اسم التاجر:</strong> {selectedProduct.merchantName || selectedProduct.storeName || 'غير محدد'}</p>

              <div className="form-group">
                <label>اختر المستودع:</label>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => setSelectedWarehouseId(e.target.value)}
                  required
                >
                  <option value="">اختر مستودعًا</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => {
                  setShowConfirmModal(false);
                  setSelectedProduct(null);
                }}
              >
                إلغاء
              </button>
              <button
                type="button"
                className="submit-btn"
                onClick={handleConfirmProductReceipt}
              >
                إتمام
              </button>
            </div>
          </div>
        </div>
      )}

      {/* نموذج تأكيد عملية السحب */}
      {showWithdrawModal && selectedWithdrawal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تأكيد عملية السحب</h3>
              <button
                className="close-btn"
                onClick={() => {
                  setShowWithdrawModal(false);
                  setMerchantPassword('');
                }}
              >
                ×
              </button>
            </div>
            <form className="withdraw-form" onSubmit={handleConfirmWithdrawal}>
              <div className="form-group">
                <label>أدخل كلمة سر التاجر:</label>
                <input
                  type="password"
                  value={merchantPassword}
                  onChange={(e) => setMerchantPassword(e.target.value)}
                  placeholder="كلمة السر"
                  required
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={() => {
                    setShowWithdrawModal(false);
                    setMerchantPassword('');
                  }}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  تأكيد
                </button>
              </div>
            </form>
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

export default Office;