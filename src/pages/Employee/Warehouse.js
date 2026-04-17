import React, { useState, useEffect } from 'react';
import './Warehouse.css';
import { useAuth } from '../../context/AuthContext';

const Warehouse = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('المنتجات القادمة');
  const [incomingProducts, setIncomingProducts] = useState([]);
  const [returnRequests, setReturnRequests] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedReturn, setSelectedReturn] = useState(null);
  const [showStorageModal, setShowStorageModal] = useState(false);
  const [showBoxDetails, setShowBoxDetails] = useState([]);
  const [boxQuantities, setBoxQuantities] = useState([0]);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionForm, setInspectionForm] = useState({
    status: null,
    restockDecision: null,
    newBoxes: []
  });

  // === جلب البيانات ===
  const fetchReturnRequests = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse/return-requests', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل في جلب الطلبات المرتجعة');
      const data = await res.json();
      setReturnRequests(data.requests || []);
    } catch (error) {
      alert('فشل في جلب الطلبات المرتجعة.');
    }
  };

  const fetchIncomingProducts = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse/incoming-products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل في جلب المنتجات القادمة');
      const data = await res.json();
      setIncomingProducts(data.products || []);
    } catch (error) {
      alert('فشل في جلب المنتجات القادمة.');
    }
  };

  useEffect(() => {
    if (activeTab === 'الطلبات المرتجعة') {
      fetchReturnRequests();
    } else if (activeTab === 'المنتجات القادمة') {
      fetchIncomingProducts();
    }
  }, [activeTab, user?.token]);

  // === التخزين ===
  const handleConfirmClick = (product) => {
    setSelectedProduct(product);
    setShowStorageModal(true);
    setBoxQuantities([0]);
  };

  const addBox = () => {
    setBoxQuantities([...boxQuantities, 0]);
  };

  const updateBoxQuantity = (index, value) => {
    const newQuantities = [...boxQuantities];
    const numValue = Number(value);
    newQuantities[index] = isNaN(numValue) ? 0 : Math.max(0, numValue);
    setBoxQuantities(newQuantities);
  };

  const handleSaveDistribution = async () => {
    if (!selectedProduct || !user?.token) return;

    const total = boxQuantities.reduce((sum, q) => sum + q, 0);
    if (total !== selectedProduct.quantity) {
      alert(`المجموع (${total}) لا يساوي الكمية الإجمالية (${selectedProduct.quantity})`);
      return;
    }

   try {
    const res = await fetch('http://localhost:5000/api/warehouse/distribute-boxes', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${user.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId: selectedProduct.id, boxes: boxQuantities.map(q => ({ quantity: q })) })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    // ✅ استخدم البيانات المرسلة من الـ backend مباشرةً
    setShowStorageModal(false);
    setShowBoxDetails(data.newlyStoredBoxes || []);
  } catch (error) {
    alert('خطأ: ' + error.message);
  }
};

  const handleFinishBoxDetails = () => {
    setShowBoxDetails([]);
    fetchIncomingProducts();
  };

  // === فحص الإرجاع ===
  const openInspectionModal = (order) => {
    setSelectedReturn(order);
    setShowInspectionModal(true);
    setInspectionForm({ status: null, restockDecision: null, newBoxes: [] });
  };

  const addNewBox = () => {
    setInspectionForm(prev => ({
      ...prev,
      newBoxes: [...prev.newBoxes, { quantity: 1 }]
    }));
  };

  const removeNewBox = (index) => {
    setInspectionForm(prev => ({
      ...prev,
      newBoxes: prev.newBoxes.filter((_, i) => i !== index)
    }));
  };

  const updateNewBoxQuantity = (index, value) => {
    const newQuantities = [...inspectionForm.newBoxes];
    const numValue = Number(value);
    newQuantities[index] = isNaN(numValue) ? 1 : Math.max(1, numValue);
    setInspectionForm(prev => ({ ...prev, newBoxes: newQuantities }));
  };

  const handleInspectionSubmit = async () => {
  if (!selectedReturn || !inspectionForm.status || !user?.token) return;

  try {
    const payload = {
      orderId: selectedReturn.orderId,
      inspectionStatus: inspectionForm.status,
      restockDecision: inspectionForm.restockDecision
    };

    if (inspectionForm.restockDecision === 'new') {
      payload.newBoxes = inspectionForm.newBoxes;
    }

    const res = await fetch('http://localhost:5000/api/warehouse/inspect-return-item', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'فشل في الفحص');

    // ✅ عرض تفاصيل الصناديق فورًا
    if (data.boxDetails && data.boxDetails.length > 0) {
      setShowBoxDetails(data.boxDetails);
    }

    fetchReturnRequests();
    setShowInspectionModal(false);
    // لا حاجة لـ alert — النافذة تُظهر التفاصيل
  } catch (error) {
    alert('خطأ: ' + error.message);
  }
};

  const menuItems = [
    { id: 'المنتجات القادمة', icon: '📦', label: 'المنتجات القادمة' },
    { id: 'الطلبات المرتجعة', icon: '↩️', label: 'الطلبات المرتجعة' }
  ];

  return (
    <div className="warehouse-page">
      <header className="warehouse-header">
        <div className="logo">Stooreify - مستودع</div>
        <div className="user-info">
          {user?.name} — {user?.team === 'warehouse' ? 'مستودع' : 'غير محدد'}
        </div>
      </header>

      <aside className="warehouse-sidebar">
        <nav className="sidebar-nav">
          <ul>
            {menuItems.map(item => (
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

      <main className="warehouse-main-content">
        {activeTab === 'الطلبات المرتجعة' && (
          <div className="section">
            <h2>الطلبات المرتجعة</h2>
            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>ID الطلب</th>
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>اسم المتجر</th>
                    <th>سبب الإرجاع</th>
                    <th>الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {returnRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="no-data">لا توجد طلبات مرتجعة</td>
                    </tr>
                  ) : (
                    returnRequests.map(order => (
                      <tr key={order.orderId}>
                        <td>{order.orderId}</td>
                        <td>{order.productName}</td>
                        <td>{order.quantity}</td>
                        <td>{order.storeName}</td>
                        <td>{order.returnReason || 'غير محدد'}</td>
                        <td>
                          <button className="action-btn inspect" onClick={() => openInspectionModal(order)}>
                            فحص المنتج
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

        {activeTab === 'المنتجات القادمة' && (
          <div className="incoming-section">
            <h2>المنتجات القادمة</h2>
            <div className="incoming-table-container">
              <table className="incoming-table">
                <thead>
                  <tr>
                    <th>ID عملية التخزين</th>
                    <th>اسم المنتج</th>
                    <th>الكمية</th>
                    <th>النوع</th>
                    <th>فعل</th>
                  </tr>
                </thead>
                <tbody>
                  {incomingProducts.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد منتجات قادمة حاليًا.
                      </td>
                    </tr>
                  ) : (
                    incomingProducts.map((product) => (
                      <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.productName}</td>
                        <td>{product.quantity}</td>
                        <td>{product.type}</td>
                        <td>
                          <button className="action-btn confirm" onClick={() => handleConfirmClick(product)}>
                            تأكيد التخزين
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

        {/* نافذة التخزين */}
        {showStorageModal && selectedProduct && (
          <div className="modal-overlay" onClick={() => setShowStorageModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>توزيع المنتج على الصناديق</h3>
              <p><strong>المنتج:</strong> {selectedProduct.productName}</p>
              <p><strong>الكمية الإجمالية:</strong> {selectedProduct.quantity}</p>
              <div className="boxes-input">
                {boxQuantities.map((quantity, index) => (
                  <div key={index} className="box-row">
                    <label>الصندوق {index + 1}:</label>
                    <input
                      type="number"
                      min="0"
                      value={quantity}
                      onChange={(e) => updateBoxQuantity(index, e.target.value)}
                    />
                  </div>
                ))}
                <button className="add-box-btn" onClick={addBox}>إضافة صندوق</button>
              </div>
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowStorageModal(false)}>إلغاء</button>
                <button className="save-btn" onClick={handleSaveDistribution}>حفظ التوزيع</button>
              </div>
            </div>
          </div>
        )}

        {/* عرض تفاصيل الصناديق بعد التخزين */}
        {showBoxDetails.length > 0 && (
          <div className="modal-overlay" onClick={handleFinishBoxDetails}>
            <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
              <h3>تفاصيل الصناديق بعد التخزين</h3>
              <table className="stored-table">
                <thead>
                  <tr>
                    <th>ID الصندوق</th>
                    <th>الكمية</th>
                    <th>المنطقة</th>
                    <th>مكان التخزين</th>
                  </tr>
                </thead>
                <tbody>
                  {showBoxDetails.map((box, idx) => (
                    <tr key={idx}>
                      <td>{box.boxId}</td>
                      <td>{box.quantity}</td>
                      <td>{box.zone}</td>
                      <td>{box.slot_number}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button className="finish-btn" onClick={handleFinishBoxDetails}>إنهاء</button>
            </div>
          </div>
        )}

        {/* نافذة فحص الإرجاع — بدون تغيير */}
        {showInspectionModal && selectedReturn && (
          <div className="modal-overlay" onClick={() => setShowInspectionModal(false)}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
              <h3>فحص المنتج — الطلب #{selectedReturn.orderId}</h3>
              <p><strong>المنتج:</strong> {selectedReturn.productName}</p>
              <p><strong>الكمية:</strong> {selectedReturn.quantity}</p>

              {!inspectionForm.status ? (
                <div className="inspection-options">
                  <div className="option-group">
                    <label>حالة المنتج:</label>
                    <div>
                      <button onClick={() => setInspectionForm(prev => ({ ...prev, status: 'good' }))}>سليم</button>
                      <button onClick={() => setInspectionForm(prev => ({ ...prev, status: 'damaged' }))}>تالف</button>
                    </div>
                  </div>
                </div>
              ) : inspectionForm.status === 'good' && !inspectionForm.restockDecision ? (
                <div className="restock-options">
                  <button onClick={() => setInspectionForm(prev => ({ ...prev, restockDecision: 'original' }))}>
                    الصندوق الأصلي
                  </button>
                  <button onClick={() => setInspectionForm(prev => ({ ...prev, restockDecision: 'new' }))}>
                    صندوق جديد
                  </button>
                </div>
              ) : inspectionForm.restockDecision === 'new' ? (
                <div>
                  <label>أدخل كميات الصناديق الجديدة (المجموع = {selectedReturn.quantity}):</label>
                  {inspectionForm.newBoxes.map((box, index) => (
                    <div key={index} className="box-row">
                      <input
                        type="number"
                        min="1"
                        value={box.quantity}
                        onChange={(e) => updateNewBoxQuantity(index, e.target.value)}
                      />
                      <button type="button" onClick={() => removeNewBox(index)}>حذف</button>
                    </div>
                  ))}
                  <button onClick={addNewBox}>إضافة صندوق</button>
                  <button onClick={handleInspectionSubmit}>تأكيد</button>
                </div>
              ) : (
                <button onClick={handleInspectionSubmit}>تأكيد الفحص</button>
              )}

              <button className="cancel-btn" onClick={() => setShowInspectionModal(false)}>إغلاق</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Warehouse;