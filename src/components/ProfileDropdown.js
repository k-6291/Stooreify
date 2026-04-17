// components/ProfileDropdown.js
import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProfileDropdown.css';

const ProfileDropdown = () => {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // حالة البيانات للتعديل
  const [editData, setEditData] = useState({
    store_name: '',
    store_type: 'other',
    support_phone: '',
    support_email: '',
    auto_confirm_via_stooreify: false
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // تحميل البيانات عند الفتح
  useEffect(() => {
    if (isOpen && user) {
      // تحويل القيم بشكل صحيح
      const autoConfirm = user.auto_confirm_via_stooreify === '1' || 
        user.auto_confirm_via_stooreify === 1 || 
       user.auto_confirm_via_stooreify === true;
      
      setEditData({
        store_name: user.store_name || '',
        store_type: user.store_type || 'other',
        support_phone: user.support_phone || '',
        support_email: user.support_email || '',
        auto_confirm_via_stooreify: autoConfirm
      });
      
       // ✅ التحقق من وجود مسار الصورة
    if (user.store_logo && typeof user.store_logo === 'string') {
      setLogoPreview(`http://localhost:5000/uploads/logos/${user.store_logo}`);
    } else {
      setLogoPreview(null);
    }
    }
  }, [isOpen, user]);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    localStorage.removeItem('darkMode');
    navigate('/login');
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing) {
      // إعادة تحميل القيم عند بدء التعديل
      const autoConfirm = user.auto_confirm_via_stooreify === '1' || 
                         user.auto_confirm_via_stooreify === 1 || 
                         user.auto_confirm_via_stooreify === true;
      
      setEditData({
        store_name: user.store_name || '',
        store_type: user.store_type || 'other',
        support_phone: user.support_phone || '',
        support_email: user.support_email || '',
        auto_confirm_via_stooreify: autoConfirm
      });
      
      if (user.store_logo) {
        setLogoPreview(`http://localhost:5000${user.store_logo}`);
      } else {
        setLogoPreview(null);
      }
      setLogoFile(null);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // معالجة سحب الملفات
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files[0]) {
      handleFiles(files[0]);
    }
  };

  const handleFiles = (file) => {
    if (file && file.type.startsWith('image/')) {
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFiles(file);
    }
  };

 const handleSave = async () => {
  if (!user?.token) return;
  
  setIsSaving(true);
  try {
    const formData = new FormData();
    
    // إرسال الحقول المعدّلة فقط
    if (editData.store_name !== (user.store_name || '')) {
      formData.append('store_name', editData.store_name);
    }
    if (editData.store_type !== (user.store_type || 'other')) {
      formData.append('store_type', editData.store_type);
    }
    if (editData.support_phone !== (user.support_phone || '')) {
      formData.append('support_phone', editData.support_phone);
    }
    if (editData.support_email !== (user.support_email || '')) {
      formData.append('support_email', editData.support_email);
    }
    
    // معالجة التأكيد التلقائي
    const currentAutoConfirm = user.auto_confirm_via_stooreify === '1' || 
                              user.auto_confirm_via_stooreify === 1 || 
                              user.auto_confirm_via_stooreify === true;
    if (editData.auto_confirm_via_stooreify !== currentAutoConfirm) {
      formData.append('auto_confirm_via_stooreify', editData.auto_confirm_via_stooreify);
    }
    
    if (logoFile) {
      formData.append('store_logo', logoFile);
    }

    if (formData.entries().next().done) {
      setIsEditing(false);
      return;
    }

    const res = await fetch('http://localhost:5000/api/profile', {
      method: 'PUT',
      headers: { Authorization: `Bearer ${user.token}` },
      body: formData
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || 'فشل الحفظ');
    }
    
    // تحديث السياق
    const updatedUser = { ...user, ...editData };
    if (logoFile) {
      updatedUser.store_logo = logoPreview;
    }
    
    if (typeof setUser === 'function') {
      setUser(updatedUser);
      
      // إعادة تحميل بيانات الملف الشخصي
      try {
        const profileRes = await fetch('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          setUser({
            token: user.token,
            ...profileData.profile
          });
        }
      } catch (profileError) {
        console.error('فشل إعادة تحميل الملف الشخصي:', profileError);
      }
    }
    
    setIsEditing(false);
  } catch (error) {
    console.error('خطأ في الحفظ:', error);
    alert('فشل في حفظ التغييرات: ' + error.message);
  } finally {
    setIsSaving(false);
  }
};

  // تحويل نوع المتجر إلى نص عربي للعرض
  const getStoreTypeText = (type) => {
    const types = {
      electronics: 'إلكترونيات',
      clothing: 'ملابس',
      cosmetics: 'تجميل',
      other: 'أخرى'
    };
    return types[type] || 'غير محدد';
  };

  // قائمة أنواع المتاجر للعرض
  const storeTypes = [
    { value: 'electronics', label: 'إلكترونيات' },
    { value: 'clothing', label: 'ملابس' },
    { value: 'cosmetics', label: 'تجميل' },
    { value: 'other', label: 'أخرى' }
  ];

  return (
    <div className="profile-dropdown">
      <button 
        className="profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="قائمة المتجر"
      >
        <div className="profile-avatar">
          {logoPreview ? (
            <img src={logoPreview} alt="شعار المتجر" />
          ) : (
            <span className="avatar-placeholder">🏪</span>
          )}
        </div>
        <span className="profile-name">
          {user?.store_name || 'متجرك'}
        </span>
      </button>

      {isOpen && (
        <div className="dropdown-menu">
          {/* عرض المعلومات */}
          {!isEditing && (
            <div className="profile-info">
              <div className="info-item">
                <span className="info-label">اسم المتجر:</span>
                <span className="info-value">{user?.store_name || '—'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">نوع المتجر:</span>
                <span className="info-value">{getStoreTypeText(user?.store_type)}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">رقم الدعم:</span>
                <span className="info-value">{user?.support_phone || '—'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">بريد الدعم:</span>
                <span className="info-value">{user?.support_email || '—'}</span>
              </div>
              
              <div className="info-item">
                <span className="info-label">التأكيد التلقائي:</span>
                <span className={`status-badge ${user?.auto_confirm_via_stooreify === '1' || user?.auto_confirm_via_stooreify === 1 ? 'active' : 'inactive'}`}>
                  {(user?.auto_confirm_via_stooreify === '1' || user?.auto_confirm_via_stooreify === 1) ? 'مفعل' : 'معطل'}
                </span>
              </div>
            </div>
          )}

          {/* زر التعديل */}
          {!isEditing && (
            <button className="edit-btn" onClick={handleEditToggle}>
              ✏️ تعديل المعلومات
            </button>
          )}

          {/* نموذج التعديل */}
          {isEditing && (
            <div className="edit-form">
              <div className="form-group">
                <input
                  type="text"
                  name="store_name"
                  placeholder="اسم المتجر"
                  value={editData.store_name}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <select
                  name="store_type"
                  value={editData.store_type}
                  onChange={handleInputChange}
                >
                  {storeTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <input
                  type="tel"
                  name="support_phone"
                  placeholder="رقم دعم المتجر"
                  value={editData.support_phone}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <input
                  type="email"
                  name="support_email"
                  placeholder="بريد دعم المتجر"
                  value={editData.support_email}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group toggle-group">
                <label>
                  <input
                    type="checkbox"
                    name="auto_confirm_via_stooreify"
                    checked={editData.auto_confirm_via_stooreify}
                    onChange={handleInputChange}
                  />
                  تفعيل التأكيد التلقائي
                </label>
              </div>
              
              <div className="form-group">
                <label className="logo-label">شعار المتجر</label>
                <div
                  className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoChange}
                    hidden
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="dropzone-label">
                    {logoPreview ? (
                      <div className="dropzone-preview">
                        <img src={logoPreview} alt="معاينة الشعار" />
                      </div>
                    ) : (
                      <>
                        <div className="dropzone-icon">📁</div>
                        <p>اسحب الصورة هنا أو اضغط لاختيارها</p>
                      </>
                    )}
                  </label>
                </div>
              </div>
              
              <div className="form-actions">
                <button className="cancel-btn" onClick={() => setIsEditing(false)}>
                  إلغاء
                </button>
                <button className="save-btn" onClick={handleSave} disabled={isSaving}>
                  {isSaving ? 'جارٍ الحفظ...' : 'حفظ'}
                </button>
              </div>
            </div>
          )}

          {/* زر تسجيل الخروج */}
          <button className="logout-button" onClick={handleLogout}>
            <span className="logout-icon">🚪</span>
            تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;