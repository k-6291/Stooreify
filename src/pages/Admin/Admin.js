import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import LogoutButton from '../../components/LogoutButton';
import './Admin.css';

const Admin = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('المستودع');
  const [showAddZoneModal, setShowAddZoneModal] = useState(false);
  const [showEditZoneModal, setShowEditZoneModal] = useState(false);
  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [showEditEmployeeModal, setShowEditEmployeeModal] = useState(false);
  const [showAddWarehouseModal, setShowAddWarehouseModal] = useState(false);
  const [showEditWarehouseModal, setShowEditWarehouseModal] = useState(false);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [newPlaces, setNewPlaces] = useState('');
  const [editEmployeeData, setEditEmployeeData] = useState({});
  const [showSuccessMessage, setShowSuccessMessage] = useState('');

  // حالة لتخزين المستودعات
  const [warehouses, setWarehouses] = useState([]);
  // بيانات المستودع
  const [warehouseZones, setWarehouseZones] = useState([]);

  // بيانات الموظفين
  const [employees, setEmployees] = useState([]);

  // بيانات المديرين
  const [managers, setManagers] = useState([]);

  // بيانات النموذج الجديدة
  const [newZoneData, setNewZoneData] = useState({
    zone: '',
    totalSlots: '',
    warehouseId: '' // ← أضفنا هذا
  });

  const [newEmployeeData, setNewEmployeeData] = useState({
    firstName: '',
    lastName: '',
    nationalId: '',
    birthDate: '',
    phone: '',
    email: '',
    team: '',
    warehouseId: '',
    password: ''
  });

  const [newWarehouseData, setNewWarehouseData] = useState({
    name: '',
    wilaya: '',
    managerId: ''
  });

  const [editWarehouseData, setEditWarehouseData] = useState({});

  const teams = [
    'فريق المكتب',
    'فريق المستودع',
    'فريق التغليف',
    'فريق الدعم'
  ];

  const wilayas = [
    'أدرار', 'الشلف', 'الأغواط', 'أم البواقي', 'باتنة', 'بجاية', 'بسكرة', 'بشار', 'البليدة', 'البويرة',
    'تامنراست', 'تبسة', 'تلمسان', 'تيارت', 'تيزي وزو', 'الجزائر', 'الجلفة', 'جيجل', 'سطيف', 'سعيدة',
    'سكيكدة', 'سيدي بلعباس', 'عنابة', 'قالمة', 'قسنطينة', 'المدية', 'مستغانم', 'المسيلة', 'معسكر',
    'ورقلة', 'وهران', 'البيض', 'إليزي', 'برج بوعريريج', 'بومرداس', 'الطارف', 'تندوف', 'تيسمسيلت',
    'الوادي', 'خنشلة', 'سوق أهراس', 'تيبازة', 'ميلة', 'عين الدفلى', 'النعامة', 'عين تموشنت', 'غرداية',
    'غليزان', 'تيميمون', 'برج باجي مختار', 'أولاد جلال', 'بني عباس', 'عين صالح', 'عين قزام',
    'تقرت', 'جانت', 'المغير', 'المنيعة'
  ];

  // جلب مناطق التخزين من الخادم
  const fetchStorageZones = async () => {
    
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/storage-zones', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب مناطق التخزين');

      const data = await response.json();
      setWarehouseZones(data.zones || []);
    } catch (error) {
      console.error('خطأ في جلب مناطق التخزين:', error.message);
      alert('حدث خطأ أثناء جلب مناطق التخزين.');
    }
  };
  

  // جلب الموظفين من الخادم
  const fetchEmployees = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/employees', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب الموظفين');

      const data = await response.json();
      setEmployees(data.employees || []);
    } catch (error) {
      console.error('خطأ في جلب الموظفين:', error.message);
      alert('حدث خطأ أثناء جلب الموظفين.');
    }
  };

  // جلب المستودعات من الخادم
  const fetchWarehouses = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/warehouses', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب المستودعات');

      const data = await response.json();
      setWarehouses(data.warehouses || []);
    } catch (error) {
      console.error('خطأ في جلب المستودعات:', error.message);
      alert('حدث خطأ أثناء جلب المستودعات.');
    }
  };

  // جلب المديرين من الخادم
  const fetchManagers = async () => {
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/managers', {
        headers: { Authorization: `Bearer ${user.token}` }
      });

      if (!response.ok) throw new Error('فشل في جلب المديرين');

      const data = await response.json();
      setManagers(data.managers || []);
    } catch (error) {
      console.error('خطأ في جلب المديرين:', error.message);
      alert('حدث خطأ أثناء جلب المديرين.');
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchStorageZones();
      
      fetchEmployees();
      
      fetchWarehouses();
           
      fetchManagers();
          
    }
  }, [user, activeTab]);

  const handleAddZone = async (e) => {
  e.preventDefault();
  
  if (!user?.token) {
    alert('يجب تسجيل الدخول أولاً.');
    return;
  }

  if (newZoneData.zone && newZoneData.totalSlots && newZoneData.warehouseId) {
    try {
      const response = await fetch('http://localhost:5000/api/admin/add-zone', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        // ✅ نحول warehouseId إلى warehouse_id هنا
        body: JSON.stringify({
          zone: newZoneData.zone,
          totalSlots: newZoneData.totalSlots,
          warehouse_id: newZoneData.warehouseId
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setNewZoneData({ zone: '', totalSlots: '', warehouseId: '' });
      setShowAddZoneModal(false);
      setShowSuccessMessage(`تم إضافة المنطقة ${newZoneData.zone} بنجاح.`);
      setTimeout(() => {
        setShowSuccessMessage('');
        fetchStorageZones();
      }, 3000);
    } catch (error) {
      alert('خطأ في إضافة المنطقة: ' + error.message);
    }
  }
};

  const handleEditZone = (zone) => {
    setSelectedZone(zone);
    setNewPlaces('');
    setShowEditZoneModal(true);
  };

  const handleSaveZoneEdit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    if (newPlaces && parseInt(newPlaces) > 0) {
      try {
        const response = await fetch(`http://localhost:5000/api/admin/edit-zone/${selectedZone.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            additionalPlaces: parseInt(newPlaces)
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        setShowEditZoneModal(false);
        setShowSuccessMessage(`تم تعديل المنطقة ${selectedZone.zone} بنجاح.`);
        setTimeout(() => {
          setShowSuccessMessage('');
          fetchStorageZones();
        }, 3000);
      } catch (error) {
        alert('خطأ في تعديل المنطقة: ' + error.message);
      }
    }
  };

  const handleAddEmployee = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    // إذا كان الفريق "فريق التغليف" أو "فريق المستودع"، يجب اختيار مستودع
    if (['فريق التغليف', 'فريق المستودع'].includes(newEmployeeData.team) && !newEmployeeData.warehouseId) {
      alert('يجب اختيار مستودع للموظف.');
      return;
    }

    if (Object.values(newEmployeeData).every(field => field || (field === '' && !['warehouseId'].includes(field)))) {
      try {
        const response = await fetch('http://localhost:5000/api/admin/add-employee', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${user.token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(newEmployeeData)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        setNewEmployeeData({
          firstName: '',
          lastName: '',
          nationalId: '',
          birthDate: '',
          phone: '',
          email: '',
          team: '',
          warehouseId: '',
          password: ''
        });
        setShowAddEmployeeModal(false);
        setShowSuccessMessage(`تم إضافة الموظف ${newEmployeeData.firstName} ${newEmployeeData.lastName} بنجاح.`);
        setTimeout(() => {
          setShowSuccessMessage('');
          fetchEmployees();
        }, 3000);
      } catch (error) {
        alert('خطأ في إضافة الموظف: ' + error.message);
      }
    }
  };

  const handleAddWarehouse = async (e) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      const response = await fetch('http://localhost:5000/api/admin/warehouses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newWarehouseData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setNewWarehouseData({ name: '', wilaya: '', managerId: '' });
      setShowAddWarehouseModal(false);
      setShowSuccessMessage(`تم إضافة المستودع ${newWarehouseData.name} بنجاح.`);
      setTimeout(() => {
        setShowSuccessMessage('');
        fetchWarehouses();
      }, 3000);
    } catch (error) {
      alert('خطأ في إضافة المستودع: ' + error.message);
    }
  };

  const handleEditWarehouse = (warehouse) => {
    setSelectedWarehouse(warehouse);
    setEditWarehouseData({ ...warehouse });
    setShowEditWarehouseModal(true);
  };

  const handleSaveWarehouseEdit = async (e) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/admin/warehouses/${selectedWarehouse.id}/manager`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ managerId: editWarehouseData.manager_id || null })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setShowEditWarehouseModal(false);
      setShowSuccessMessage(`تم تعديل المدير للمستودع ${editWarehouseData.name} بنجاح.`);
      setTimeout(() => {
        setShowSuccessMessage('');
        fetchWarehouses();
      }, 3000);
    } catch (error) {
      alert('خطأ في تعديل المدير: ' + error.message);
    }
  };

  const handleShowEmployeeDetails = (employee) => {
    setSelectedEmployee(employee);
    setShowEmployeeDetailsModal(true);
  };

  const handleEditEmployee = (employee) => {
    setSelectedEmployee(employee);
    setEditEmployeeData({ ...employee });
    setShowEditEmployeeModal(true);
  };

  const handleSaveEmployeeEdit = async (e) => {
    e.preventDefault();
    
    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    if (['فريق التغليف', 'فريق المستودع'].includes(editEmployeeData.team) && !editEmployeeData.warehouseId) {
      alert('يجب اختيار مستودع للموظف.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/edit-employee/${selectedEmployee.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editEmployeeData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      setShowEditEmployeeModal(false);
      setShowSuccessMessage(`تم تعديل معلومات الموظف ${editEmployeeData.firstName} ${editEmployeeData.lastName} بنجاح.`);
      setTimeout(() => {
        setShowSuccessMessage('');
        fetchEmployees();
      }, 3000);
    } catch (error) {
      alert('خطأ في تعديل الموظف: ' + error.message);
    }
  };

  return (
    <div className="admin-page">
      {/* الهيدر العلوي */}
      <header className="admin-header">
        <div className="logo">Stooreify</div>
        <div className="user-info">
          الأدمن
          <LogoutButton />
        </div>
      </header>

      {/* القائمة الجانبية */}
      <aside className="admin-sidebar">
        <nav className="sidebar-nav">
          <ul>
            <li>
              <button className={`nav-item ${activeTab === 'المستودعات' ? 'active' : ''}`} onClick={() => setActiveTab('المستودعات')}>
                المستودعات
              </button>
            </li>
            <li>
              <button className={`nav-item ${activeTab === 'المستودع' ? 'active' : ''}`} onClick={() => setActiveTab('المستودع')}>
                مناطق التخزين
              </button>
            </li>
            <li>
              <button className={`nav-item ${activeTab === 'الموظفين' ? 'active' : ''}`} onClick={() => setActiveTab('الموظفين')}>
                الموظفين
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* المحتوى الرئيسي */}
      <main className="admin-main-content">
        {activeTab === 'المستودعات' && (
          <div className="warehouses-section">
            <div className="section-header">
              <h2>المستودعات</h2>
              <button className="add-btn" onClick={() => setShowAddWarehouseModal(true)}>
                إضافة مستودع جديد
              </button>
            </div>
            
            <div className="warehouse-table-container">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>اسم المستودع</th>
                    <th>الولاية</th>
                    <th>الحالة</th>
                    <th>المدير</th>
                    <th>تعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouses.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد مستودعات حاليًا.
                      </td>
                    </tr>
                  ) : (
                    warehouses.map((wh) => (
                      <tr key={wh.id}>
                        <td>{wh.name}</td>
                        <td>{wh.wilaya}</td>
                        <td>{wh.status === 'active' ? 'نشط' : 'معطل'}</td>
                        <td>{wh.manager_id ? `${managers.find(m => m.id === wh.manager_id)?.name} ${managers.find(m => m.id === wh.manager_id)?.lastName}` : 'لا يوجد'}</td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditWarehouse(wh)}
                          >
                            تعديل
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

        {activeTab === 'المستودع' && (
          <div className="warehouse-section">
            <div className="section-header">
              <h2>منطقة التخزين</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddZoneModal(true)}
              >
                إضافة منطقة جديدة
              </button>
            </div>
            
            <div className="warehouse-table-container">
              <table className="warehouse-table">
                <thead>
                  <tr>
                    <th>اسم المنطقة</th>
                    <th>المستودع</th>
                    <th>عدد الأماكن الإجمالي</th>
                    <th>الأماكن المتاحة</th>
                    <th>تعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {warehouseZones.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد مناطق تخزين حاليًا.
                      </td>
                    </tr>
                  ) : (
                    warehouseZones.map((zone) => (
                      <tr key={zone.id}>
                        <td>{zone.zone}</td>
                        <td>{warehouses.find(w => w.id === zone.warehouse_id)?.name || 'غير محدد'}</td>
                        <td>{zone.totalSlots}</td>
                        <td>{zone.availableSlots}</td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditZone(zone)}
                          >
                            تعديل
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

        {activeTab === 'الموظفين' && (
          <div className="employees-section">
            <div className="section-header">
              <h2>الموظفين</h2>
              <button 
                className="add-btn"
                onClick={() => setShowAddEmployeeModal(true)}
              >
                إضافة موظف جديد
              </button>
            </div>
            
            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>ID الموظف</th>
                    <th>الفريق</th>
                    <th>الاسم</th>
                    <th>رقم الهاتف</th>
                    <th>المستودع</th>
                    <th>مزيد من المعلومات</th>
                    <th>تعديل</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: 'center', padding: '20px' }}>
                        لا توجد موظفين حاليًا.
                      </td>
                    </tr>
                  ) : (
                    employees.map((employee) => (
                      <tr key={employee.id}>
                        <td>{employee.id}</td>
                        <td>{employee.team}</td>
                        <td>{employee.name} {employee.lastName}</td>
                        <td>{employee.phone}</td>
                        <td>{warehouses.find(w => w.id === employee.warehouse_id)?.name || 'لا يوجد'}</td>
                        <td>
                          <button 
                            className="details-btn"
                            onClick={() => handleShowEmployeeDetails(employee)}
                          >
                            تفاصيل
                          </button>
                        </td>
                        <td>
                          <button 
                            className="edit-btn"
                            onClick={() => handleEditEmployee(employee)}
                          >
                            تعديل
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

      {/* نموذج إضافة مستودع جديد */}
      {showAddWarehouseModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>إضافة مستودع جديد</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddWarehouseModal(false)}
              >
                ×
              </button>
            </div>
            <form className="add-warehouse-form" onSubmit={handleAddWarehouse}>
              <div className="form-group">
                <label>اسم المستودع:</label>
                <input 
                  type="text" 
                  value={newWarehouseData.name}
                  onChange={(e) => setNewWarehouseData({...newWarehouseData, name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>الولاية:</label>
                <select 
                  value={newWarehouseData.wilaya}
                  onChange={(e) => setNewWarehouseData({...newWarehouseData, wilaya: e.target.value})}
                  required
                >
                  <option value="">اختر الولاية</option>
                  {wilayas.map(wilaya => (
                    <option key={wilaya} value={wilaya}>
                      {wilaya}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>مدير المستودع (اختياري):</label>
                <select 
                  value={newWarehouseData.managerId}
                  onChange={(e) => setNewWarehouseData({...newWarehouseData, managerId: e.target.value})}
                >
                  <option value="">لا يوجد مدير</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddWarehouseModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج تعديل مستودع */}
      {showEditWarehouseModal && selectedWarehouse && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تعديل مستودع {selectedWarehouse.name}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditWarehouseModal(false)}
              >
                ×
              </button>
            </div>
            <form className="edit-warehouse-form" onSubmit={handleSaveWarehouseEdit}>
              <div className="form-group">
                <label>اسم المستودع:</label>
                <input 
                  type="text" 
                  value={editWarehouseData.name || ''}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label>الولاية:</label>
                <input 
                  type="text" 
                  value={editWarehouseData.wilaya || ''}
                  readOnly
                  disabled
                />
              </div>

              <div className="form-group">
                <label>مدير المستودع:</label>
                <select 
                  value={editWarehouseData.manager_id || ''}
                  onChange={(e) => setEditWarehouseData({...editWarehouseData, manager_id: e.target.value})}
                >
                  <option value="">لا يوجد مدير</option>
                  {managers.map(manager => (
                    <option key={manager.id} value={manager.id}>
                      {manager.name} {manager.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditWarehouseModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج إضافة منطقة جديدة */}
      {showAddZoneModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>إضافة منطقة جديدة</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddZoneModal(false)}
              >
                ×
              </button>
            </div>
            <form className="add-zone-form" onSubmit={handleAddZone}>
              <div className="form-group">
                <label>اسم المنطقة:</label>
                <input 
                  type="text" 
                  value={newZoneData.zone}
                  onChange={(e) => setNewZoneData({...newZoneData, zone: e.target.value})}
                  placeholder="حرف أو حرفين"
                  maxLength="2"
                  required 
                />
              </div>

              <div className="form-group">
                <label>عدد الأماكن:</label>
                <input 
                  type="number" 
                  min="1"
                  value={newZoneData.totalSlots}
                  onChange={(e) => setNewZoneData({...newZoneData, totalSlots: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>المستودع:</label>
                <select 
                  value={newZoneData.warehouseId}
                  onChange={(e) => setNewZoneData({...newZoneData, warehouseId: e.target.value})}
                  required
                >
                  <option value="">اختر مستودع</option>
                  {warehouses.map(wh => (
                    <option key={wh.id} value={wh.id}>
                      {wh.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddZoneModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج تعديل منطقة */}
      {showEditZoneModal && selectedZone && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تعديل منطقة {selectedZone.zone}</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditZoneModal(false)}
              >
                ×
              </button>
            </div>
            <form className="edit-zone-form" onSubmit={handleSaveZoneEdit}>
              <div className="form-group">
                <label>إضافة أماكن جديدة:</label>
                <input 
                  type="number" 
                  min="1"
                  value={newPlaces}
                  onChange={(e) => setNewPlaces(e.target.value)}
                  placeholder="عدد الأماكن الإضافية"
                  required 
                />
              </div>

              <div className="info-text">
                ملاحظة: لا يمكن حذف الأماكن، فقط إضافة أماكن جديدة.
              </div>

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditZoneModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  حفظ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج إضافة موظف جديد */}
      {showAddEmployeeModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>إضافة موظف جديد</h3>
              <button 
                className="close-btn"
                onClick={() => setShowAddEmployeeModal(false)}
              >
                ×
              </button>
            </div>
            <form className="add-employee-form" onSubmit={handleAddEmployee}>
              <div className="form-group">
                <label>الاسم:</label>
                <input 
                  type="text" 
                  value={newEmployeeData.firstName}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, firstName: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>اللقب:</label>
                <input 
                  type="text" 
                  value={newEmployeeData.lastName}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, lastName: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>رقم التعريف الوطني:</label>
                <input 
                  type="text" 
                  value={newEmployeeData.nationalId}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, nationalId: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>تاريخ الميلاد:</label>
                <input 
                  type="date" 
                  value={newEmployeeData.birthDate}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, birthDate: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف:</label>
                <input 
                  type="tel" 
                  value={newEmployeeData.phone}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, phone: e.target.value})}
                  placeholder="05XXXXXXXX"
                  required 
                />
              </div>

              <div className="form-group">
                <label>الإيميل:</label>
                <input 
                  type="email" 
                  value={newEmployeeData.email}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, email: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>كلمة السر:</label>
                <input 
                  type="password" 
                  value={newEmployeeData.password}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, password: e.target.value})}
                  placeholder="أدخل كلمة السر (6 أحرف على الأقل)"
                  required 
                />
              </div>

              <div className="form-group">
                <label>الفريق:</label>
                <select 
                  value={newEmployeeData.team}
                  onChange={(e) => setNewEmployeeData({...newEmployeeData, team: e.target.value})}
                  required
                >
                  <option value="">اختر الفريق</option>
                  {teams.map(team => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* عرض خانة اختيار المستودع إذا كان الفريق متعلقًا بالمستودع أو التغليف */}
              {['فريق التغليف', 'فريق المستودع'].includes(newEmployeeData.team) && (
                <div className="form-group">
                  <label>المستودع:</label>
                  <select 
                    value={newEmployeeData.warehouseId}
                    onChange={(e) => setNewEmployeeData({...newEmployeeData, warehouseId: e.target.value})}
                    required
                  >
                    <option value="">اختر مستودع</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowAddEmployeeModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  إضافة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نموذج تفاصيل الموظف */}
      {showEmployeeDetailsModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal details-modal">
            <div className="modal-header">
              <h3>تفاصيل الموظف</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEmployeeDetailsModal(false)}
              >
                ×
              </button>
            </div>
            <div className="employee-details">
              <div className="detail-row">
                <span className="detail-label">ID الموظف:</span>
                <span className="detail-value">{selectedEmployee.id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">الاسم:</span>
                <span className="detail-value">{selectedEmployee.name} {selectedEmployee.lastName}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">رقم التعريف الوطني:</span>
                <span className="detail-value">{selectedEmployee.national_id}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">تاريخ الميلاد:</span>
                <span className="detail-value">{selectedEmployee.birth_date}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">رقم الهاتف:</span>
                <span className="detail-value">{selectedEmployee.phone}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">الإيميل:</span>
                <span className="detail-value">{selectedEmployee.email}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">الفريق:</span>
                <span className="detail-value">{selectedEmployee.team}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">المستودع:</span>
                <span className="detail-value">{warehouses.find(w => w.id === selectedEmployee.warehouse_id)?.name || 'لا يوجد'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نموذج تعديل موظف */}
      {showEditEmployeeModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>تعديل معلومات الموظف</h3>
              <button 
                className="close-btn"
                onClick={() => setShowEditEmployeeModal(false)}
              >
                ×
              </button>
            </div>
            <form className="edit-employee-form" onSubmit={handleSaveEmployeeEdit}>
              <div className="form-group">
                <label>الاسم:</label>
                <input 
                  type="text" 
                  value={editEmployeeData.name || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, name: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>اللقب:</label>
                <input 
                  type="text" 
                  value={editEmployeeData.lastName || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, lastName: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>رقم التعريف الوطني:</label>
                <input 
                  type="text" 
                  value={editEmployeeData.national_id || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, national_id: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>تاريخ الميلاد:</label>
                <input 
                  type="date" 
                  value={editEmployeeData.birth_date || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, birth_date: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>رقم الهاتف:</label>
                <input 
                  type="tel" 
                  value={editEmployeeData.phone || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, phone: e.target.value})}
                  placeholder="05XXXXXXXX"
                  required 
                />
              </div>

              <div className="form-group">
                <label>الإيميل:</label>
                <input 
                  type="email" 
                  value={editEmployeeData.email || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, email: e.target.value})}
                  required 
                />
              </div>

              <div className="form-group">
                <label>الفريق:</label>
                <select 
                  value={editEmployeeData.team || ''}
                  onChange={(e) => setEditEmployeeData({...editEmployeeData, team: e.target.value})}
                  required
                >
                  <option value="">اختر الفريق</option>
                  {teams.map(team => (
                    <option key={team} value={team}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>

              {/* عرض خانة اختيار المستودع إذا كان الفريق متعلقًا بالمستودع أو التغليف */}
              {['فريق التغليف', 'فريق المستودع'].includes(editEmployeeData.team) && (
                <div className="form-group">
                  <label>المستودع:</label>
                  <select 
                    value={editEmployeeData.warehouse_id || ''}
                    onChange={(e) => setEditEmployeeData({...editEmployeeData, warehouse_id: e.target.value})}
                    required
                  >
                    <option value="">اختر مستودع</option>
                    {warehouses.map(wh => (
                      <option key={wh.id} value={wh.id}>
                        {wh.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  type="button" 
                  className="cancel-btn"
                  onClick={() => setShowEditEmployeeModal(false)}
                >
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">
                  حفظ
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

export default Admin;