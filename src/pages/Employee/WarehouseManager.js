import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './WarehouseManager.css';

const WarehouseManager = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('incoming'); // incoming, stored, locations, delivery, team
  const [incomingProducts, setIncomingProducts] = useState([]);
  const [storedProducts, setStoredProducts] = useState([]);
  const [storageLocations, setStorageLocations] = useState([]);
  const [newLocation, setNewLocation] = useState({ zone: '', total_slots: 5 });
  const [deliveryRates, setDeliveryRates] = useState([]);
  const [packagingTeam, setPackagingTeam] = useState([]);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // إضافة إشعار مؤقت
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // جلب المنتجات القادمة
  const fetchIncomingProducts = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse-manager/incoming-products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب المنتجات القادمة');
      const data = await res.json();
      setIncomingProducts(data.products || []);
    } catch (err) {
      addNotification('خطأ في جلب المنتجات القادمة', 'error');
    }
  };

  // جلب المنتجات المخزنة
  const fetchStoredProducts = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse-manager/stored-products', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب المنتجات المخزنة');
      const data = await res.json();
      setStoredProducts(data.products || []);
    } catch (err) {
      addNotification('خطأ في جلب المنتجات المخزنة', 'error');
    }
  };

  // جلب أماكن التخزين
  const fetchStorageLocations = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse-manager/storage-locations', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب أماكن التخزين');
      const data = await res.json();
      setStorageLocations(data.locations || []);
    } catch (err) {
      addNotification('خطأ في جلب أماكن التخزين', 'error');
    }
  };

  // جلب فريق التغليف
  const fetchPackagingTeam = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse-manager/packaging-team', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب فريق التغليف');
      const data = await res.json();
      setPackagingTeam(data.team || []);
    } catch (err) {
      addNotification('خطأ في جلب فريق التغليف', 'error');
    }
  };

  // جلب أسعار التوصيل
  const fetchDeliveryRates = async () => {
    if (!user?.token) return;
    try {
      const res = await fetch('http://localhost:5000/api/warehouse-manager/delivery-rates', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب أسعار التوصيل');
      const data = await res.json();
      setDeliveryRates(data.rates || []);
    } catch (err) {
      addNotification('خطأ في جلب أسعار التوصيل', 'error');
    }
  };

    useEffect(() => {
  if (user && user.team === 'warehouse') {
    // تحقق مما إذا كان مديرًا
    const checkManager = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/warehouse-manager/incoming-products', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (res.status === 403) {
          alert('ليس لديك صلاحية الوصول كمدير مستودع');
          // إعادة توجيه إلى صفحة المستودع العادية
          window.location.href = '/warehouse';
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkManager();
  }
}, [user]);

  // تحميل البيانات عند التغيير
  useEffect(() => {
    if (user?.token) {
      if (activeTab === 'incoming') fetchIncomingProducts();
      if (activeTab === 'stored') fetchStoredProducts();
      if (activeTab === 'locations') fetchStorageLocations();
      if (activeTab === 'team') fetchPackagingTeam();
      if (activeTab === 'delivery') fetchDeliveryRates();
    }
  }, [activeTab, user?.token, addNotification]);

  // إضافة منطقة تخزين جديدة
  const handleAddLocation = async (e) => {
    e.preventDefault();
    if (!user?.token || !newLocation.zone) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/warehouse-manager/storage-locations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLocation)
      });
      if (!res.ok) throw new Error('فشل إضافة المنطقة');
      addNotification('تمت إضافة منطقة التخزين بنجاح');
      setNewLocation({ zone: '', total_slots: 5 });
      fetchStorageLocations();
    } catch (err) {
      addNotification('خطأ في إضافة المنطقة', 'error');
    } finally {
      setLoading(false);
    }
  };

  // تحديث أسعار التوصيل
  const handleUpdateDeliveryRates = async () => {
    if (!user?.token) return;
    try {
      setLoading(true);
      const res = await fetch('http://localhost:5000/api/warehouse-manager/delivery-rates', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ rates: deliveryRates })
      });
      if (!res.ok) throw new Error('فشل تحديث الأسعار');
      addNotification('تم تحديث أسعار التوصيل بنجاح');
    } catch (err) {
      addNotification('خطأ في تحديث الأسعار', 'error');
    } finally {
      setLoading(false);
    }
  };

  // تحديث سعر توصيل لولاية
  const handleRateChange = (index, field, value) => {
    const updated = [...deliveryRates];
    updated[index][field] = parseFloat(value) || 0;
    setDeliveryRates(updated);
  };

  // إضافة ولاية جديدة
  const addNewWilaya = () => {
    const wilayas = [
      "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", 
      "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", 
      "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", 
      "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", 
      "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", 
      "عين تموشنت", "غرداية", "غليزان"
    ];
    const existingWilayas = deliveryRates.map(r => r.wilaya);
    const newWilaya = wilayas.find(w => !existingWilayas.includes(w));
    if (newWilaya) {
      setDeliveryRates([...deliveryRates, { wilaya: newWilaya, office_price: 300, home_price: 500 }]);
    } else {
      addNotification('لا توجد ولايات متبقية', 'error');
    }
  };

  return (
    <div className="warehouse-manager-page">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="warehouse-manager-content">
        <header className="manager-header">
          <h1>مدير المستودع</h1>
          <div className="user-info">
            {user?.name} {user?.last_name}
          </div>
        </header>

        {/* التبويبات */}
        <div className="tabs">
          <button className={activeTab === 'incoming' ? 'tab active' : 'tab'} onClick={() => setActiveTab('incoming')}>
            المنتجات القادمة
          </button>
          <button className={activeTab === 'stored' ? 'tab active' : 'tab'} onClick={() => setActiveTab('stored')}>
            المنتجات المخزنة
          </button>
          <button className={activeTab === 'locations' ? 'tab active' : 'tab'} onClick={() => setActiveTab('locations')}>
            أماكن التخزين
          </button>
          <button className={activeTab === 'delivery' ? 'tab active' : 'tab'} onClick={() => setActiveTab('delivery')}>
            أسعار التوصيل
          </button>
          <button className={activeTab === 'team' ? 'tab active' : 'tab'} onClick={() => setActiveTab('team')}>
            فريق التغليف
          </button>
        </div>

        {/* المحتوى حسب التبويب */}
        <main className="tab-content">
          {activeTab === 'incoming' && (
            <div className="products-section">
              <h2>المنتجات القادمة</h2>
              {incomingProducts.length === 0 ? (
                <p>لا توجد منتجات قادمة حاليًا.</p>
              ) : (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>اسم المنتج</th>
                      <th>الكمية</th>
                      <th>نوع المنتج</th>
                      <th>المتجر</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incomingProducts.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.quantity}</td>
                        <td>{p.type || 'غير محدد'}</td>
                        <td>{p.store_name}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'stored' && (
            <div className="products-section">
              <h2>المنتجات المخزنة</h2>
              {storedProducts.length === 0 ? (
                <p>لا توجد منتجات مخزنة حاليًا.</p>
              ) : (
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>اسم المنتج</th>
                      <th>الكمية</th>
                      <th>المتجر</th>
                      <th>أماكن التخزين</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storedProducts.map(p => (
                      <tr key={p.id}>
                        <td>{p.id}</td>
                        <td>{p.name}</td>
                        <td>{p.quantity}</td>
                        <td>{p.store_name}</td>
                        <td>{p.storage_locations || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'locations' && (
            <div className="locations-section">
              <h2>أماكن التخزين</h2>
              
              <div className="add-location-form">
                <h3>إضافة منطقة جديدة</h3>
                <form onSubmit={handleAddLocation}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>اسم المنطقة (مثل: A, B1)</label>
                      <input
                        type="text"
                        value={newLocation.zone}
                        onChange={(e) => setNewLocation({...newLocation, zone: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>عدد الأماكن</label>
                      <input
                        type="number"
                        min="1"
                        value={newLocation.total_slots}
                        onChange={(e) => setNewLocation({...newLocation, total_slots: parseInt(e.target.value) || 5})}
                        required
                      />
                    </div>
                  </div>
                  <button type="submit" className="add-btn" disabled={loading}>
                    {loading ? 'جارٍ الإضافة...' : 'إضافة المنطقة'}
                  </button>
                </form>
              </div>

              <div className="locations-list">
                <h3>المناطق الحالية</h3>
                {storageLocations.length === 0 ? (
                  <p>لا توجد مناطق تخزين مسجلة.</p>
                ) : (
                  <table className="locations-table">
                    <thead>
                      <tr>
                        <th>المنطقة</th>
                        <th>إجمالي الأماكن</th>
                        <th>الأماكن المتاحة</th>
                      </tr>
                    </thead>
                    <tbody>
                      {storageLocations.map(loc => (
                        <tr key={loc.id}>
                          <td>{loc.zone}</td>
                          <td>{loc.total_slots}</td>
                          <td>{loc.available_slots}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'delivery' && (
            <div className="delivery-section">
              <h2>أسعار التوصيل</h2>
              <div className="delivery-actions">
                <button className="add-btn" onClick={addNewWilaya} disabled={deliveryRates.length >= 48}>
                  إضافة ولاية
                </button>
                <button className="save-btn" onClick={handleUpdateDeliveryRates} disabled={loading}>
                  {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
                </button>
              </div>

              {deliveryRates.length === 0 ? (
                <p>لا توجد أسعار مسجلة. اضغط "إضافة ولاية".</p>
              ) : (
                <table className="delivery-table">
                  <thead>
                    <tr>
                      <th>الولاية</th>
                      <th>سعر التوصيل للمكتب (دج)</th>
                      <th>سعر التوصيل للمنزل (دج)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deliveryRates.map((rate, index) => (
                      <tr key={index}>
                        <td>{rate.wilaya}</td>
                        <td>
                          <input
                            type="number"
                            value={rate.office_price}
                            onChange={(e) => handleRateChange(index, 'office_price', e.target.value)}
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            value={rate.home_price}
                            onChange={(e) => handleRateChange(index, 'home_price', e.target.value)}
                            min="0"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {activeTab === 'team' && (
            <div className="team-section">
              <h2>فريق التغليف</h2>
              {packagingTeam.length === 0 ? (
                <p>لا يوجد أعضاء في فريق التغليف لهذا المستودع.</p>
              ) : (
                <table className="team-table">
                  <thead>
                    <tr>
                      <th>الاسم</th>
                      <th>الهاتف</th>
                      <th>البريد الإلكتروني</th>
                    </tr>
                  </thead>
                  <tbody>
                    {packagingTeam.map(emp => (
                      <tr key={emp.id}>
                        <td>{emp.name} {emp.last_name}</td>
                        <td>{emp.phone}</td>
                        <td>{emp.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default WarehouseManager;