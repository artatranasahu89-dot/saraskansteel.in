import { Link } from "react-router-dom";
import AdminLayout from "./AdminLayout";

function AdminWebsiteManagement() {
  return (
    <AdminLayout>
      <style>{`
        .website-page {
          padding: 34px;
          min-height: calc(100vh - 80px);
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.18), transparent 34%),
            radial-gradient(circle at bottom right, rgba(37,99,235,.14), transparent 34%),
            #f8fafc;
        }

        .website-hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.92)),
            url("https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 42px;
          box-shadow: 0 22px 55px rgba(15,23,42,.24);
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
        }

        .website-hero h1 {
          margin: 0;
          font-size: 42px;
          font-weight: 1000;
        }

        .website-hero p {
          color: #e5e7eb;
          line-height: 1.8;
          max-width: 760px;
          margin: 12px 0 0;
          font-size: 16px;
        }

        .website-badge {
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          padding: 14px 18px;
          border-radius: 18px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .management-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .manage-card {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 28px;
          box-shadow: 0 16px 36px rgba(15,23,42,.09);
          text-decoration: none;
          color: #111827;
          transition: .25s;
          position: relative;
          overflow: hidden;
        }

        .manage-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 26px 55px rgba(15,23,42,.15);
        }

        .manage-card::after {
          content: "";
          position: absolute;
          width: 140px;
          height: 140px;
          right: -55px;
          top: -55px;
          background: rgba(245,158,11,.14);
          border-radius: 50%;
        }

        .card-icon {
          width: 68px;
          height: 68px;
          border-radius: 22px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 34px;
          margin-bottom: 22px;
          position: relative;
          z-index: 2;
        }

        .manage-card h2 {
          margin: 0;
          font-size: 25px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .manage-card p {
          color: #64748b;
          line-height: 1.7;
          margin: 12px 0 22px;
          position: relative;
          z-index: 2;
        }

        .card-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: #111827;
          color: white;
          padding: 13px 18px;
          border-radius: 15px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .coming {
          background: #e5e7eb;
          color: #475569;
        }

        .info-section {
          margin-top: 30px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .info-card {
          background: white;
          border-radius: 30px;
          padding: 28px;
          border: 1px solid #e5e7eb;
          box-shadow: 0 14px 34px rgba(15,23,42,.08);
        }

        .info-card h3 {
          margin: 0 0 16px;
          font-size: 24px;
          font-weight: 1000;
        }

        .info-card ul {
          margin: 0;
          padding-left: 20px;
          color: #475569;
          line-height: 1.9;
          font-weight: 700;
        }

        @media(max-width: 1100px) {
          .management-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 800px) {
          .website-page {
            padding: 18px;
          }

          .website-hero {
            flex-direction: column;
            align-items: flex-start;
            padding: 30px;
          }

          .website-hero h1 {
            font-size: 32px;
          }

          .management-grid,
          .info-section {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="website-page">
        <div className="website-hero">
          <div>
            <h1>Website Management</h1>
            <p>
              Manage the public SARASKANA STEEL website from one place. Update
              owner messages, gallery photos, offers and other website content.
            </p>
          </div>

          <div className="website-badge">🌐 Public Website Control</div>
        </div>

        <div className="management-grid">
          <Link className="manage-card" to="/admin-owner-message">
            <div className="card-icon">👤</div>
            <h2>Owner & Co-owner Message</h2>
            <p>
              Update owner photo, co-owner photo, names, designations and
              messages shown on the About page.
            </p>
            <span className="card-btn">Manage Message</span>
          </Link>

          <Link className="manage-card" to="/admin-gallery">
            <div className="card-icon">🖼️</div>
            <h2>Website Gallery</h2>
            <p>
              Upload, edit, hide or delete company gallery images shown on the
              public About page.
            </p>
            <span className="card-btn">Manage Gallery</span>
          </Link>

          <Link className="manage-card" to="/admin-offers">
            <div className="card-icon">🎁</div>
            <h2>Website Offers</h2>
            <p>
              Manage website banners, offers, announcements and homepage
              promotional sections.
            </p>
            <span className="card-btn">Manage Offers</span>
          </Link>

          <div className="manage-card">
            <div className="card-icon">🏠</div>
            <h2>Home Page Settings</h2>
            <p>
              Later we will manage homepage banner, title, subtitle and company
              highlights from here.
            </p>
            <span className="card-btn coming">Coming Later</span>
          </div>

          <div className="manage-card">
            <div className="card-icon">📞</div>
            <h2>Contact Details</h2>
            <p>
              Later we will manage phone number, email, address, WhatsApp and
              business hours from here.
            </p>
            <span className="card-btn coming">Coming Later</span>
          </div>

          <div className="manage-card">
            <div className="card-icon">ℹ️</div>
            <h2>About Company Content</h2>
            <p>
              Later we will manage company story, values and about page content
              from admin.
            </p>
            <span className="card-btn coming">Coming Later</span>
          </div>
        </div>

        <div className="info-section">
          <div className="info-card">
            <h3>Currently Active</h3>
            <ul>
              <li>Owner & co-owner message management</li>
              <li>Gallery image management</li>
              <li>Offer/banner management</li>
              <li>Public Home, About and Contact pages</li>
            </ul>
          </div>

          <div className="info-card">
            <h3>Next Website Controls</h3>
            <ul>
              <li>Editable contact details</li>
              <li>Editable homepage hero text</li>
              <li>Editable about company text</li>
              <li>Website SEO and footer settings</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminWebsiteManagement;