import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

function Contact() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCustomer = user?.role === "CUSTOMER";

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    message: "",
  });

  const goOrder = () => {
    if (isCustomer) navigate("/customer-shop");
    else navigate("/login");
  };

  const goDashboard = () => {
    if (user?.role === "ADMIN") navigate("/dashboard");
    else if (user?.role === "STAFF") navigate("/staff-dashboard");
    else if (user?.role === "CUSTOMER") navigate("/customer-dashboard");
    else navigate("/login");
  };

  const submitContact = (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      alert("Please enter your name");
      return;
    }

    if (!form.phone.trim()) {
      alert("Please enter your phone number");
      return;
    }

    if (!form.message.trim()) {
      alert("Please enter your message");
      return;
    }

    alert("Thank you. SARASKANA STEEL team will contact you soon.");

    setForm({
      name: "",
      phone: "",
      message: "",
    });
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          margin: 0;
        }

        .contact-site {
          min-height: 100vh;
          background: #f8fafc;
          color: #111827;
          font-family: Arial, sans-serif;
        }

        .topbar {
          background: #020617;
          color: #cbd5e1;
          padding: 10px 56px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
          font-size: 14px;
        }

        .topbar strong {
          color: white;
        }

        .navbar {
          height: 82px;
          background: rgba(255, 255, 255, 0.92);
          backdrop-filter: blur(18px);
          position: sticky;
          top: 0;
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 56px;
          box-shadow: 0 8px 26px rgba(15, 23, 42, 0.08);
        }

        .brand {
          font-size: 30px;
          font-weight: 1000;
          letter-spacing: 0.6px;
          color: #111827;
          text-decoration: none;
        }

        .brand span {
          color: #f59e0b;
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 22px;
        }

        .nav-links a,
        .nav-links button {
          border: none;
          background: transparent;
          text-decoration: none;
          color: #111827;
          font-weight: 900;
          cursor: pointer;
          font-size: 15px;
        }

        .nav-login {
          background: #111827 !important;
          color: white !important;
          padding: 13px 18px;
          border-radius: 14px;
          text-decoration: none;
        }

        .nav-order {
          background: #f59e0b !important;
          color: #111827 !important;
          padding: 13px 18px;
          border-radius: 14px;
        }

        .mobile-menu-btn {
          display: none;
          width: 46px;
          height: 46px;
          border: none;
          border-radius: 14px;
          background: #111827;
          cursor: pointer;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 5px;
        }

        .mobile-menu-btn span {
          width: 22px;
          height: 3px;
          background: white;
          border-radius: 999px;
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 6, 23, 0.55);
          z-index: 2000;
        }

        .mobile-drawer {
          position: fixed;
          top: 0;
          right: 0;
          width: 320px;
          max-width: 88%;
          height: 100vh;
          background: white;
          z-index: 2001;
          padding: 24px;
          box-shadow: -18px 0 45px rgba(15, 23, 42, 0.25);
          display: flex;
          flex-direction: column;
          gap: 14px;
          animation: slideIn .25s ease;
        }

        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .mobile-drawer-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 18px;
        }

        .mobile-drawer-brand {
          font-size: 22px;
          font-weight: 1000;
          color: #111827;
        }

        .mobile-drawer-brand span {
          color: #f59e0b;
        }

        .mobile-close {
          width: 42px;
          height: 42px;
          border: none;
          border-radius: 12px;
          background: #f1f5f9;
          font-size: 24px;
          font-weight: 1000;
          cursor: pointer;
        }

        .mobile-drawer a,
        .mobile-drawer button {
          width: 100%;
          text-align: left;
          border: none;
          text-decoration: none;
          background: #f8fafc;
          color: #111827;
          padding: 15px 16px;
          border-radius: 16px;
          font-weight: 1000;
          cursor: pointer;
          font-size: 15px;
        }

        .mobile-drawer .mobile-order {
          background: #f59e0b;
          color: #111827;
        }

        .mobile-drawer .mobile-login {
          background: #111827;
          color: white;
        }

        .hero {
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.92), rgba(41, 37, 36, 0.88)),
            url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1800&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          padding: 92px 56px;
        }

        .hero-badge {
          display: inline-flex;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fde68a;
          font-weight: 1000;
          margin-bottom: 24px;
        }

        .hero h1 {
          font-size: 62px;
          line-height: 1.05;
          margin: 0;
          font-weight: 1000;
          max-width: 860px;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          font-size: 18px;
          line-height: 1.8;
          max-width: 760px;
          margin: 22px 0 0;
        }

        .hero-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          margin-top: 34px;
        }

        .btn {
          border: none;
          border-radius: 18px;
          padding: 16px 22px;
          font-weight: 1000;
          cursor: pointer;
          font-size: 16px;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .btn-primary {
          background: #f59e0b;
          color: #111827;
          box-shadow: 0 14px 28px rgba(245, 158, 11, 0.25);
        }

        .btn-dark {
          background: #111827;
          color: white;
        }

        .btn-light {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .section {
          padding: 74px 56px;
        }

        .section-head {
          margin-bottom: 34px;
        }

        .eyebrow {
          color: #d97706;
          font-weight: 1000;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          font-size: 13px;
          margin-bottom: 10px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 42px;
          font-weight: 1000;
          color: #111827;
        }

        .section-head p {
          margin: 12px 0 0;
          color: #64748b;
          max-width: 740px;
          line-height: 1.7;
        }

        .contact-grid {
          display: grid;
          grid-template-columns: 0.95fr 1.05fr;
          gap: 26px;
          align-items: start;
        }

        .info-card,
        .form-card {
          background: white;
          border-radius: 32px;
          padding: 32px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
        }

        .info-card h3,
        .form-card h3 {
          margin: 0 0 20px;
          font-size: 30px;
          font-weight: 1000;
          color: #111827;
        }

        .contact-line {
          display: flex;
          gap: 14px;
          align-items: flex-start;
          padding: 18px;
          border-radius: 22px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          margin-bottom: 14px;
        }

        .contact-icon {
          width: 44px;
          height: 44px;
          border-radius: 16px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 23px;
          flex-shrink: 0;
        }

        .contact-line strong {
          display: block;
          color: #111827;
          margin-bottom: 4px;
        }

        .contact-line span {
          color: #64748b;
          line-height: 1.6;
          font-weight: 800;
        }

        .quick-buttons {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 22px;
        }

        .quick-btn {
          border: none;
          border-radius: 18px;
          padding: 15px 14px;
          font-weight: 1000;
          text-decoration: none;
          text-align: center;
          cursor: pointer;
        }

        .call {
          background: #dcfce7;
          color: #166534;
        }

        .email {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .whatsapp {
          background: #ccfbf1;
          color: #0f766e;
        }

        .form-row {
          margin-bottom: 18px;
        }

        .form-row label {
          display: block;
          font-weight: 900;
          color: #374151;
          margin-bottom: 8px;
        }

        .input,
        .textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 18px;
          padding: 15px 16px;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .input:focus,
        .textarea:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
        }

        .textarea {
          min-height: 150px;
          resize: vertical;
          line-height: 1.7;
        }

        .submit-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 17px 20px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #111827;
          font-size: 17px;
          font-weight: 1000;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(217,119,6,0.25);
        }

        .business-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .business-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .business-icon {
          width: 58px;
          height: 58px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          margin-bottom: 18px;
        }

        .business-card h3 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .business-card p {
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        .map-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 26px;
          align-items: stretch;
        }

        .map-card {
          min-height: 420px;
          border-radius: 34px;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(41, 37, 36, 0.78)),
            url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          display: flex;
          align-items: flex-end;
          padding: 34px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.16);
        }

        .map-card h3 {
          margin: 0;
          font-size: 32px;
          font-weight: 1000;
        }

        .map-card p {
          color: #e5e7eb;
          line-height: 1.7;
        }

        .store-card {
          background: #111827;
          color: white;
          border-radius: 34px;
          padding: 34px;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.18);
        }

        .store-card h3 {
          margin: 0;
          font-size: 32px;
          font-weight: 1000;
        }

        .store-card p {
          color: #d1d5db;
          line-height: 1.8;
          margin-top: 16px;
        }

        .store-list {
          margin-top: 24px;
          display: grid;
          gap: 14px;
        }

        .store-list div {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          padding: 16px;
          border-radius: 18px;
          font-weight: 900;
        }

        .cta {
          background:
            linear-gradient(135deg, rgba(17, 24, 39, 0.96), rgba(41, 37, 36, 0.92)),
            url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 38px;
          padding: 50px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
        }

        .cta h2 {
          margin: 0;
          font-size: 42px;
          font-weight: 1000;
        }

        .cta p {
          color: #d1d5db;
          line-height: 1.7;
          max-width: 720px;
        }

        .footer {
          background: #020617;
          color: #cbd5e1;
          padding: 34px 56px;
          text-align: center;
        }

        @media(max-width: 950px) {
          .topbar {
            display: none;
          }

          .navbar {
            padding: 0 18px;
          }

          .nav-links {
            display: none;
          }

          .mobile-menu-btn {
            display: flex;
          }

          .hero {
            padding: 64px 22px;
          }

          .hero h1 {
            font-size: 44px;
          }

          .section {
            padding: 54px 22px;
          }

          .contact-grid,
          .business-grid,
          .map-section {
            grid-template-columns: 1fr;
          }

          .cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media(max-width: 600px) {
          .brand {
            font-size: 24px;
          }

          .hero h1 {
            font-size: 36px;
          }

          .hero p {
            font-size: 16px;
          }

          .section-head h2,
          .cta h2 {
            font-size: 32px;
          }

          .quick-buttons {
            grid-template-columns: 1fr;
          }

          .info-card,
          .form-card,
          .store-card {
            padding: 24px;
          }

          .cta {
            padding: 30px;
          }

          .footer {
            padding: 28px 18px;
          }
        }
      `}</style>

      <div className="contact-site">
        <div className="topbar">
          <div>
            <strong>SARASKANA STEEL</strong> — Trusted construction material supplier
          </div>
          <div>📞 9438085096 | ✉️ SARSKANASTEEL@GMAIL.COM | 📍 Saraskana</div>
        </div>

        <nav className="navbar">
          <Link className="brand" to="/home">
            SARASKANA <span>STEEL</span>
          </Link>

          <div className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/about">About</Link>
            <a href="/home#products">Products</a>
            <a href="/home#offers">Offers</a>
            <Link to="/Contact">Contact</Link>

            {user?.role ? (
              <button onClick={goDashboard}>Dashboard</button>
            ) : (
              <Link className="nav-login" to="/login">
                Login
              </Link>
            )}

            <button className="nav-order" onClick={goOrder}>
              Order Now
            </button>
          </div>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(true)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </nav>

        {mobileMenuOpen && (
          <>
            <div
              className="mobile-overlay"
              onClick={() => setMobileMenuOpen(false)}
            />

            <div className="mobile-drawer">
              <div className="mobile-drawer-top">
                <div className="mobile-drawer-brand">
                  SARASKANA <span>STEEL</span>
                </div>

                <button
                  className="mobile-close"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  ×
                </button>
              </div>

              <Link to="/home" onClick={() => setMobileMenuOpen(false)}>
                🏠 Home
              </Link>

              <Link to="/about" onClick={() => setMobileMenuOpen(false)}>
                ℹ️ About
              </Link>

              <Link to="/home#products" onClick={() => setMobileMenuOpen(false)}>
                🏗 Products
              </Link>

              <Link to="/home#offers" onClick={() => setMobileMenuOpen(false)}>
                🎁 Offers
              </Link>

              <Link to="/Contact" onClick={() => setMobileMenuOpen(false)}>
                📞 Contact
              </Link>

              {user?.role ? (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    goDashboard();
                  }}
                >
                  📊 Dashboard
                </button>
              ) : (
                <Link
                  className="mobile-login"
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  🔐 Login
                </Link>
              )}

              <button
                className="mobile-order"
                onClick={() => {
                  setMobileMenuOpen(false);
                  goOrder();
                }}
              >
                🛒 Order Now
              </button>
            </div>
          </>
        )}

        <section className="hero">
          <div className="hero-badge">📞 Contact SARASKANA STEEL</div>

          <h1>
            Get materials, billing support and order help from <span>our team</span>
          </h1>

          <p>
            Contact SARASKANA STEEL for cement, TMT bar, sheets, pipes,
            construction materials, delivery details, billing support and
            customer account help.
          </p>

          <div className="hero-actions">
            <a className="btn btn-primary" href="tel:9438085096">
              Call Now
            </a>

            <button className="btn btn-light" onClick={goOrder}>
              Order Materials
            </button>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div className="eyebrow">Reach Us</div>
            <h2>Contact details</h2>
            <p>
              You can contact us by phone, email, WhatsApp or by visiting our
              store at Saraskana.
            </p>
          </div>

          <div className="contact-grid">
            <div className="info-card">
              <h3>Company Information</h3>

              <div className="contact-line">
                <div className="contact-icon">🏢</div>
                <div>
                  <strong>SARASKANA STEEL</strong>
                  <span>GSTIN-21BFVPS4336E1ZA, Powered by STRIDE</span>
                </div>
              </div>

              <div className="contact-line">
                <div className="contact-icon">📍</div>
                <div>
                  <strong>Address</strong>
                  <span>Saraskana</span>
                </div>
              </div>

              <div className="contact-line">
                <div className="contact-icon">📞</div>
                <div>
                  <strong>Phone</strong>
                  <span>9438085096</span>
                </div>
              </div>

              <div className="contact-line">
                <div className="contact-icon">✉️</div>
                <div>
                  <strong>Email</strong>
                  <span>SARSKANASTEEL@GMAIL.COM</span>
                </div>
              </div>

              <div className="quick-buttons">
                <a className="quick-btn call" href="tel:9438085096">
                  Call
                </a>

                <a
                  className="quick-btn email"
                  href="mailto:SARSKANASTEEL@GMAIL.COM"
                >
                  Email
                </a>

                <a
                  className="quick-btn whatsapp"
                  href="https://wa.me/919438085096"
                  target="_blank"
                  rel="noreferrer"
                >
                  WhatsApp
                </a>
              </div>
            </div>

            <div className="form-card">
              <h3>Send Enquiry</h3>

              <form onSubmit={submitContact}>
                <div className="form-row">
                  <label>Your Name</label>
                  <input
                    className="input"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Enter your name"
                  />
                </div>

                <div className="form-row">
                  <label>Phone Number</label>
                  <input
                    className="input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm({ ...form, phone: e.target.value })
                    }
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="form-row">
                  <label>Message</label>
                  <textarea
                    className="textarea"
                    value={form.message}
                    onChange={(e) =>
                      setForm({ ...form, message: e.target.value })
                    }
                    placeholder="Tell us what material you need..."
                  />
                </div>

                <button className="submit-btn">
                  Submit Enquiry
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div className="eyebrow">Support</div>
            <h2>How we help customers</h2>
          </div>

          <div className="business-grid">
            <div className="business-card">
              <div className="business-icon">🏗</div>
              <h3>Material Enquiry</h3>
              <p>
                Ask about cement, TMT bar, sheets, pipes and other construction
                materials.
              </p>
            </div>

            <div className="business-card">
              <div className="business-icon">🧾</div>
              <h3>Billing Support</h3>
              <p>
                Get help with invoices, payment records, outstanding balance and
                order bills.
              </p>
            </div>

            <div className="business-card">
              <div className="business-icon">🚚</div>
              <h3>Delivery Help</h3>
              <p>
                Contact us for delivery updates, order status and address
                related support.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="map-section">
            <div className="map-card">
              <div>
                <h3>Visit our store</h3>
                <p>
                  Come to SARASKANA STEEL for material enquiry, customer support,
                  billing help and order assistance.
                </p>
              </div>
            </div>

            <div className="store-card">
              <h3>Business Hours</h3>

              <p>
                Our team is available to help customers with material orders,
                billing, delivery and account support.
              </p>

              <div className="store-list">
                <div>🕘 Sunday - Saturday: 6:30 AM - 7:00 PM</div>
                <div>📞 Phone Support: 9438085096</div>
                <div>📍 Location: Saraskana</div>
                <div>🧾 Digital Orders: Available through STRIDE</div>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="cta">
            <div>
              <h2>Ready to order materials?</h2>
              <p>
                Login as customer to view rates, place orders, track delivery,
                download invoices and manage your account.
              </p>
            </div>

            <button className="btn btn-primary" onClick={goOrder}>
              Start Ordering
            </button>
          </div>
        </section>

        <footer className="footer">
          © {new Date().getFullYear()} SARASKANA STEEL | Powered by STRIDE
        </footer>
      </div>
    </>
  );
}

export default Contact;