// Bank.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Bank.css';

const Bank = () => {
  const { user } = useAuth();
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [currentBalance, setCurrentBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [notifications, setNotifications] = useState([]);

  // دالة لإضافة إشعار مؤقت
  const addNotification = useCallback((message, type = 'success') => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  }, []);

  // جلب الرصيد
  const fetchBalance = async () => {
    if (!user?.token) return;
    setLoadingBalance(true);
    try {
      const res = await fetch('http://localhost:5000/api/bank/balance', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب الرصيد');
      const data = await res.json();
      setCurrentBalance(data.balance || 0);
    } catch (error) {
      addNotification('خطأ في جلب الرصيد', 'error');
    } finally {
      setLoadingBalance(false);
    }
  };

  // جلب المعاملات
  const fetchTransactions = async () => {
    if (!user?.token) return;
    setLoadingTransactions(true);
    try {
      const res = await fetch('http://localhost:5000/api/bank/transactions', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      if (!res.ok) throw new Error('فشل جلب المعاملات');
      const data = await res.json();
      setTransactions(data.transactions || []);
    } catch (error) {
      addNotification('خطأ في جلب المعاملات', 'error');
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    if (user?.token) {
      fetchBalance();
      fetchTransactions();
    }
  }, [user, addNotification]);

  // سحب المبلغ
  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (!user?.token) return addNotification('يجب تسجيل الدخول', 'error');

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      return addNotification('أدخل مبلغًا صحيحًا', 'error');
    }
    if (amount > currentBalance) {
      return addNotification('المبلغ أكبر من رصيدك', 'error');
    }

    try {
      const res = await fetch('http://localhost:5000/api/bank/withdraw', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (!res.ok) throw new Error('فشل طلب السحب');
      
      const data = await res.json();
      addNotification(data.message || 'تم السحب بنجاح!');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      fetchBalance();
      fetchTransactions();
    } catch (error) {
      addNotification('فشل في تقديم طلب السحب', 'error');
    }
  };

  // تحويل نوع المعاملة إلى عربي
  const getTransactionType = (type) => {
    switch (type) {
      case 'deposit': return 'إيداع';
      case 'withdrawal': return 'سحب';
      case 'service_fee': return 'رسوم خدمة';
      default: return type;
    }
  };

  return (
    <div className="bank-page">
      {/* الإشعارات */}
      <div className="notifications">
        {notifications.map(note => (
          <div key={note.id} className={`notification ${note.type}`}>
            {note.message}
          </div>
        ))}
      </div>

      <div className="bank-header">
        <h2>البنك</h2>
      </div>

      <div className="balance-section">
        <div className="balance-card">
          <div className="balance-label">رصيدك الحالي:</div>
          {loadingBalance ? (
            <div className="balance-amount">جاري التحميل...</div>
          ) : (
            <div className="balance-amount">{parseFloat(currentBalance).toFixed(2)} دج</div>
          )}
          <button
            className="withdraw-btn"
            onClick={() => setShowWithdrawModal(true)}
            disabled={loadingBalance}
          >
            سحب
          </button>
        </div>
      </div>

      <div className="transactions-section">
        <h3>سجل المعاملات</h3>
        <div className="transactions-table-container">
          {loadingTransactions ? (
            <div className="loading-message">جاري تحميل المعاملات...</div>
          ) : transactions.length === 0 ? (
            <div className="empty-message">لا توجد معاملات حاليًا.</div>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>التاريخ</th>
                  <th>الوصف</th>
                  <th>المبلغ</th>
                  <th>النوع</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((tx) => (
                  <tr key={tx.id}>
                    <td>{new Date(tx.created_at).toLocaleDateString('ar-DZ')}</td>
                    <td>{tx.description}</td>
                    <td className={tx.type === 'deposit' ? 'amount-positive' : 'amount-negative'}>
                      {tx.type === 'deposit' ? '+' : '-'}{parseFloat(tx.amount).toFixed(2)} دج
                    </td>
                    <td className={`transaction-type ${tx.type}`}>
  {tx.type === 'deposit' ? '↑ إيداع' : 
   tx.type === 'withdrawal' ? '↓ سحب' : '• رسوم خدمة'}
</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* نافذة السحب */}
      {showWithdrawModal && (
        <div className="modal-overlay" onClick={() => setShowWithdrawModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>سحب مبلغ</h3>
              <button className="close-btn" onClick={() => setShowWithdrawModal(false)}>×</button>
            </div>
            <form className="withdraw-form" onSubmit={handleWithdraw}>
              <div className="form-group">
                <label>المبلغ المراد سحبه:</label>
                <input
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  min="1"
                  placeholder="أدخل المبلغ"
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowWithdrawModal(false)}>
                  إلغاء
                </button>
                <button type="submit" className="submit-btn">سحب</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bank;