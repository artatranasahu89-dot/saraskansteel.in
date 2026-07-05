import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

type GalleryItem = {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  displayOrder?: number;
};

function About() {
  const navigate = useNavigate();
  const API = "http://localhost:5000";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCustomer = user?.role === "CUSTOMER";

  const [owner, setOwner] = useState<any>(null);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadOwner = async () => {
    try {
      const res = await axios.get(`${API}/api/website/owner-message`);
      setOwner(res.data.data);
    } catch (error) {
      console.log("Owner message load error", error);
    }
  };

  const loadGallery = async () => {
    try {
      const res = await axios.get(`${API}/api/website-gallery`);
      setGallery(res.data.data || []);
    } catch (error) {
      console.log("Gallery load error", error);
    }
  };

  useEffect(() => {
    loadOwner();
    loadGallery();
  }, []);

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

  const fallbackGallery = [
    {
      id: "1",
      title: "Construction Material Supply",
      description: "Quality material support for builders and customers.",
      imageUrl:
        "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "2",
      title: "Customer Service",
      description: "Reliable billing, order and delivery support.",
      imageUrl:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
    },
    {
      id: "3",
      title: "Strong Construction",
      description: "Supplying materials for strong and lasting projects.",
      imageUrl:
        "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
    },
  ];

  const finalGallery = gallery.length > 0 ? gallery : fallbackGallery;

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

        .about-site {
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
          position: relative;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(41, 37, 36, 0.88)),
            url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1800&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          padding: 96px 56px;
          overflow: hidden;
        }

        .hero::after {
          content: "";
          position: absolute;
          width: 420px;
          height: 420px;
          right: -130px;
          top: -130px;
          border-radius: 50%;
          background: rgba(245, 158, 11, 0.22);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 920px;
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
          font-size: 64px;
          line-height: 1.05;
          margin: 0;
          font-weight: 1000;
          max-width: 900px;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          font-size: 18px;
          line-height: 1.8;
          max-width: 780px;
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

        .btn-light {
          background: rgba(255, 255, 255, 0.12);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .section {
          padding: 74px 56px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
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
          max-width: 760px;
          line-height: 1.7;
        }

        .story-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          align-items: stretch;
        }

        .story-card {
          background: white;
          border-radius: 34px;
          padding: 34px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.08);
        }

        .story-card h2 {
          margin: 0 0 18px;
          font-size: 36px;
          font-weight: 1000;
        }

        .story-card p {
          color: #64748b;
          line-height: 1.8;
          font-size: 16px;
        }

        .story-photo {
          min-height: 430px;
          border-radius: 34px;
          background:
            linear-gradient(135deg, rgba(15,23,42,.12), rgba(15,23,42,.12)),
            url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.12);
        }

        .values {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .value {
          background: white;
          border-radius: 28px;
          padding: 26px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .value-icon {
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

        .value h3 {
          margin: 0 0 10px;
          font-size: 22px;
        }

        .value p {
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        .message-section {
          background: #111827;
          color: white;
        }

        .message-section .section-head h2 {
          color: white;
        }

        .message-section .section-head p {
          color: #d1d5db;
        }

        .message-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 30px;
          align-items: stretch;
        }

        .message {
          background: linear-gradient(135deg, #1f2937, #020617);
          color: white;
          border-radius: 34px;
          padding: 38px 42px;
          box-shadow: 0 18px 38px rgba(0, 0, 0, 0.26);
          text-align: center;
          min-height: 610px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-start;
          border: 1px solid rgba(255,255,255,.12);
        }

        .message-label {
          display: inline-block;
          background: rgba(255, 255, 255, 0.12);
          color: #fbbf24;
          padding: 9px 18px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 1000;
          margin-bottom: 24px;
        }

        .person-photo-wrap {
          width: 176px;
          height: 176px;
          border-radius: 50%;
          padding: 7px;
          background: rgba(255, 255, 255, 0.18);
          margin-bottom: 26px;
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
        }

        .person-img {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          object-fit: cover;
          display: block;
        }

        .person-empty {
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: linear-gradient(135deg, #f59e0b, #7c2d12);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 58px;
        }

        .message h2 {
          margin: 0;
          font-size: 30px;
          font-weight: 1000;
          line-height: 1.2;
        }

        .message h4 {
          margin: 10px 0 24px;
          color: #fbbf24;
          font-size: 16px;
          letter-spacing: 0.4px;
        }

        .message p {
          color: #e5e7eb;
          line-height: 1.8;
          font-size: 17px;
          margin: 0 0 24px;
          max-width: 680px;
        }

        .message b {
          color: white;
          margin-top: auto;
          font-size: 16px;
        }

        .strengths {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .strength {
          background: white;
          border-radius: 28px;
          padding: 28px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .strength h3 {
          margin: 0 0 12px;
          font-size: 23px;
        }

        .strength p {
          color: #64748b;
          line-height: 1.7;
          margin: 0;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .gallery-card {
          background: white;
          border-radius: 28px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .gallery-img {
          height: 250px;
          background-size: cover;
          background-position: center;
        }

        .gallery-info {
          padding: 22px;
        }

        .gallery-info h3 {
          margin: 0 0 8px;
          font-size: 21px;
          color: #111827;
        }

        .gallery-info p {
          margin: 0;
          color: #64748b;
          line-height: 1.7;
        }

        .process {
          background: #111827;
          color: white;
          border-radius: 36px;
          padding: 42px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .process-step {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 24px;
          padding: 22px;
        }

        .process-step strong {
          display: inline-flex;
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #f59e0b;
          color: #111827;
          align-items: center;
          justify-content: center;
          margin-bottom: 14px;
          font-size: 20px;
        }

        .process-step h3 {
          margin: 0 0 8px;
        }

        .process-step p {
          margin: 0;
          color: #d1d5db;
          line-height: 1.6;
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
          padding: 40px 56px;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr 0.8fr;
          gap: 30px;
          margin-bottom: 28px;
        }

        .footer h3 {
          color: white;
          margin: 0 0 14px;
        }

        .footer p,
        .footer a {
          color: #cbd5e1;
          line-height: 1.7;
          text-decoration: none;
          display: block;
          margin: 8px 0;
        }

        .footer-bottom {
          border-top: 1px solid rgba(255,255,255,.12);
          padding-top: 20px;
          text-align: center;
          color: #94a3b8;
        }

        @media(max-width: 1100px) {
          .values {
            grid-template-columns: repeat(2, 1fr);
          }

          .gallery-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .process {
            grid-template-columns: repeat(2, 1fr);
          }
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

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .story-grid,
          .message-grid,
          .strengths,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .message {
            min-height: auto;
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

          .values,
          .gallery-grid,
          .process {
            grid-template-columns: 1fr;
          }

          .story-card,
          .message {
            padding: 26px;
          }

          .person-photo-wrap {
            width: 150px;
            height: 150px;
          }

          .cta {
            padding: 30px;
          }

          .footer {
            padding: 32px 22px;
          }
        }
      `}</style>

      <div className="about-site">
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
          <div className="hero-content">
            <div className="hero-badge">🏗 About SARASKANA STEEL</div>

            <h1>
              Building trust with quality materials and <span>professional service</span>
            </h1>

            <p>
              SARASKANA STEEL is a trusted construction material supplier focused
              on quality products, transparent billing, organized delivery and
              long-term customer relationships through the STRIDE platform.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={goOrder}>
                Start Ordering
              </button>

              <Link className="btn btn-light" to="/contact">
                Contact Us
              </Link>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="story-grid">
            <div className="story-card">
              <div className="eyebrow">Our Story</div>

              <h2>From local supply to digital material ordering</h2>

              <p>
                SARASKANA STEEL was built with a simple goal: to make
                construction material buying easier, faster and more reliable for
                customers, builders and contractors.
              </p>

              <p>
                Through STRIDE, we bring product browsing, ordering, billing,
                delivery tracking, reward points and customer account management
                into one professional digital platform.
              </p>

              <p>
                Our focus is clear: strong material quality, honest customer
                relationships, proper records and dependable service.
              </p>
            </div>

            <div className="story-photo" />
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Our Values</div>
              <h2>What we believe in</h2>
              <p>
                Our business is built around trust, quality, clear billing and
                organized customer support.
              </p>
            </div>
          </div>

          <div className="values">
            <div className="value">
              <div className="value-icon">✅</div>
              <h3>Quality</h3>
              <p>Reliable materials for strong and lasting construction.</p>
            </div>

            <div className="value">
              <div className="value-icon">🤝</div>
              <h3>Trust</h3>
              <p>Transparent billing and respectful customer communication.</p>
            </div>

            <div className="value">
              <div className="value-icon">🚚</div>
              <h3>Delivery</h3>
              <p>Organized delivery tracking and customer support.</p>
            </div>

            <div className="value">
              <div className="value-icon">📊</div>
              <h3>Records</h3>
              <p>Digital orders, invoices, payments and account history.</p>
            </div>
          </div>
        </section>

        <section className="section message-section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Leadership Message</div>
              <h2>Words from our team</h2>
              <p>
                Owner and co-owner messages are managed from the admin website
                management panel.
              </p>
            </div>
          </div>

          <div className="message-grid">
            <div className="message">
              <div className="message-label">MESSAGE FROM OWNER</div>

              <div className="person-photo-wrap">
                {owner?.imageUrl ? (
                  <img
                    className="person-img"
                    src={owner.imageUrl}
                    alt={owner?.name || "Owner"}
                  />
                ) : (
                  <div className="person-empty">👤</div>
                )}
              </div>

              <h2>{owner?.name || "Owner"}</h2>

              <h4>{owner?.designation || "SARASKANA STEEL"}</h4>

              <p>
                {owner?.message ||
                  "Our mission is to provide construction materials with honesty, quality and dependable service. We believe that every customer deserves proper billing, timely delivery and respectful support."}
              </p>

              <b>— {owner?.name || "Owner"}, SARASKANA STEEL</b>
            </div>

            <div className="message">
              <div className="message-label">MESSAGE FROM CO-OWNER</div>

              <div className="person-photo-wrap">
                {owner?.coOwnerImageUrl ? (
                  <img
                    className="person-img"
                    src={owner.coOwnerImageUrl}
                    alt={owner?.coOwnerName || "Co-owner"}
                  />
                ) : (
                  <div className="person-empty">👤</div>
                )}
              </div>

              <h2>{owner?.coOwnerName || "Co-owner"}</h2>

              <h4>{owner?.coOwnerDesignation || "SARASKANA STEEL"}</h4>

              <p>
                {owner?.coOwnerMessage ||
                  "With STRIDE, we are making our business modern and customer-friendly. Customers can now order, track, view bills and manage their account from one place."}
              </p>

              <b>— {owner?.coOwnerName || "Co-owner"}, SARASKANA STEEL</b>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Why Customers Choose Us</div>
              <h2>Reliable construction supply support</h2>
              <p>
                Customers choose SARASKANA STEEL because we combine material
                supply with clear digital records and customer support.
              </p>
            </div>
          </div>

          <div className="strengths">
            <div className="strength">
              <h3>🏗 Construction Focused</h3>
              <p>
                Cement, TMT bar, pipes, GC sheet, AC sheet and other essential
                construction materials under one roof.
              </p>
            </div>

            <div className="strength">
              <h3>🧾 Digital Billing</h3>
              <p>
                Transparent invoices, payment history, outstanding records and
                order bills are managed properly.
              </p>
            </div>

            <div className="strength">
              <h3>🎁 Rewards & Tracking</h3>
              <p>
                Customers can track orders, download invoices and manage reward
                points through STRIDE.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="process">
            <div className="process-step">
              <strong>1</strong>
              <h3>Browse</h3>
              <p>Customers can browse materials online from the website.</p>
            </div>

            <div className="process-step">
              <strong>2</strong>
              <h3>Login</h3>
              <p>Customer logs in to view rates and place orders.</p>
            </div>

            <div className="process-step">
              <strong>3</strong>
              <h3>Order</h3>
              <p>Material order is placed with address and delivery details.</p>
            </div>

            <div className="process-step">
              <strong>4</strong>
              <h3>Track</h3>
              <p>Customer tracks status, invoices and payment history.</p>
            </div>
          </div>
        </section>

        <section className="section" id="gallery">
          <div className="section-head">
            <div>
              <div className="eyebrow">Company Gallery</div>
              <h2>Our work, materials and moments</h2>
              <p>
                Gallery images are managed by admin. Upload company, delivery,
                material and customer photos from the website gallery page.
              </p>
            </div>
          </div>

          <div className="gallery-grid">
            {finalGallery.slice(0, 6).map((item) => (
              <div className="gallery-card" key={item.id}>
                <div
                  className="gallery-img"
                  style={{
                    backgroundImage: `url("${item.imageUrl}")`,
                  }}
                />

                <div className="gallery-info">
                  <h3>{item.title || "SARASKANA STEEL"}</h3>
                  <p>
                    {item.description ||
                      "Construction material supply, customer service and company activity."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta">
            <div>
              <h2>Ready to order construction materials?</h2>
              <p>
                Login as customer to view rates, place orders, download invoices,
                track delivery and manage your account.
              </p>
            </div>

            <button className="btn btn-primary" onClick={goOrder}>
              Order Now
            </button>
          </div>
        </section>

        <footer className="footer">
          <div className="footer-grid">
            <div>
              <h3>SARASKANA STEEL</h3>
              <p>
                Professional construction material supplier powered by STRIDE.
                Focused on quality materials, transparent billing and reliable
                delivery support.
              </p>
            </div>

            <div>
              <h3>Quick Links</h3>
              <Link to="/home">Home</Link>
              <Link to="/about">About</Link>
              <Link to="/Contact">Contact</Link>
              <Link to="/login">Login</Link>
            </div>

            <div>
              <h3>Products</h3>
              <p>Cement</p>
              <p>TMT Bar</p>
              <p>GC Sheet</p>
              <p>AC Sheet</p>
              <p>Pipe</p>
            </div>
          </div>

          <div className="footer-bottom">
            © {new Date().getFullYear()} SARASKANA STEEL | Powered by STRIDE
          </div>
        </footer>
      </div>
    </>
  );
}

export default About;