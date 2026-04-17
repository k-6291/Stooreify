import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState({
    store_name: '',
    store_type: 'other',
    support_phone: '',
    support_email: '',
    auto_confirm_via_stooreify: false,
    store_logo: null
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // جلب بيانات الملف الشخصي عند التحميل
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/profile', {
          headers: { Authorization: `Bearer ${user?.token}` }
        });
        if (!res.ok) throw new Error('فشل جلب البيانات');
        const data = await res.json();
        setProfile(data.profile);
        if (data.profile.store_logo) {
          setLogoPreview(`http://localhost:5000${data.profile.store_logo}`);
        }
      } catch (err) {
        addNotification('خطأ في جلب الملف الشخصي', 'error');
      }
    };

    if (user?.token) fetchProfile();
  }, [user?.token, addNotification]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile(prev => ({ ...prev, store_logo: file }));
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.token) return;

    try {
      setLoading(true);
      const formData = new FormData();
      
      // إضافة الحقول النصية
      formData.append('store_name', profile.store_name || '');
      formData.append('store_type', profile.store_type);
      formData.append('support_phone', profile.support_phone || '');
      formData.append('support_email', profile.support_email || '');
      formData.append('auto_confirm_via_stooreify', profile.auto_confirm_via_stooreify);

      // إضافة الصورة إن وُجدت
      if (profile.store_logo instanceof File) {
        formData.append('store_logo', profile.store_logo);
      }

      const res = await fetch('http://localhost:5000/api/profile', {
        method: 'PUT',
        headers: { Authorization: `Bearer ${user.token}` },
        body: formData
      });

      if (!res.ok) throw new Error('فشل التحديث');
      
      addNotification('تم تحديث الملف الشخصي بنجاح');
      
      // تحديث بيانات المستخدم في السياق (AuthContext)
      const updatedUser = { ...user, ...profile };
      if (profile.store_logo instanceof File) {
        updatedUser.store_logo = logoPreview;
      }
      setUser(updatedUser);
    } catch (err) {
      addNotification('خطأ في التحديث', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="profile-content">
        <h2>الملف الشخصي</h2>

        <form className="profile-form" onSubmit={handleSubmit}>
          {/* شعار المتجر */}
          <div className="logo-section">
            <label>شعار المتجر</label>
            <div className="logo-preview">
              {logoPreview ? (
                <img src={logoPreview} alt="شعار المتجر" />
              ) : (
                <div className="logo-placeholder">لا يوجد شعار</div>
              )}
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoChange}
            />
          </div>

          {/* اسم المتجر */}
          <div className="form-group">
            <label>اسم المتجر</label>
            <input
              type="text"
              name="store_name"
              value={profile.store_name || ''}
              onChange={handleInputChange}
              required
            />
          </div>

          {/* نوع المتجر */}
          <div className="form-group">
            <label>نوع المتجر</label>
            <select
              name="store_type"
              value={profile.store_type}
              onChange={handleInputChange}
            >
              <option value="electronics">إلكترونيات</option>
              <option value="clothing">ملابس</option>
              <option value="cosmetics">تجميل</option>
              <option value="other">أخرى</option>
            </select>
          </div>

          {/* رقم دعم المتجر */}
          <div className="form-group">
            <label>رقم دعم المتجر</label>
            <input
              type="tel"
              name="support_phone"
              value={profile.support_phone || ''}
              onChange={handleInputChange}
              placeholder="05XXXXXXXX"
            />
          </div>

          {/* بريد دعم المتجر */}
          <div className="form-group">
            <label>بريد دعم المتجر</label>
            <input
              type="email"
              name="support_email"
              value={profile.support_email || ''}
              onChange={handleInputChange}
              placeholder="support@yourstore.com"
            />
          </div>

          {/* تفعيل التأكيد التلقائي */}
          <div className="form-group toggle-group">
            <label>
              <input
                type="checkbox"
                name="auto_confirm_via_stooreify"
                checked={profile.auto_confirm_via_stooreify}
                onChange={handleInputChange}
              />
              تفعيل التأكيد التلقائي عبر Stooreify
            </label>
            <p className="toggle-description">
              عند التفعيل، سيتم إرسال جميع الطلبات الجديدة تلقائيًا لفريق التأكيد دون تدخل يدوي.
            </p>
          </div>

          <button
            type="submit"
            className="save-btn"
            disabled={loading}
          >
            {loading ? 'جارٍ الحفظ...' : 'حفظ التغييرات'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;