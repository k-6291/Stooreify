import React, { useState } from 'react';
import './ReturnPage.css';

const ReturnPage = () => {
  const [trackingCode, setTrackingCode] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [returnReason, setReturnReason] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!trackingCode) {
      setError('يرجى إدخال كود التتبع');
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/return/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingCode, returnReason })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'فشل في طلب الإرجاع');
      }

      setSuccess('تم طلب الإرجاع بنجاح. سيقوم فريق الدعم بمراجعة طلبك.');
      setOrder(null);
      setTrackingCode('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCheckOrder = async () => {
    setError('');
    setSuccess('');

    if (!trackingCode) {
      setError('يرجى إدخال كود التتبع');
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/return/check/${trackingCode}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'الطلب غير موجود');
      }

      setOrder(data.order);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="return-page">
      <div className="return-container">
        <div className="return-header">
          <h1>إرجاع الطلب</h1>
          <p>أدخل كود التتبع الذي أرسله لك التاجر</p>
        </div>

        {!order ? (
          <form className="tracking-form" onSubmit={(e) => { e.preventDefault(); handleCheckOrder(); }}>
            <div className="form-group">
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="ST123AB45C"
                required
              />
            </div>
            <button type="submit" className="check-btn">
              تتبع الطلب
            </button>
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}
          </form>
        ) : (
          <div className="return-form">
            <h2>طلبك جاهز للإرجاع</h2>
            <p><strong>المنتج:</strong> {order.productName}</p>
            <p><strong>الكمية:</strong> {order.quantity}</p>
            <p><strong>تاريخ الاستلام:</strong> {new Date(order.deliveredAt).toLocaleString('ar-EG')}</p>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>سبب الإرجاع:</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)} required>
                  <option value="">اختر السبب</option>
                  <option value="المنتج تالف">المنتج تالف</option>
                  <option value="غير مطابق للوصف">غير مطابق للوصف</option>
                  <option value="غير راضٍ عن المنتج">غير راضٍ عن المنتج</option>
                  <option value="طلب عن طريق الخطأ">طلب عن طريق الخطأ</option>
                </select>
              </div>

              <div className="form-group">
                <label>تقييمك للمنتج:</label>
                <div className="rating">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`star ${star <= rating ? 'active' : ''}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <button type="submit" className="return-btn">
                تأكيد الإرجاع
              </button>
              {error && <div className="error-message">{error}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReturnPage;