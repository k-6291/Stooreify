import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();


  return (
    <div className="landing-page">
      {/* Header */}
      <header className="header">
        <div className="container">
          <nav className="navbar">
            <div className="dropdown">
              <a href="#" className="btn btn-outline">☰ القائمة</a>
              <div className="dropdown-content">
                <a href="#home">الرئيسية</a>
                <a href="#services">خدماتنا</a>
                <a href="#about">عنّا</a>
                <a href="#pricing">التسعير</a>
                <a href="#contact">تواصل معنا</a>
                <a href='/return'>  ارجاع</a>
              </div>
            </div>
            <a href="#" className="logo">Stooreify</a>
            <div className="auth-buttons">
              <button  className="btn btn-outline"
              onClick={() => navigate('/login')}
              >تسجيل الدخول</button>
              <button className="btn btn-primary"
              onClick={() => navigate('/signup')}
              >إنشاء حساب</button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="english-text">
              <div className="typewriter-container">
                <div className="loader">
                  <span className="text" style={{ color: '#FFFFFF', fontWeight: 'bold' }}>Let's make it</span>
                  <div className="words">
                    <span className="word">Stooreify</span>
                    <span className="word">simple</span>
                    <span className="word">faster</span>
                    <span className="word">BIGGER</span>
                    <span className="word">Stooreify</span>
                  </div>
                </div>
              </div>
            </h1>
            <p>نقدم حلولاً لوجستية متكاملة تعمل على تحويل تجربة التجارة الإلكترونية. مع Stooreify، يمكنك التركيز على نمو عملك بينما نهتم نحن بتفاصيل التخزين والتوصيل.</p>
            <button  className="btn btn-primary"
            onClick={() => navigate('/signup')}
            >سجل الآن</button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <div className="about-container">
            <div className="image-box">
              <img src="https://img.freepik.com/free-photo/medium-shot-smiley-man-warehouse_23-2149214241.jpg?semt=ais_hybrid&w=740&q=80" alt="عامل في المستودع" />
            </div>
            <div className="text-box">
              <h2>من هي Stooreify؟</h2>
              <p>Stooreify ليست مجرد شركة لوجستية عادية، بل هي رؤية جديدة تهدف إلى إحداث ثورة في عالم التجارة الإلكترونية في الجزائر والعالم العربي...</p>
               <p>Stooreify ليست مجرد شركة لوجستية عادية، بل هي رؤية جديدة تهدف إلى إحداث ثورة في عالم التجارة الإلكترونية في الجزائر والعالم العربي. نحن نؤمن بأن تجربة التوصيل هي جزء أساسي من رحلة العميل، ولهذا نعمل على تقديم حلول ذكية تجعل عملاءك يحصلون على تجربة توصيل فريدة من نوعها.</p>
                <p>مع Stooreify، يمكن للتجار التركيز على تطوير أعمالهم بينما نهتم نحن بكل التفاصيل اللوجستية. نمتلك شبكة من المخازن الذكية المنتشرة في مواقع استراتيجية، بالإضافة إلى حلول التوصيل إلى المنازل والشوارع، مما يضمن وصول منتجاتك إلى عملائك في أسرع وقت ممكن.</p>
                <p>نعمل على تقديم تجربة شحن سلسة وآمنة، مع دعم فني مخصص وحلول مخصصة للشركات. نحن نؤمن بأن النجاح لا يأتي فقط من التوصيل السريع، بل من تجربة متكاملة تبدأ من التخزين وصولًا إلى باب العميل.</p>
                <p>انضم إلى Stooreify اليوم وكن جزءاً من الثورة اللوجستية التي ستغير مستقبل التجارة الإلكترونية في منطقتنا.</p>
            </div>
            
          </div>
        </div>
      </section>

{/* Services Section */}
<section id="services" className="services">
  <div className="container">
    <div className="section-title">
      <h2>تعرف على خدمات Stooreify</h2>
    </div>
    <div className="services-grid">
      {[
        { 
          title: 'التخزين', 
          desc: 'نوفر مساحات تخزين آمنة ومجهزة بأحدث التقنيات...', 
          img: 'https://www.greenenergynews.co.uk/wp-content/uploads/2017/05/warehouse_general_greenenergynews.jpg' 
        },
        { 
          title: 'التغليف', 
          desc: 'خدمات تغليف احترافية تضمن وصول منتجاتك...', 
          img: 'https://www.logos3pl.com/wp-content/uploads/2025/06/carton-3pl-glossary-logos-logistics.jpg' 
        },
        { 
          title: 'التوصيل', 
          desc: 'شبكة توصيل واسعة تغطي جميع أنحاء البلاد...', 
          img: 'https://previews.123rf.com/images/kritchanut/kritchanut1711/kritchanut171100161/90102848-delivery-man-in-orange-uniform-handing-a-parcel-box-over-to-a-customer-courier-service-concept.jpg' 
        },
        { 
          title: 'لوحة تحكم التاجر', 
          desc: 'منصة سهلة الاستخدام تتيح لك إدارة طلباتك...', 
          img: 'https://www.kyubit.com/Images/dashboards/pallete2.png' 
        },
        { 
          title: 'الالتقاط', 
          desc: 'خدمة الالتقاط من موقعك لتسهيل عملية الشحن...', 
          img: 'https://www.shutterstock.com/image-photo/happy-courier-orange-uniform-box-600nw-2484056045.jpg' 
        },
        { 
          title: 'الدفع عند الاستلام', 
          desc: 'نظام دفع آمن يضمن لك تحصيل مستحقاتك...', 
          img: 'https://api.ibelieveinsci.com/api/v1/media/48399' 
        },
        { 
          title: 'الارجاع', 
          desc: 'إدارة عملية إرجاع المنتجات بسلاسة...', 
          img: ''
        },
        { 
          title: 'تأكيد الطلبات', 
          desc: 'نظام تأكيد الطلبات الآلي...', 
          img: 'https://halaconfirm.com/assets/img/img-5.png' 
        },
      ].map((service, index) => (
        <div key={index} className="service-card">
          <div 
            className="service-img" 
            style={{ backgroundImage: `url(${service.img})` }} 
          ></div>
          <div className="service-content">
            <h3>{service.title}</h3>
            <p>{service.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

      {/* Pricing Section */}
      <section id="pricing" className="pricing">
        <div className="container">
          <div className="section-title">
            <h2>باقات التسعير</h2>
          </div>
          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <div className="pricing-name">الباقة الأساسية</div>
                <div className="pricing-price">1000 <span className="pricing-period">دج/شهر</span></div>
              </div>
              <ul className="pricing-features">
                <li>التخزين</li>
                <li>التغليف</li>
                <li>التوصيل</li>
                <li>لوحة تحكم التاجر</li>
                <li>الدفع عند الاستلام</li>
                <li>الارجاع</li>
                <li>تأكيد الطلبات</li>
                <li>التحصيل</li>
              </ul>
              <div className="pricing-cta">
                <a href="#" className="btn btn-primary">اختر الباقة</a>
              </div>
            </div>
            <div className="pricing-card featured">
              <div className="pricing-header">
                <div className="pricing-name">باقة البرو</div>
                <div className="pricing-price">2000 <span className="pricing-period">دج/شهر</span></div>
              </div>
              <ul className="pricing-features">
                <li>جميع خدمات الباقة الأساسية</li>
                <li>التغليف الخاص</li>
                <li>الربط التلقائي</li>
                <li>حصص تدريبية أونلاين</li>
                <li>تحليل بيانات متطور</li>
                <li>التتبع المتقدم</li>
                <li>مراقبة الجودة</li>
                <li>التقييم والمعلومات</li>
              </ul>
              <div className="pricing-cta">
                <a href="#" className="btn btn-primary">اختر الباقة</a>
              </div>
            </div>
            <div className="pricing-card">
              <div className="pricing-header">
                <div className="pricing-name">باقة اوتيس</div>
                <div className="pricing-price">سعر خاص</div>
              </div>
              <ul className="pricing-features">
                <li>حلول مخصصة للشركات</li>
                <li>اتفاقيات تخزين طويلة الأجل</li>
                <li>خدمات لوجستية متكاملة</li>
                <li>دعم مخصص 24/7</li>
                <li>تقارير أداء مفصلة</li>
                <li>حلول التوسع والانتشار</li>
                <li>شروط مرنة ومناسبة</li>
                <li>خصومات على الحجم</li>
              </ul>
              <div className="pricing-cta">
                <a href="#" className="btn btn-outline">اتصل بنا</a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <div className="section-title">
            <h2>تواصل معنا</h2>
          </div>
          <p>هل لديك استفسار أو ترغب في معرفة المزيد عن خدماتنا؟ لا تتردد في التواصل معنا وسنكون سعداء لمساعدتك.</p>
          <form className="contact-form">
            <div className="form-group">
              <input type="text" className="form-control" placeholder="الاسم الكامل" />
            </div>
            <div className="form-group">
              <input type="email" className="form-control" placeholder="البريد الإلكتروني" />
            </div>
            <div className="form-group full-width">
              <textarea className="form-control" placeholder="رسالتك"></textarea>
            </div>
            <div className="form-group full-width">
              <button type="submit" className="btn btn-primary">إرسال الرسالة</button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Stooreify</h3>
              <p>ثورة في عالم اللوجستيك والتجارة الإلكترونية...</p>
            </div>
            <div className="footer-column">
              <h3>روابط سريعة</h3>
              <ul className="footer-links">
                <li><a href="#home">الرئيسية</a></li>
                <li><a href="#services">خدماتنا</a></li>
                <li><a href="#about">عنّا</a></li>
                <li><a href="#pricing">التسعير</a></li>
                <li><a href="#contact">تواصل معنا</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>خدماتنا</h3>
              <ul className="footer-links">
                <li><a href="#">التخزين</a></li>
                <li><a href="#">التغليف</a></li>
                <li><a href="#">التوصيل</a></li>
                <li><a href="#">لوحة التحكم</a></li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>معلومات الاتصال</h3>
              <ul className="footer-links">
                <li>الجزائر، الجزائر العاصمة</li>
                <li>contact@stooreify.com</li>
                <li>+213 XXX XXX XXX</li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2023 Stooreify. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
  export default LandingPage;