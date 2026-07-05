import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

type Product = {
  id: string;
  name: string;
  description?: string;
  price?: number;
  stock?: number;
  imageUrl?: string;
  category?: any;
  categoryName?: string;
  unit?: string;
};

type Offer = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  imageUrl?: string;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
};

function Home() {
  const navigate = useNavigate();
  const API = "https://saraskansteel-in.onrender.com";

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isCustomer = user?.role === "CUSTOMER";

  const [products, setProducts] = useState<Product[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [activeOffer, setActiveOffer] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const loadProducts = async () => {
    try {
      const res = await axios.get(`${API}/api/website-products`);

      const response = res.data;

      let finalProducts: Product[] = [];

      if (Array.isArray(response)) {
        finalProducts = response;
      } else if (Array.isArray(response.data)) {
        finalProducts = response.data;
      } else if (Array.isArray(response.products)) {
        finalProducts = response.products;
      } else if (Array.isArray(response.items)) {
        finalProducts = response.items;
      }

      setProducts(finalProducts);
    } catch (error) {
      console.log("Website product load error:", error);
      setProducts([]);
    }
  };

  const loadOffers = async () => {
    try {
      const res = await axios.get(`${API}/api/offers/active`);

      const data = res.data?.data || res.data?.offers || res.data || [];

      setOffers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.log("Offers load error", error);
    }
  };

  useEffect(() => {
    loadProducts();
    loadOffers();
  }, []);

  useEffect(() => {
    if (offers.length <= 1) return;

    const timer = setInterval(() => {
      setActiveOffer((prev) => (prev + 1) % offers.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [offers.length]);

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

  const getCategoryName = (product: Product) => {
    if (product.category?.name) return product.category.name;
    if (typeof product.category === "string") return product.category;
    if (product.categoryName) return product.categoryName;
    return "Construction Material";
  };

  const productImage = (product: Product) => {
    return (
      product.imageUrl ||
      "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80"
    );
  };

  const mainOffer = offers[activeOffer];

  const movingProducts =
    products.length > 0 ? [...products, ...products] : [];

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

        .home-site {
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
          min-height: 690px;
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          align-items: center;
          gap: 40px;
          padding: 78px 56px;
          overflow: hidden;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.94), rgba(41, 37, 36, 0.88)),
            url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1800&q=80");
          background-size: cover;
          background-position: center;
          color: white;
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
          filter: blur(3px);
        }

        .hero-content {
          position: relative;
          z-index: 2;
          max-width: 760px;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 16px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: #fde68a;
          font-weight: 1000;
          margin-bottom: 24px;
        }

        .hero h1 {
          font-size: 70px;
          line-height: 1.02;
          margin: 0;
          font-weight: 1000;
          letter-spacing: -1.5px;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          font-size: 19px;
          line-height: 1.8;
          margin: 24px 0 0;
          max-width: 720px;
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

        .hero-card {
          position: relative;
          z-index: 2;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.22);
          backdrop-filter: blur(18px);
          border-radius: 34px;
          padding: 28px;
          box-shadow: 0 28px 70px rgba(0, 0, 0, 0.32);
        }

        .hero-card-img {
          height: 310px;
          border-radius: 26px;
          background:
            linear-gradient(rgba(0,0,0,.10), rgba(0,0,0,.10)),
            url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center;
          margin-bottom: 18px;
        }

        .hero-card h3 {
          margin: 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .hero-card p {
          margin: 10px 0 0;
          font-size: 15px;
          line-height: 1.7;
          color: #e5e7eb;
        }

        .quick-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-top: -44px;
          padding: 0 56px;
          position: relative;
          z-index: 5;
        }

        .stat {
          background: white;
          border-radius: 24px;
          padding: 24px;
          box-shadow: 0 18px 38px rgba(15, 23, 42, 0.11);
          border: 1px solid #e5e7eb;
        }

        .stat strong {
          display: block;
          font-size: 30px;
          font-weight: 1000;
          color: #111827;
        }

        .stat span {
          display: block;
          color: #64748b;
          margin-top: 6px;
          font-weight: 800;
        }

        .section {
          padding: 74px 56px;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 32px;
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
          letter-spacing: -0.5px;
        }

        .section-head p {
          margin: 12px 0 0;
          color: #64748b;
          max-width: 720px;
          line-height: 1.7;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 18px;
        }

        .category-card {
          background: white;
          border-radius: 24px;
          padding: 22px;
          text-align: center;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.07);
          border: 1px solid #e5e7eb;
        }

        .category-icon {
          font-size: 38px;
          margin-bottom: 12px;
        }

        .category-card h3 {
          margin: 0;
          font-size: 17px;
        }

        .offer-box {
          background: linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 36px;
          overflow: hidden;
          min-height: 380px;
          display: grid;
          grid-template-columns: 1fr 0.85fr;
          box-shadow: 0 22px 55px rgba(15, 23, 42, 0.18);
        }

        .offer-content {
          padding: 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .offer-content h2 {
          margin: 0;
          font-size: 44px;
          line-height: 1.1;
          font-weight: 1000;
        }

        .offer-content h3 {
          margin: 12px 0 0;
          color: #fbbf24;
          font-size: 22px;
        }

        .offer-content p {
          color: #e5e7eb;
          line-height: 1.8;
          font-size: 17px;
          max-width: 650px;
        }

        .offer-image {
          min-height: 380px;
          background-size: cover;
          background-position: center;
        }

        .offer-dots {
          display: flex;
          gap: 8px;
          margin-top: 22px;
        }

        .offer-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: rgba(255,255,255,.35);
          border: none;
          cursor: pointer;
        }

        .offer-dot.active {
          width: 28px;
          border-radius: 999px;
          background: #f59e0b;
        }

        .product-showcase {
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.08), transparent 30%),
            #f8fafc;
          overflow: hidden;
        }

        .product-marquee {
          width: 100%;
          overflow: hidden;
          position: relative;
          margin-top: 28px;
          padding: 12px 0 22px;
        }

        .product-marquee::before,
        .product-marquee::after {
          content: "";
          position: absolute;
          top: 0;
          width: 110px;
          height: 100%;
          z-index: 5;
          pointer-events: none;
        }

        .product-marquee::before {
          left: 0;
          background: linear-gradient(to right, #f8fafc, transparent);
        }

        .product-marquee::after {
          right: 0;
          background: linear-gradient(to left, #f8fafc, transparent);
        }

        .product-track {
          display: flex;
          gap: 24px;
          width: max-content;
          animation: productMove 70s linear infinite;
        }

        .product-marquee:hover .product-track {
          animation-play-state: paused;
        }

        @keyframes productMove {
          from {
            transform: translateX(0);
          }

          to {
            transform: translateX(-50%);
          }
        }

        .dynamic-product-card {
          width: 310px;
          min-width: 310px;
          background: white;
          border-radius: 30px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 16px 38px rgba(15, 23, 42, 0.10);
          transition: 0.25s;
        }

        .dynamic-product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 55px rgba(15, 23, 42, 0.16);
        }

        .dynamic-product-img {
          height: 205px;
          background: linear-gradient(135deg, #fef3c7, #fed7aa);
          background-size: cover;
          background-position: center;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 58px;
        }

        .dynamic-product-info {
          padding: 22px;
        }

        .dynamic-product-category {
          display: inline-flex;
          background: #fef3c7;
          color: #92400e;
          padding: 7px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          margin-bottom: 12px;
        }

        .dynamic-product-info h3 {
          margin: 0;
          color: #111827;
          font-size: 22px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .dynamic-product-info p {
          color: #64748b;
          line-height: 1.6;
          margin: 10px 0 0;
          font-size: 14px;
        }

        .product-empty {
          border: 2px dashed #cbd5e1;
          border-radius: 28px;
          padding: 42px;
          text-align: center;
          color: #64748b;
          font-weight: 1000;
          background: white;
        }

        .why-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 22px;
        }

        .why-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .why-icon {
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

        .why-card h3 {
          margin: 0;
          font-size: 22px;
        }

        .why-card p {
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

        .contact-preview {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 26px;
          align-items: stretch;
        }

        .contact-card {
          background: white;
          border-radius: 30px;
          padding: 32px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.08);
        }

        .contact-card h3 {
          margin: 0 0 18px;
          font-size: 28px;
        }

        .contact-line {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          margin: 16px 0;
          color: #475569;
          line-height: 1.6;
          font-weight: 800;
        }

        .map-box {
          min-height: 360px;
          border-radius: 30px;
          background:
            linear-gradient(135deg, rgba(15, 23, 42, 0.82), rgba(41, 37, 36, 0.78)),
            url("https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          display: flex;
          align-items: flex-end;
          padding: 32px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.14);
        }

        .map-box h3 {
          margin: 0;
          font-size: 30px;
        }

        .map-box p {
          color: #e5e7eb;
          line-height: 1.7;
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

        @media(max-width: 1200px) {
          .category-grid {
            grid-template-columns: repeat(3, 1fr);
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
            grid-template-columns: 1fr;
            padding: 64px 22px;
          }

          .hero h1 {
            font-size: 48px;
          }

          .quick-stats {
            grid-template-columns: repeat(2, 1fr);
            padding: 0 22px;
          }

          .section {
            padding: 54px 22px;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .offer-box {
            grid-template-columns: 1fr;
          }

          .offer-image {
            min-height: 260px;
          }

          .why-grid,
          .process,
          .contact-preview,
          .footer-grid {
            grid-template-columns: 1fr;
          }

          .cta {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media(max-width: 700px) {
          .dynamic-product-card {
            width: 245px;
            min-width: 245px;
          }

          .dynamic-product-img {
            height: 165px;
          }

          .product-track {
            animation-duration: 45s;
          }

          .product-marquee::before,
          .product-marquee::after {
            width: 45px;
          }
        }

        @media(max-width: 600px) {
          .brand {
            font-size: 24px;
          }

          .hero h1 {
            font-size: 39px;
          }

          .hero p {
            font-size: 16px;
          }

          .quick-stats,
          .category-grid {
            grid-template-columns: 1fr;
          }

          .offer-content {
            padding: 28px;
          }

          .offer-content h2,
          .section-head h2,
          .cta h2 {
            font-size: 32px;
          }

          .cta {
            padding: 30px;
          }

          .footer {
            padding: 32px 22px;
          }
        }
      `}</style>

      <div className="home-site">
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
            <a href="#products">Products</a>
            <a href="#offers">Offers</a>
            <Link to="/contact">Contact</Link>

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

              <a href="#products" onClick={() => setMobileMenuOpen(false)}>
                🏗 Products
              </a>

              <a href="#offers" onClick={() => setMobileMenuOpen(false)}>
                🎁 Offers
              </a>

              <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
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
            <div className="hero-badge">🏗 Digital Material Ordering Platform</div>

            <h1>
              Build Stronger with <span>SARASKANA STEEL</span>
            </h1>

            <p>
              Order cement, TMT bar, pipes, sheets and construction materials
              with proper billing, delivery tracking, customer account history
              and reliable service.
            </p>

            <div className="hero-actions">
              <button className="btn btn-primary" onClick={goOrder}>
                Order Materials
              </button>

              <Link className="btn btn-light" to="/about">
                About Company
              </Link>
            </div>
          </div>

          <div className="hero-card">
            <div className="hero-card-img" />

            <h3>Professional Supply. Digital Control.</h3>

            <p>
              Customers can login to view rates, place orders, track deliveries,
              download invoices and manage reward points.
            </p>
          </div>
        </section>

        <div className="quick-stats">
          <div className="stat">
            <strong>6+</strong>
            <span>Product Categories</span>
          </div>

          <div className="stat">
            <strong>24/7</strong>
            <span>Digital Access</span>
          </div>

          <div className="stat">
            <strong>100%</strong>
            <span>Transparent Billing</span>
          </div>

          <div className="stat">
            <strong>STRIDE</strong>
            <span>Smart Ordering System</span>
          </div>
        </div>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Product Categories</div>
              <h2>Materials for every construction need</h2>
              <p>
                Browse the major material categories available from SARASKANA
                STEEL.
              </p>
            </div>

            <button className="btn btn-primary" onClick={goOrder}>
              View Products
            </button>
          </div>

          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">🏗</div>
              <h3>Cement</h3>
            </div>

            <div className="category-card">
              <div className="category-icon">🔩</div>
              <h3>TMT Bar</h3>
            </div>

            <div className="category-card">
              <div className="category-icon">🏠</div>
              <h3>GC Sheet</h3>
            </div>

            <div className="category-card">
              <div className="category-icon">🧱</div>
              <h3>AC Sheet</h3>
            </div>

            <div className="category-card">
              <div className="category-icon">🛠</div>
              <h3>Pipe</h3>
            </div>

            <div className="category-card">
              <div className="category-icon">🧪</div>
              <h3>Cement Chemical</h3>
            </div>
          </div>
        </section>

        <section className="section" id="offers">
          <div className="section-head">
            <div>
              <div className="eyebrow">Current Offers</div>
              <h2>Special updates from SARASKANA STEEL</h2>
              <p>
                Offers and announcements added by admin will appear here for
                public visitors and customers.
              </p>
            </div>
          </div>

          {mainOffer ? (
            <div
              className="offer-box"
              style={{
                background:
                  mainOffer.backgroundColor ||
                  "linear-gradient(135deg, #111827, #292524)",
              }}
            >
              <div className="offer-content">
                <h2>{mainOffer.title}</h2>

                {mainOffer.subtitle && <h3>{mainOffer.subtitle}</h3>}

                {mainOffer.description && <p>{mainOffer.description}</p>}

                <div>
                  <button className="btn btn-primary" onClick={goOrder}>
                    {mainOffer.buttonText || "Order Now"}
                  </button>
                </div>

                {offers.length > 1 && (
                  <div className="offer-dots">
                    {offers.map((_, index) => (
                      <button
                        key={index}
                        className={
                          index === activeOffer
                            ? "offer-dot active"
                            : "offer-dot"
                        }
                        onClick={() => setActiveOffer(index)}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div
                className="offer-image"
                style={{
                  backgroundImage: `url("${
                    mainOffer.imageUrl ||
                    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80"
                  }")`,
                }}
              />
            </div>
          ) : (
            <div className="offer-box">
              <div className="offer-content">
                <h2>Reliable materials for strong construction</h2>
                <h3>Latest updates will appear here</h3>
                <p>
                  Admin offers will appear here after adding them from the admin
                  panel.
                </p>
                <div>
                  <button className="btn btn-primary" onClick={goOrder}>
                    View Products
                  </button>
                </div>
              </div>

              <div
                className="offer-image"
                style={{
                  backgroundImage:
                    'url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1200&q=80")',
                }}
              />
            </div>
          )}
        </section>

        <section className="section product-showcase" id="products">
          <div className="section-head">
            <div>
              <div className="eyebrow">Product Preview</div>
              <h2>Explore available materials</h2>
              <p>
                Products added by admin will move automatically here in a
                dynamic display.
              </p>
            </div>

            <button className="btn btn-primary" onClick={goOrder}>
              Open Product Catalog
            </button>
          </div>

          {products.length === 0 ? (
            <div className="product-empty">
              Products will appear here after admin adds them.
            </div>
          ) : (
            <div className="product-marquee">
              <div className="product-track">
                {movingProducts.map((product, index) => (
                  <div
                    className="dynamic-product-card"
                    key={`${product.id}-${index}`}
                  >
                    <div
                      className="dynamic-product-img"
                      style={{
                        backgroundImage: `url("${productImage(product)}")`,
                      }}
                    />

                    <div className="dynamic-product-info">
                      <div className="dynamic-product-category">
                        {getCategoryName(product)}
                      </div>

                      <h3>{product.name}</h3>

                      <p>
                        {product.description ||
                          "Quality construction material available at SARASKANA STEEL."}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-head">
            <div>
              <div className="eyebrow">Why Choose Us</div>
              <h2>Professional service for construction supply</h2>
              <p>
                STRIDE helps SARASKANA STEEL manage orders, billing, stock,
                delivery and customers in a modern digital way.
              </p>
            </div>
          </div>

          <div className="why-grid">
            <div className="why-card">
              <div className="why-icon">✅</div>
              <h3>Quality Materials</h3>
              <p>
                Cement, steel, pipes and sheets supplied with focus on durability
                and trusted construction use.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon">🧾</div>
              <h3>Transparent Billing</h3>
              <p>
                Customers can view orders, invoices, payments and outstanding
                balance from their account.
              </p>
            </div>

            <div className="why-card">
              <div className="why-icon">🚚</div>
              <h3>Delivery Support</h3>
              <p>
                Orders can be tracked digitally from placement to delivery with
                proper status updates.
              </p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="process">
            <div className="process-step">
              <strong>1</strong>
              <h3>Login</h3>
              <p>Customer logs in with mobile number or customer ID.</p>
            </div>

            <div className="process-step">
              <strong>2</strong>
              <h3>Select Products</h3>
              <p>Choose cement, steel, pipes, sheets and other materials.</p>
            </div>

            <div className="process-step">
              <strong>3</strong>
              <h3>Place Order</h3>
              <p>Submit order with address and delivery details.</p>
            </div>

            <div className="process-step">
              <strong>4</strong>
              <h3>Track & Pay</h3>
              <p>Track order, download invoice and manage payments.</p>
            </div>
          </div>
        </section>

        <section className="section" id="contact">
          <div className="section-head">
            <div>
              <div className="eyebrow">Contact</div>
              <h2>Connect with SARASKANA STEEL</h2>
              <p>
                Visit our store, call us, or login to place orders directly from
                the STRIDE platform.
              </p>
            </div>

            <Link className="btn btn-primary" to="/contact">
              Contact Page
            </Link>
          </div>

          <div className="contact-preview">
            <div className="contact-card">
              <h3>Company Details</h3>

              <div className="contact-line">
                <span>🏢</span>
                <div>
                  <strong>SARASKANA STEEL</strong>
                  <br />
                  GSTIN-21BFVPS4336E1ZA
                </div>
              </div>

              <div className="contact-line">
                <span>📍</span>
                <div>Saraskana</div>
              </div>

              <div className="contact-line">
                <span>📞</span>
                <div>9438085096, 6371608996</div>
              </div>

              <div className="contact-line">
                <span>✉️</span>
                <div>SARSKANASTEEL@GMAIL.COM</div>
              </div>

              <button className="btn btn-primary" onClick={goOrder}>
                Order Now
              </button>
            </div>

            <div className="map-box">
              <div>
                <h3>Visit our store</h3>
                <p>
                  Get materials, billing support, order assistance and customer
                  account help from our team.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="cta">
            <div>
              <h2>Ready to order construction materials?</h2>
              <p>
                Login as customer to view rates, place orders, track delivery,
                download invoices and manage rewards.
              </p>
            </div>

            <button className="btn btn-primary" onClick={goOrder}>
              Start Ordering
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
              <Link to="/contact">Contact</Link>
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

export default Home;
