// src/pages/Merchant/Inventory.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Inventory.css';

const Inventory = () => {
  const { user } = useAuth();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [pickupInfo, setPickupInfo] = useState(null);
  const [products, setProducts] = useState([]);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const productTypesArToEn = {
    'إلكترونيات': 'electronics',
    'قابل للكسر': 'fragile',
    'مواد تجميل': 'cosmetics',
    'ملابس': 'clothing',
    'أحذية': 'shoes',
    'حقائب': 'bags',
    'أكسسوارات': 'accessories',
    'كتب': 'books',
    'ألعاب': 'toys',
    'أخرى': 'other'
  };

  // --- إضافة الخريطة العكسية ---
  const productTypesEnToAr = Object.fromEntries(
    Object.entries(productTypesArToEn).map(([ar, en]) => [en, ar])
  );
  // --------------------------------

  const productTypes = Object.keys(productTypesArToEn);

  // جلب المنتجات
  const fetchProducts = useCallback(async () => {
    if (!user?.token) return;

    const endpoints = [
      'http://localhost:5000/api/inventory/get',
      'http://localhost:5000/api/products/get',
      'http://localhost:5000/api/merchant/my-products'
    ];

    for (const url of endpoints) {
      try {
        const response = await fetch(url, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        if (!response.ok) continue;
        const data = await response.json();
        const list = data.products || data.productsList || data.result || data.items || [];
        setProducts(list || []);
        return;
      } catch (err) {
        continue;
      }
    }

    console.error('خطأ في جلب المنتجات: فشل الاتصال بكل نقاط النهاية المتوقعة.');
    alert('حدث خطأ أثناء جلب المنتجات.');
  }, [user?.token]);

  useEffect(() => {
    if (user?.token) {
      fetchProducts();
    }
  }, [user?.token, fetchProducts]);

  // === معالجة سحب وإفلات الصور ===
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
      const fileInput = document.querySelector('input[name="image"]');
      if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        // تحديث المعاينة يدويًا عبر trigger change
        const event = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(event);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // لا حاجة لـ URL.createObjectURL هنا لأننا نستخدم input مباشر
    }
  };

  // === إضافة منتج ===
  const handleAddProduct = async (e) => {
    e.preventDefault();

    if (!user?.token) {
      alert('يجب تسجيل الدخول أولاً.');
      return;
    }

    const formData = new FormData(e.target);
    const productName = formData.get('productName')?.trim();
    const quantityStr = formData.get('quantity');
    const typeAr = formData.get('type');
    const priceStr = formData.get('price');
    const imageFile = formData.get('image');

    const quantity = parseInt(quantityStr, 10);
    const price = parseFloat(priceStr);

    if (!productName || quantity <= 0 || !typeAr || price <= 0 || !imageFile) {
      alert('يرجى التأكد من ملء جميع الحقول المطلوبة بقيم صحيحة.');
      return;
    }

    setLoadingAdd(true);

    try {
      const typeEn = productTypesArToEn[typeAr] || 'other';
      formData.set('type', typeEn);

      const response = await fetch('http://localhost:5000/api/inventory/add', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
        },
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const data = await response.json();
      const pickupId = data.pickup_id || data.pickupId || data.pickupid || null;
      const merchantName = user?.name || user?.user?.name || user?.store_name || user?.storeName || '';

      setPickupInfo({
        pickup_id: pickupId || 'غير متوفر',
        merchantName: merchantName || 'غير معروف',
        quantity: quantity
      });

      setShowPickupModal(true);
      setShowAddModal(false);
      await fetchProducts();
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error);
      alert('خطأ في إضافة المنتج: ' + (error.message || 'خطأ غير متوقع'));
    } finally {
      setLoadingAdd(false);
    }
  };

  // === إغلاق نافذة الجلب ===
  const handleClosePickupModal = () => {
    setShowPickupModal(false);
    setPickupInfo(null);
  };

  return (
    <div className="inventory-page">
      <div className="inventory-header">
        <h2>المخزون</h2>
        <button
          className="add-product-btn"
          onClick={() => setShowAddModal(true)}
        >
          إضافة منتج جديد
        </button>
      </div>

      <div className="products-grid">
        {products.length === 0 ? (
          <div className="empty-state">
            لا توجد منتجات في المخزون.
          </div>
        ) : (
          products.map((product) => (
            <div key={product.id || product.pickup_id || Math.random()} className="product-card">
              <div className="product-image">
                <img
                  src={product.image_path ? `http://localhost:5000/uploads/${product.image_path}` : 'https://via.placeholder.com/300?text=المنتج'}
                  alt={product.name || 'المنتج'}
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/300?text=المنتج'; }}
                />
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name || 'بدون اسم'}</h3>
                <div className="product-details">
                  <div className="detail-row">
                    <span className="detail-label">الكمية:</span>
                    <span className="detail-value">{product.quantity}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">النوع:</span>
                    <span className="detail-value">
                      {product.type ? productTypesEnToAr[product.type] || product.type : 'غير محدد'}
                    </span>
                  </div>
                  <div className="detail-row status-row">
                    <span className="detail-label">الحالة:</span>
                    <span className={`status ${product.status}`}>
                      {product.status === 'stored' ? 'مخزن' : 
                       product.status === 'in_office' ? 'في المكتب' : 'لم يصل'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* نافذة إضافة منتج */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>إضافة منتج جديد</h3>
              <button className="close-btn" onClick={() => setShowAddModal(false)}>×</button>
            </div>

            <form className="add-product-form" onSubmit={handleAddProduct}>
              <div className="form-group">
                <label>اسم المنتج:</label>
                <input type="text" name="productName" required />
              </div>

              <div className="form-group">
                <label>الكمية:</label>
                <input type="number" name="quantity" min="1" required />
              </div>

              <div className="form-group">
                <label>النوع:</label>
                <div className="custom-select">
                  <select name="type" required>
                    <option value="">اختر نوع المنتج</option>
                    {productTypes.map((type, i) => (
                      <option key={i} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>رفع صورة:</label>
                <div
                  className={`dropzone ${dragActive ? 'drag-active' : ''}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    name="image"
                    accept="image/*"
                    onChange={handleImageChange}
                    hidden
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="dropzone-label">
                    {document.getElementById('image-upload')?.files?.[0] ? (
                      <div className="dropzone-preview">
                        <img 
                          src={URL.createObjectURL(document.getElementById('image-upload').files[0])} 
                          alt="معاينة" 
                        />
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

              <div className="form-group">
                <label>السعر:</label>
                <input type="number" name="price" min="0" step="0.01" required />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="submit-btn" disabled={loadingAdd}>
                  {loadingAdd ? 'جاري الإضافة...' : 'إضافة منتج'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* نافذة معلومات الجلب */}
      {showPickupModal && pickupInfo && (
        <div className="modal-overlay" onClick={handleClosePickupModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>معلومات عملية الجلب</h3>
              <button className="close-btn" onClick={handleClosePickupModal}>×</button>
            </div>
            <div className="pickup-info">
              <div className="info-item">
                <span className="info-label">ID عملية الجلب:</span>
                <span className="info-value">{pickupInfo.pickup_id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">اسم التاجر:</span>
                <span className="info-value">{pickupInfo.merchantName}</span>
              </div>
              <div className="info-item">
                <span className="info-label">الكمية:</span>
                <span className="info-value">{pickupInfo.quantity}</span>
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="submit-btn" onClick={handleClosePickupModal}>
                تم — إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;