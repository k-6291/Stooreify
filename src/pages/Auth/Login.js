// frontend/src/pages/Auth/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

  try {
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'بيانات الدخول غير صحيحة');
    }

    // ✅ 1. احفظ التوكن
    sessionStorage.setItem('token', data.token);

    // ✅ 2. احفظ بيانات المستخدم مباشرة من استجابة /login (وهو الأهم!)
    sessionStorage.setItem('userData', JSON.stringify(data.user));

    // ✅ 3. لا حاجة لطلب /profile إطلاقًا
    // (يمكنك حذف طلب /profile بالكامل)

    // توجيه حسب الدور
    if (data.user.role === 'admin') {
      navigate('/admin');
    } else if (data.user.role === 'employee') {
      if (data.user.team === 'office') {
        navigate('/office');
      } else if (data.user.team === 'warehouse') {
        if (data.user.isManager) {
          navigate('/warehouse-manager');
        } else {
          navigate('/warehouse');
        }
      } else if (data.user.team === 'packaging') {
        navigate('/packaging');
      } else if (data.user.team === 'confirmation') {
        navigate('/confirmation');
      } else if (data.user.team === 'support') {
        navigate('/support');
      }
    } else {
      navigate('/dashboard');
    }
  } catch (err) {
    setError(err.message);
  }
};

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <h2>تسجيل الدخول</h2>
        </div>

        <form className="login-form" onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="example@email.com أو 05XXXXXXXX"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="أدخل كلمة السر"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <div style={{ color: 'red', margin: '10px 0' }}>{error}</div>}

          <button 
            type="submit"
            className="login-button"
            disabled={!identifier || !password}
          >
            تسجيل الدخول
          </button>
        </form>

        <div className="login-links">
          <a href="#" className="forgot-password">نسيت كلمة السر؟</a>
          <a href="/signup" className="create-account">ليس لديك حساب؟ إنشاء حساب</a>
        </div>
      </div>
    </div>
  );
};

export default Login;