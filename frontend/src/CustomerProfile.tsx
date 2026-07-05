import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerProfile() {
  const [summary, setSummary] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const [addressForm, setAddressForm] = useState({
    label: "",
    contactPerson: "",
    mobile: "",
    addressLine1: "",
    addressLine2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const headers = {
    Authorization: "Bearer " + token,
  };

  const money = (value: any) =>
    Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const onlyDigits = (value: any) => {
    return String(value || "").replace(/\D/g, "").slice(0, 10);
  };

  const getCustomerId = (customer: any) => {
    return (
      customer?.customerNumber ||
      customer?.customerId ||
      customer?.customerCode ||
      customer?.id ||
      "-"
    );
  };

  const loadProfile = async () => {
    try {
      setLoading(true);

      const summaryRes = await axios.get(
        "http://localhost:5000/api/customer-portal/summary",
        { headers }
      );

      setSummary(summaryRes.data?.data || summaryRes.data || {});

      try {
        const addressRes = await axios.get(
          "http://localhost:5000/api/customer-addresses",
          { headers }
        );

        setAddresses(addressRes.data?.data || addressRes.data?.addresses || []);
      } catch (addressError) {
        console.log("Address load skipped:", addressError);
        setAddresses([]);
      }
    } catch (error) {
      console.log("Customer profile load error:", error);
      setSummary({});
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const customer = summary?.customer || user || {};

  const resetAddressForm = () => {
    setAddressForm({
      label: "",
      contactPerson: "",
      mobile: "",
      addressLine1: "",
      addressLine2: "",
      landmark: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
  };

  const saveAddress = async () => {
    try {
      if (!addressForm.addressLine1.trim()) {
        alert("Address Line 1 is required");
        return;
      }

      if (addressForm.mobile.trim() && onlyDigits(addressForm.mobile).length !== 10) {
        alert("Mobile number must be 10 digits, or leave it empty.");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/customer-addresses",
        {
          ...addressForm,
          mobile: onlyDigits(addressForm.mobile),
        },
        { headers }
      );

      alert("Address added successfully");

      resetAddressForm();
      setShowAddressForm(false);
      loadProfile();
    } catch (error: any) {
      console.log("Save address error:", error?.response?.data || error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Address save failed"
      );
    }
  };

  const setDefaultAddress = async (id: string) => {
    try {
      await axios.put(
        `http://localhost:5000/api/customer-addresses/${id}/default`,
        {},
        { headers }
      );

      loadProfile();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to set default address"
      );
    }
  };

  const deleteAddress = async (id: string) => {
    try {
      if (!confirm("Delete this address?")) return;

      await axios.delete(`http://localhost:5000/api/customer-addresses/${id}`, {
        headers,
      });

      loadProfile();
    } catch (error: any) {
      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Failed to delete address"
      );
    }
  };

  const changePassword = async () => {
    try {
      if (!passwordForm.currentPassword || !passwordForm.newPassword) {
        alert("Current password and new password are required");
        return;
      }

      if (passwordForm.newPassword.length < 4) {
        alert("New password must be at least 4 characters");
        return;
      }

      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        alert("New password and confirm password do not match");
        return;
      }

      await axios.post(
        "http://localhost:5000/api/customer-auth/change-password",
        {
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        },
        { headers }
      );

      alert("Password changed successfully");

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowPasswordForm(false);
    } catch (error: any) {
      console.log("Password change error:", error?.response?.data || error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Password change failed"
      );
    }
  };

  return (
    <CustomerLayout>
      <style>{`
        .profile-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          color: #111827;
        }

        .profile-hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 36px;
          margin-bottom: 24px;
          box-shadow: 0 24px 60px rgba(15,23,42,.24);
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 24px;
          align-items: center;
          position: relative;
          overflow: hidden;
        }

        .profile-hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.22);
        }

        .profile-hero-content,
        .profile-hero-actions {
          position: relative;
          z-index: 2;
        }

        .profile-badge {
          display: inline-flex;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          color: #fde68a;
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 1000;
          margin-bottom: 18px;
        }

        .profile-user {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .avatar {
          width: 82px;
          height: 82px;
          border-radius: 26px;
          background: linear-gradient(135deg, #f59e0b, #92400e);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 34px;
          font-weight: 1000;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 16px 30px rgba(0,0,0,.24);
        }

        .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .profile-hero h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 1000;
          letter-spacing: -0.5px;
        }

        .profile-hero h1 span {
          color: #f59e0b;
        }

        .profile-hero p {
          color: #e5e7eb;
          line-height: 1.8;
          margin: 12px 0 0;
          max-width: 760px;
        }

        .profile-hero-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn {
          border: none;
          border-radius: 16px;
          padding: 13px 18px;
          font-weight: 1000;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-size: 15px;
          white-space: nowrap;
        }

        .btn-primary {
          background: #f59e0b;
          color: #111827;
          box-shadow: 0 14px 26px rgba(245,158,11,.25);
        }

        .btn-dark {
          background: #111827;
          color: white;
        }

        .btn-light {
          background: rgba(255,255,255,.12);
          color: white;
          border: 1px solid rgba(255,255,255,.22);
        }

        .btn-blue {
          background: #2563eb;
          color: white;
        }

        .btn-green {
          background: #16a34a;
          color: white;
        }

        .btn-red {
          background: #dc2626;
          color: white;
        }

        .btn-gray {
          background: #64748b;
          color: white;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
          margin-bottom: 24px;
        }

        .summary-card {
          background: rgba(255,255,255,.92);
          backdrop-filter: blur(18px);
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          position: relative;
          overflow: hidden;
        }

        .summary-card::after {
          content: "";
          position: absolute;
          width: 120px;
          height: 120px;
          right: -52px;
          top: -52px;
          background: rgba(245,158,11,.14);
          border-radius: 50%;
        }

        .summary-icon {
          width: 54px;
          height: 54px;
          border-radius: 18px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          margin-bottom: 14px;
          position: relative;
          z-index: 2;
        }

        .summary-card h3 {
          margin: 0;
          color: #64748b;
          font-size: 14px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .summary-card h2 {
          margin: 9px 0 0;
          font-size: 30px;
          font-weight: 1000;
          position: relative;
          z-index: 2;
        }

        .green { color: #16a34a; }
        .blue { color: #2563eb; }
        .red { color: #dc2626; }
        .orange { color: #d97706; }

        .content-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 22px;
          margin-bottom: 22px;
        }

        .section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
        }

        .section.full {
          grid-column: 1 / -1;
        }

        .section-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }

        .section-head h2 {
          margin: 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        .info {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 15px;
          color: #111827;
          font-weight: 900;
          line-height: 1.6;
        }

        .info small {
          display: block;
          color: #64748b;
          font-weight: 1000;
          margin-bottom: 5px;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }

        .quick {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 18px;
          text-decoration: none;
          color: #111827;
          font-weight: 1000;
          transition: .25s;
        }

        .quick:hover {
          transform: translateY(-5px);
          box-shadow: 0 16px 32px rgba(15,23,42,.12);
        }

        .quick span {
          display: block;
          font-size: 30px;
          margin-bottom: 10px;
        }

        .security-box {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.92)),
            url("https://images.unsplash.com/photo-1555949963-aa79dcee981c?auto=format&fit=crop&w=900&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 24px;
          padding: 24px;
        }

        .security-box p {
          color: #e5e7eb;
          line-height: 1.7;
        }

        .input {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
          margin-bottom: 12px;
        }

        .input:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .address-form {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 18px;
        }

        .address-form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .address-form-grid .full {
          grid-column: 1 / -1;
        }

        .address-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }

        .address-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          padding: 18px;
          transition: .25s;
        }

        .address-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 16px 32px rgba(15,23,42,.10);
        }

        .badge {
          display: inline-flex;
          padding: 6px 12px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-size: 12px;
          font-weight: 1000;
          margin-bottom: 10px;
        }

        .address-card h3 {
          margin: 0 0 10px;
          font-size: 20px;
          font-weight: 1000;
        }

        .address-card p {
          color: #475569;
          line-height: 1.7;
          font-weight: 800;
        }

        .actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .empty {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          padding: 30px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
        }

        @media(max-width: 1100px) {
          .profile-hero,
          .content-grid {
            grid-template-columns: 1fr;
          }

          .summary-grid,
          .quick-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 700px) {
          .profile-page {
            padding: 14px;
          }

          .profile-hero {
            padding: 26px;
            border-radius: 26px;
          }

          .profile-user {
            flex-direction: column;
            align-items: flex-start;
          }

          .profile-hero h1 {
            font-size: 34px;
          }

          .summary-grid,
          .info-grid,
          .quick-grid,
          .address-form-grid {
            grid-template-columns: 1fr;
          }

          .section-head {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn {
            width: 100%;
          }

          .actions {
            width: 100%;
          }
        }
      `}</style>

      <div className="profile-page">
        <div className="profile-hero">
          <div className="profile-hero-content">
            <div className="profile-badge">👤 Customer Profile</div>

            <div className="profile-user">
              <div className="avatar">
                {customer?.profileImage ? (
                  <img src={customer.profileImage} alt={customer?.name || "Customer"} />
                ) : (
                  (customer?.name || "C").charAt(0)
                )}
              </div>

              <div>
                <h1>
                  {customer?.name || "Customer"} <span>Account</span>
                </h1>

                <p>
                  Customer ID: <b>{getCustomerId(customer)}</b> | Mobile:{" "}
                  <b>{customer?.mobile || "-"}</b>
                </p>
              </div>
            </div>
          </div>

          <div className="profile-hero-actions">
            <Link className="btn btn-primary" to="/customer-shop">
              🛒 Shop Products
            </Link>

            <Link className="btn btn-light" to="/customer-dashboard">
              📊 Dashboard
            </Link>

            <Link className="btn btn-light" to="/home">
              🏠 Home
            </Link>
          </div>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">📦</div>
            <h3>Total Orders</h3>
            <h2>{summary?.totalOrders || 0}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Total Purchase</h3>
            <h2>₹{money(summary?.totalPurchased)}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <h3>Outstanding</h3>
            <h2 className="red">₹{money(summary?.outstanding)}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <h3>Reward Points</h3>
            <h2 className="blue">{summary?.points || 0}</h2>
          </div>
        </div>

        {loading ? (
          <div className="empty">Loading profile...</div>
        ) : (
          <>
            <div className="content-grid">
              <div className="section">
                <div className="section-head">
                  <h2>Personal Information</h2>
                </div>

                <div className="info-grid">
                  <div className="info">
                    <small>Name</small>
                    {customer?.name || "-"}
                  </div>

                  <div className="info">
                    <small>Customer ID</small>
                    {getCustomerId(customer)}
                  </div>

                  <div className="info">
                    <small>Mobile</small>
                    {customer?.mobile || "-"}
                  </div>

                  <div className="info">
                    <small>Email</small>
                    {customer?.email || "-"}
                  </div>

                  <div className="info">
                    <small>Date of Birth</small>
                    {formatDate(customer?.dateOfBirth)}
                  </div>

                  <div className="info">
                    <small>GST Number</small>
                    {customer?.gstNumber || "-"}
                  </div>

                  <div className="info">
                    <small>Address</small>
                    {customer?.address || "-"}
                  </div>

                  <div className="info">
                    <small>Account Status</small>
                    {customer?.active === false ? "Inactive" : "Active"}
                  </div>
                </div>
              </div>

              <div className="section">
                <div className="security-box">
                  <h2>🔐 Account Security</h2>

                  <p>
                    Keep your STRIDE customer account secure by updating your
                    password regularly.
                  </p>

                  <button
                    className="btn btn-primary"
                    onClick={() => setShowPasswordForm(!showPasswordForm)}
                  >
                    {showPasswordForm ? "Close Password Form" : "Change Password"}
                  </button>
                </div>

                {showPasswordForm && (
                  <div style={{ marginTop: 18 }}>
                    <input
                      className="input"
                      type="password"
                      placeholder="Current Password"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          currentPassword: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input"
                      type="password"
                      placeholder="New Password"
                      value={passwordForm.newPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          newPassword: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input"
                      type="password"
                      placeholder="Confirm New Password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) =>
                        setPasswordForm({
                          ...passwordForm,
                          confirmPassword: e.target.value,
                        })
                      }
                    />

                    <button className="btn btn-green" onClick={changePassword}>
                      Save Password
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="section" style={{ marginBottom: 22 }}>
              <div className="section-head">
                <h2>Quick Actions</h2>
              </div>

              <div className="quick-grid">
                <Link className="quick" to="/customer-orders">
                  <span>📦</span>
                  My Orders
                </Link>

                <Link className="quick" to="/customer-track-delivery">
                  <span>🚚</span>
                  Track Delivery
                </Link>

                <Link className="quick" to="/customer-invoices">
                  <span>🧾</span>
                  My Bills
                </Link>

                <Link className="quick" to="/customer-points">
                  <span>🎁</span>
                  Rewards
                </Link>
              </div>
            </div>

            <div className="section">
              <div className="section-head">
                <h2>Delivery Addresses</h2>

                <button
                  className="btn btn-dark"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                >
                  {showAddressForm ? "Close Form" : "+ Add Address"}
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form">
                  <div className="address-form-grid">
                    <input
                      className="input"
                      placeholder="Label: Home / Shop / Site"
                      value={addressForm.label}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, label: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder="Contact Person"
                      value={addressForm.contactPerson}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          contactPerson: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input"
                      placeholder="Mobile optional"
                      value={addressForm.mobile}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          mobile: onlyDigits(e.target.value),
                        })
                      }
                    />

                    <input
                      className="input full"
                      placeholder="Address Line 1 *"
                      value={addressForm.addressLine1}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine1: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input full"
                      placeholder="Address Line 2"
                      value={addressForm.addressLine2}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          addressLine2: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input"
                      placeholder="Landmark"
                      value={addressForm.landmark}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          landmark: e.target.value,
                        })
                      }
                    />

                    <input
                      className="input"
                      placeholder="City"
                      value={addressForm.city}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, city: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder="State"
                      value={addressForm.state}
                      onChange={(e) =>
                        setAddressForm({ ...addressForm, state: e.target.value })
                      }
                    />

                    <input
                      className="input"
                      placeholder="Pincode"
                      value={addressForm.pincode}
                      onChange={(e) =>
                        setAddressForm({
                          ...addressForm,
                          pincode: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="actions">
                    <button className="btn btn-green" onClick={saveAddress}>
                      Save Address
                    </button>

                    <button
                      className="btn btn-gray"
                      onClick={() => {
                        resetAddressForm();
                        setShowAddressForm(false);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {addresses.length === 0 ? (
                <div className="empty">No delivery addresses added.</div>
              ) : (
                <div className="address-grid">
                  {addresses.map((address) => (
                    <div className="address-card" key={address.id}>
                      {address.isDefault && <span className="badge">DEFAULT</span>}

                      <h3>{address.label || "Delivery Address"}</h3>

                      <p>
                        {address.contactPerson && (
                          <>
                            <b>{address.contactPerson}</b>
                            <br />
                          </>
                        )}

                        {address.mobile && (
                          <>
                            📞 {address.mobile}
                            <br />
                          </>
                        )}

                        {address.addressLine1}
                        {address.addressLine2 ? `, ${address.addressLine2}` : ""}
                        {address.landmark ? `, ${address.landmark}` : ""}
                        <br />
                        {address.city}
                        {address.state ? `, ${address.state}` : ""}{" "}
                        {address.pincode ? `- ${address.pincode}` : ""}
                      </p>

                      <div className="actions">
                        {!address.isDefault && (
                          <button
                            className="btn btn-blue"
                            onClick={() => setDefaultAddress(address.id)}
                          >
                            Set Default
                          </button>
                        )}

                        <button
                          className="btn btn-red"
                          onClick={() => deleteAddress(address.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerProfile;