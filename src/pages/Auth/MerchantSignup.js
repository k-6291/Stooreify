import React, { useState } from 'react';
import './MerchantSignup.css';

const MerchantSignup = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    storeName: '',
    wilaya: '',
    subscriptionType: 'basic',
    privacy: false,
    terms: false
  });
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const wilayas = [
    "اختر ولاية", "أدرار", "الشلف", "الأغواط", "أم البواقي", "باتنة", "بجاية", "بسكرة", "بشار", "البليدة", 
    "البويرة", "تمنراست", "تبسة", "تلمسان", "تيارت", "تيزي وزو", "الجزائر", "الجلفة", "جيجل", "سطيف", 
    "سعيدة", "سكيكدة", "سيدي بلعباس", "عنابة", "قالمة", "قسنطينة", "المدية", "مستغانم", "المسيلة", 
    "معسكر", "ورقلة", "وهران", "البيض", "إليزي", "برج بوعريريج", "بومرداس", "الطارف", "تندوف", 
    "تيسمسيلت", "الوادي", "خنشلة", "سوق أهراس", "تيبازة", "ميلة", "عين الدفلى", "النعامة", 
    "عين تموشنت", "غرداية", "غليزان", "تيميمون", "برج باجي مختار", "أولاد جلال", "بني عباس", 
    "عين صالح", "عين قزام", "تقرت", "جانت", "المغير", "المنيعة"
  ];

const subscriptionTypes = ['basic', 'pro', 'premium'];

  const validateStep1 = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'الاسم مطلوب';
    }
    
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'اللقب مطلوب';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'رقم الهاتف مطلوب';
    } else if (!/^0[567]\d{8}$/.test(formData.phone)) {
      newErrors.phone = 'رقم الهاتف يجب أن يبدأ بـ 05، 06، أو 07 وطوله 10 أرقام';
    }
    
    if (!formData.email) {
      newErrors.email = 'الإيميل مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'صيغة الإيميل غير صحيحة';
    }
    
    if (!formData.password) {
      newErrors.password = 'كلمة السر مطلوبة';
    } else if (formData.password.length < 6) {
      newErrors.password = 'كلمة السر يجب أن تكون 6 أحرف على الأقل';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'تأكيد كلمة السر مطلوب';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمتا السر غير متطابقتين';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors = {};
    
    if (!formData.storeName.trim()) {
      newErrors.storeName = 'اسم المتجر مطلوب';
    }
    
    if (!formData.wilaya || formData.wilaya === 'اختر ولاية') {
      newErrors.wilaya = 'الرجاء اختيار الولاية';
    }
    
    if (!formData.privacy) {
      newErrors.privacy = 'يجب الموافقة على سياسة الخصوصية';
    }

    if (!formData.terms) {
      newErrors.terms = 'يجب الموافقة على شروط الاستخدام';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
    
    // مسح الخطأ عند الكتابة
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const handleNext = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handlePrevious = () => {
    setStep(1);
  };

  const handleSubmit = () => {
    if (validateStep2()) {
      // ✅ إرسال البيانات إلى الخادم عبر API
      fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          lastName: formData.lastName,
          phone: formData.phone,
          email: formData.email,
          password: formData.password,
          storeName: formData.storeName,
          wilaya: formData.wilaya,
          subscriptionType: formData.subscriptionType
        })
      })
      .then(res => res.json())
      .then(data => {
        setIsSubmitted(true); // عرض رسالة النجاح
      })
      .catch(err => {
        console.error('خطأ في التسجيل:', err);
        // يمكنك هنا عرض رسالة خطأ للمستخدم إن أردت
      });
    }
  };

  if (isSubmitted) {
    return (
      <div className="signup-success">
        <div className="success-message">
          تم إرسال طلبك! سيتواصل معك فريق الدعم خلال 24 ساعة لتفعيل حسابك.
        </div>
      </div>
    );
  }

  return (
    <div className="merchant-signup">
      <div className="signup-container">
        <div className="signup-header">
          <h2>إنشاء حساب تاجر</h2>
          <div className="progress-indicator">
            <div className={`step ${step >= 1 ? 'active' : ''}`}>1</div>
            <div className="divider"></div>
            <div className={`step ${step >= 2 ? 'active' : ''}`}>2</div>
          </div>
        </div>

        {step === 1 && (
          <div className="signup-form">
            <div className="form-group">
              <input
                type="text"
                name="name"
                placeholder="أدخل اسمك"
                value={formData.name}
                onChange={handleInputChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <div className="error-message">{errors.name}</div>}
            </div>

            <div className="form-group">
              <input
                type="text"
                name="lastName"
                placeholder="أدخل لقبك"
                value={formData.lastName}
                onChange={handleInputChange}
                className={errors.lastName ? 'error' : ''}
              />
              {errors.lastName && <div className="error-message">{errors.lastName}</div>}
            </div>

            <div className="form-group">
              <input
                type="tel"
                name="phone"
                placeholder="05XXXXXXXX"
                value={formData.phone}
                onChange={handleInputChange}
                className={errors.phone ? 'error' : ''}
              />
              {errors.phone && <div className="error-message">{errors.phone}</div>}
            </div>

            <div className="form-group">
              <input
                type="email"
                name="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <div className="error-message">{errors.email}</div>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="password"
                placeholder="أدخل كلمة السر — 6 أحرف على الأقل"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <div className="error-message">{errors.password}</div>}
            </div>

            <div className="form-group">
              <input
                type="password"
                name="confirmPassword"
                placeholder="أعد إدخال كلمة السر"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && <div className="error-message">{errors.confirmPassword}</div>}
            </div>

            <button className="next-button" onClick={handleNext}>
              التالي
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="signup-form">
            <div className="form-group">
              <input
                type="text"
                name="storeName"
                placeholder="اسم متجرك"
                value={formData.storeName}
                onChange={handleInputChange}
                className={errors.storeName ? 'error' : ''}
              />
              {errors.storeName && <div className="error-message">{errors.storeName}</div>}
            </div>

            <div className="form-group">
              <select
                name="wilaya"
                value={formData.wilaya}
                onChange={handleInputChange}
                className={errors.wilaya ? 'error' : ''}
              >
                {wilayas.map((wilaya, index) => (
                  <option key={index} value={wilaya === 'اختر ولاية' ? '' : wilaya}>
                    {wilaya}
                  </option>
                ))}
              </select>
              {errors.wilaya && <div className="error-message">{errors.wilaya}</div>}
            </div>

            <div className="form-group">
              <div className="radio-group">
                <label>نوع الاشتراك:</label>
                {subscriptionTypes.map((type) => {
  const labels = {
    basic: 'أساسي',
    pro: 'برو',
    premium: 'خاص'
  };
  return (
    <label key={type} className="radio-label">
      <input
        type="radio"
        name="subscriptionType"
        value={type}
        checked={formData.subscriptionType === type}
        onChange={handleInputChange}
      />
      {labels[type]} {/* ← هنا نعرض النص العربي */}
    </label>
  );
})}
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="privacy"
                  checked={formData.privacy}
                  onChange={handleInputChange}
                />
                أوافق على سياسة الخصوصية
              </label>
              {errors.privacy && <div className="error-message">{errors.privacy}</div>}
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="terms"
                  checked={formData.terms}
                  onChange={handleInputChange}
                />
                أوافق على شروط الاستخدام
              </label>
              {errors.terms && <div className="error-message">{errors.terms}</div>}
            </div>

            <div className="form-buttons">
              <button className="prev-button" onClick={handlePrevious}>
                السابق
              </button>
              <button 
                className="submit-button" 
                onClick={handleSubmit}
                disabled={!formData.privacy || !formData.terms}
              >
                إتمام الإنشاء
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MerchantSignup;