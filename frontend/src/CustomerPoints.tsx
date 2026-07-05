import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerPoints() {
  const [summary, setSummary] = useState<any>(null);
  const [gifts, setGifts] = useState<any[]>([]);
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [setting, setSetting] = useState<any>({
    redemptionOpen: true,
    message: "Redemption is open",
  });

  const [giftSearch, setGiftSearch] = useState("");
  const [claimSearch, setClaimSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState("");

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

  const customer = summary?.customer || user || {};

  const customerId =
    customer.id ||
    customer.customerRecordId ||
    user.id ||
    user.customerRecordId ||
    "";

  const customerNumber =
    customer.customerNumber ||
    customer.customerId ||
    customer.customerCode ||
    user.customerNumber ||
    user.customerId ||
    user.customerCode ||
    customer.id ||
    "-";

  const currentAvailablePoints = Number(
    summary?.points ||
      summary?.rewardPoints ||
      customer.points ||
      customer.rewardPoints ||
      0
  );

  const outstandingAmount = Number(
    summary?.outstanding ||
      summary?.creditAmount ||
      customer.outstandingAmount ||
      customer.creditAmount ||
      0
  );

  const isCreditBlocked = outstandingAmount > 1000;

  const totalPurchased = Number(
    summary?.totalPurchased ||
      summary?.totalPurchase ||
      customer.totalPurchased ||
      0
  );

  const totalOrders = Number(summary?.totalOrders || 0);

  const approvedRedemptions = redemptions.filter(
    (item) => item.status === "APPROVED" || item.status === "GIVEN"
  );

  const pendingRedemptions = redemptions.filter(
    (item) => item.status === "PENDING"
  );

  const rejectedRedemptions = redemptions.filter(
    (item) => item.status === "REJECTED"
  );

  const claimedPoints = approvedRedemptions.reduce(
    (sum, item) => sum + Number(item.pointsUsed || 0),
    0
  );

  const pendingPoints = pendingRedemptions.reduce(
    (sum, item) => sum + Number(item.pointsUsed || 0),
    0
  );

  const earnedPoints = currentAvailablePoints + claimedPoints;

  const loadData = async () => {
    try {
      setLoading(true);

      const [summaryRes, settingRes, giftsRes, myRedemptionsRes] =
        await Promise.allSettled([
          axios.get("http://localhost:5000/api/customer-portal/summary", {
            headers,
          }),
          axios.get("http://localhost:5000/api/rewards/setting", {
            headers,
          }),
          axios.get("http://localhost:5000/api/rewards/gifts", {
            headers,
          }),
          axios.get("http://localhost:5000/api/rewards/my-redemptions", {
            headers,
          }),
        ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value.data?.data || summaryRes.value.data || {});
      } else {
        setSummary({});
      }

      if (settingRes.status === "fulfilled") {
        setSetting(
          settingRes.value.data?.data ||
            settingRes.value.data || {
              redemptionOpen: true,
              message: "Redemption is open",
            }
        );
      }

      if (giftsRes.status === "fulfilled") {
        setGifts(giftsRes.value.data?.data || giftsRes.value.data?.gifts || []);
      } else {
        setGifts([]);
      }

      if (myRedemptionsRes.status === "fulfilled") {
        setRedemptions(
          myRedemptionsRes.value.data?.data ||
            myRedemptionsRes.value.data?.redemptions ||
            []
        );
      } else {
        setRedemptions([]);
      }
    } catch (error) {
      console.log("Reward page load error:", error);
      setSummary({});
      setGifts([]);
      setRedemptions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeGifts = gifts.filter((gift) => gift.active !== false);

  const filteredGifts = useMemo(() => {
    return activeGifts.filter((gift) => {
      const text = `
        ${gift.name || ""}
        ${gift.description || ""}
        ${gift.pointsRequired || ""}
      `.toLowerCase();

      return text.includes(giftSearch.toLowerCase());
    });
  }, [activeGifts, giftSearch]);

  const filteredRedemptions = useMemo(() => {
    return redemptions.filter((item) => {
      const text = `
        ${item.redemptionNo || ""}
        ${item.status || ""}
        ${item.gift?.name || ""}
        ${item.requestNote || ""}
        ${item.adminNote || ""}
      `.toLowerCase();

      return text.includes(claimSearch.toLowerCase());
    });
  }, [redemptions, claimSearch]);

  const giftAvailableInternally = (gift: any) => {
    return gift.active !== false && Number(gift.stock || 0) > 0;
  };

  const canClaimGift = (gift: any) => {
    if (!setting.redemptionOpen) return false;
    if (!giftAvailableInternally(gift)) return false;
    if (currentAvailablePoints < Number(gift.pointsRequired || 0)) return false;
    if (isCreditBlocked) return false;

    return true;
  };

  const getGiftButtonText = (gift: any) => {
    if (!setting.redemptionOpen) return "Redemption Closed";
    if (!giftAvailableInternally(gift)) return "Not Available";
    if (currentAvailablePoints < Number(gift.pointsRequired || 0)) {
      return "Not Enough Points";
    }
    if (isCreditBlocked) return "Clear Due First";

    return "Claim Gift";
  };

  const claimGift = async (gift: any) => {
    try {
      if (!canClaimGift(gift)) {
        alert(getGiftButtonText(gift));
        return;
      }

      const confirmClaim = confirm(
        `Claim "${gift.name}" for ${gift.pointsRequired} points?\n\nThis will create a pending request. Points will be finally adjusted only after admin approval.`
      );

      if (!confirmClaim) return;

      setClaimingId(gift.id);

      await axios.post(
        "http://localhost:5000/api/rewards/redeem",
        {
          customerId,
          giftId: gift.id,
          requestNote: "Customer requested gift claim",
        },
        { headers }
      );

      alert("Gift claim request submitted. Waiting for admin approval.");

      loadData();
    } catch (error: any) {
      console.log("Gift claim error:", error?.response?.data || error);

      alert(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          "Gift claim failed"
      );
    } finally {
      setClaimingId("");
    }
  };

  const statusClass = (status: string) => {
    if (status === "GIVEN") return "status-given";
    if (status === "APPROVED") return "status-approved";
    if (status === "REJECTED") return "status-rejected";
    return "status-pending";
  };

  const statusText = (status: string) => {
    if (status === "GIVEN") return "Gift Given";
    if (status === "APPROVED") return "Approved";
    if (status === "REJECTED") return "Rejected";
    return "Pending";
  };

  return (
    <CustomerLayout>
      <style>{`
        .points-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245,158,11,.16), transparent 30%),
            radial-gradient(circle at bottom right, rgba(15,23,42,.10), transparent 30%),
            #f8fafc;
          padding: 28px;
          color: #111827;
        }

        .hero {
          background:
            linear-gradient(135deg, rgba(17,24,39,.96), rgba(41,37,36,.93)),
            url("https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1600&q=80");
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

        .hero::after {
          content: "";
          position: absolute;
          width: 340px;
          height: 340px;
          border-radius: 50%;
          right: -120px;
          top: -120px;
          background: rgba(245,158,11,.24);
        }

        .hero-content,
        .hero-actions {
          position: relative;
          z-index: 2;
        }

        .hero-badge {
          display: inline-flex;
          background: rgba(255,255,255,.12);
          border: 1px solid rgba(255,255,255,.2);
          color: #fde68a;
          padding: 9px 15px;
          border-radius: 999px;
          font-weight: 1000;
          margin-bottom: 18px;
        }

        .hero h1 {
          margin: 0;
          font-size: 44px;
          font-weight: 1000;
        }

        .hero h1 span {
          color: #f59e0b;
        }

        .hero p {
          color: #e5e7eb;
          line-height: 1.8;
          margin: 14px 0 0;
          max-width: 760px;
        }

        .hero-actions {
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

        .points-main {
          display: grid;
          grid-template-columns: 1fr .75fr;
          gap: 24px;
          margin-bottom: 24px;
        }

        .points-card {
          background: linear-gradient(135deg, #111827, #292524);
          color: white;
          border-radius: 34px;
          padding: 34px;
          box-shadow: 0 24px 60px rgba(15,23,42,.18);
          position: relative;
          overflow: hidden;
        }

        .points-card::after {
          content: "";
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          right: -100px;
          top: -100px;
          background: rgba(245,158,11,.25);
        }

        .points-card-content {
          position: relative;
          z-index: 2;
        }

        .points-card small {
          color: #fbbf24;
          font-weight: 1000;
          text-transform: uppercase;
          letter-spacing: .8px;
        }

        .points-card h2 {
          margin: 12px 0 0;
          font-size: 72px;
          font-weight: 1000;
          line-height: 1;
        }

        .points-card p {
          color: #e5e7eb;
          line-height: 1.7;
          max-width: 720px;
          margin: 18px 0 0;
        }

        .points-card-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-top: 24px;
        }

        .points-mini {
          background: rgba(255,255,255,.10);
          border: 1px solid rgba(255,255,255,.16);
          border-radius: 18px;
          padding: 16px;
        }

        .points-mini span {
          display: block;
          color: #d1d5db;
          font-weight: 800;
          margin-bottom: 6px;
        }

        .points-mini b {
          color: white;
          font-size: 20px;
          font-weight: 1000;
        }

        .rules-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 34px;
          padding: 28px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
        }

        .rules-card h2 {
          margin: 0 0 18px;
          font-size: 28px;
          font-weight: 1000;
        }

        .rule-list {
          display: grid;
          gap: 14px;
        }

        .rule {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 15px;
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }

        .rule-icon {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #fef3c7;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 21px;
          flex-shrink: 0;
        }

        .rule b {
          display: block;
          margin-bottom: 4px;
          color: #111827;
        }

        .rule span {
          color: #64748b;
          line-height: 1.5;
          font-weight: 800;
        }

        .banner {
          border-radius: 24px;
          padding: 18px;
          margin-bottom: 24px;
          font-weight: 1000;
          display: flex;
          justify-content: space-between;
          gap: 14px;
          align-items: center;
        }

        .banner-open {
          background: #dcfce7;
          color: #166534;
          border: 1px solid #86efac;
        }

        .banner-closed,
        .banner-blocked {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
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

        .blue { color: #2563eb; }
        .green { color: #16a34a; }
        .red { color: #dc2626; }
        .orange { color: #d97706; }

        .gift-section,
        .claim-section {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          margin-bottom: 24px;
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
          font-size: 28px;
          font-weight: 1000;
        }

        .search {
          width: 100%;
          max-width: 360px;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
        }

        .search:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .gift-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 18px;
          align-items: stretch;
        }

        .gift-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 26px;
          overflow: hidden;
          box-shadow: 0 10px 24px rgba(15,23,42,.06);
          transition: .25s;
          display: flex;
          flex-direction: column;
          min-height: 520px;
        }

        .gift-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 42px rgba(15,23,42,.13);
        }

        .gift-img {
          height: 190px;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .gift-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .gift-placeholder {
          font-size: 58px;
        }

        .gift-body {
          padding: 18px;
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .gift-body h3 {
          margin: 0;
          font-size: 21px;
          font-weight: 1000;
          line-height: 1.25;
        }

        .gift-description {
          margin: 10px 0 15px;
          color: #64748b;
          line-height: 1.6;
          font-weight: 800;
          flex: 1;
        }

        .gift-info {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 14px;
        }

        .gift-box {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 12px;
        }

        .gift-box small {
          display: block;
          color: #64748b;
          font-weight: 1000;
          margin-bottom: 5px;
        }

        .gift-box b {
          color: #111827;
          font-weight: 1000;
        }

        .gift-action {
          margin-top: auto;
        }

        .gift-action button {
          width: 100%;
        }

        .gift-action button:disabled {
          background: #94a3b8;
          color: white;
          cursor: not-allowed;
          box-shadow: none;
        }

        .claim-grid {
          display: grid;
          gap: 14px;
        }

        .claim-card {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 22px;
          padding: 16px;
          display: grid;
          grid-template-columns: 90px 1fr auto;
          gap: 16px;
          align-items: center;
        }

        .claim-img {
          width: 90px;
          height: 90px;
          border-radius: 18px;
          background: #e5e7eb;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 38px;
        }

        .claim-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .claim-card h3 {
          margin: 0;
          font-size: 20px;
          font-weight: 1000;
        }

        .claim-card p {
          margin: 7px 0 0;
          color: #64748b;
          font-weight: 800;
          line-height: 1.6;
        }

        .status {
          padding: 9px 14px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .status-pending {
          background: #fef3c7;
          color: #92400e;
        }

        .status-approved {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .status-given {
          background: #dcfce7;
          color: #166534;
        }

        .status-rejected {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          padding: 34px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
        }

        @media(max-width: 1100px) {
          .hero,
          .points-main {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 700px) {
          .points-page {
            padding: 14px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
          }

          .hero h1 {
            font-size: 34px;
          }

          .hero-actions,
          .btn {
            width: 100%;
          }

          .points-card h2 {
            font-size: 54px;
          }

          .points-card-row,
          .summary-grid,
          .gift-info {
            grid-template-columns: 1fr;
          }

          .section-head,
          .banner {
            flex-direction: column;
            align-items: flex-start;
          }

          .search {
            max-width: 100%;
          }

          .claim-card {
            grid-template-columns: 1fr;
          }

          .claim-img {
            width: 100%;
            height: 180px;
          }
        }
      `}</style>

      <div className="points-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">🎁 Reward Gifts</div>

            <h1>
              Claim your <span>admin rewards</span>
            </h1>

            <p>
              Gifts are controlled by admin. You can claim only when redemption
              is open, your due amount is within limit and you have enough
              available points.
            </p>
          </div>

          <div className="hero-actions">
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

        <div className="points-main">
          <div className="points-card">
            <div className="points-card-content">
              <small>Available Points</small>
              <h2>{currentAvailablePoints}</h2>

              <p>
                Customer ID: <b>{customerNumber}</b>. Earned points never
                reduce. Available points are used for approved gift claims.
              </p>

              <div className="points-card-row">
                <div className="points-mini">
                  <span>Earned Points</span>
                  <b>{earnedPoints}</b>
                </div>

                <div className="points-mini">
                  <span>Claimed Points</span>
                  <b>{claimedPoints}</b>
                </div>

                <div className="points-mini">
                  <span>Pending Points</span>
                  <b>{pendingPoints}</b>
                </div>
              </div>
            </div>
          </div>

          <div className="rules-card">
            <h2>Claim Rules</h2>

            <div className="rule-list">
              <div className="rule">
                <div className="rule-icon">🎛</div>
                <div>
                  <b>Admin redemption must be open</b>
                  <span>When admin closes redemption, customers cannot claim.</span>
                </div>
              </div>

              <div className="rule">
                <div className="rule-icon">⭐</div>
                <div>
                  <b>Enough available points</b>
                  <span>Customer must have enough available points.</span>
                </div>
              </div>

              <div className="rule">
                <div className="rule-icon">💳</div>
                <div>
                  <b>Outstanding limit</b>
                  <span>Due amount must be ₹1000 or less to claim gifts.</span>
                </div>
              </div>

              <div className="rule">
                <div className="rule-icon">📦</div>
                <div>
                  <b>Gift must be available</b>
                  <span>Stock is checked internally but not shown to customer.</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          className={
            setting.redemptionOpen ? "banner banner-open" : "banner banner-closed"
          }
        >
          <div>
            {setting.redemptionOpen
              ? "✅ Redemption is OPEN"
              : "⛔ Redemption is CLOSED"}
          </div>

          <div>{setting.message || "-"}</div>
        </div>

        {isCreditBlocked && (
          <div className="banner banner-blocked">
            <div>⛔ Gift Claim Locked</div>

            <div>
              Outstanding is ₹{money(outstandingAmount)}. Please clear due
              amount to ₹1000 or below.
            </div>
          </div>
        )}

        <div className="summary-grid">
          <div className="summary-card">
            <div className="summary-icon">⭐</div>
            <h3>Earned Points</h3>
            <h2 className="blue">{earnedPoints}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">🎁</div>
            <h3>Available Points</h3>
            <h2 className="green">{currentAvailablePoints}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">📤</div>
            <h3>Claimed Points</h3>
            <h2 className="red">{claimedPoints}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💳</div>
            <h3>Outstanding</h3>
            <h2 className="orange">₹{money(outstandingAmount)}</h2>
          </div>
        </div>

        <div className="gift-section">
          <div className="section-head">
            <h2>Admin Created Gifts</h2>

            <input
              className="search"
              placeholder="Search gift..."
              value={giftSearch}
              onChange={(e) => setGiftSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty">Loading gifts...</div>
          ) : filteredGifts.length === 0 ? (
            <div className="empty">
              No active gifts found. Admin can create gifts from Reward
              Management.
            </div>
          ) : (
            <div className="gift-grid">
              {filteredGifts.map((gift) => (
                <div className="gift-card" key={gift.id}>
                  <div className="gift-img">
                    {gift.imageUrl ? (
                      <img src={gift.imageUrl} alt={gift.name} />
                    ) : (
                      <div className="gift-placeholder">🎁</div>
                    )}
                  </div>

                  <div className="gift-body">
                    <h3>{gift.name}</h3>

                    <p className="gift-description">
                      {gift.description || "Admin reward gift."}
                    </p>

                    <div className="gift-info">
                      <div className="gift-box">
                        <small>Points Required</small>
                        <b>{gift.pointsRequired || 0}</b>
                      </div>

                      <div className="gift-box">
                        <small>Status</small>
                        <b>
                          {giftAvailableInternally(gift)
                            ? "Available"
                            : "Not Available"}
                        </b>
                      </div>
                    </div>

                    <div className="gift-action">
                      <button
                        className="btn btn-primary"
                        disabled={!canClaimGift(gift) || claimingId === gift.id}
                        onClick={() => claimGift(gift)}
                      >
                        {claimingId === gift.id
                          ? "Submitting..."
                          : getGiftButtonText(gift)}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="claim-section">
          <div className="section-head">
            <h2>My Claimed Gifts</h2>

            <input
              className="search"
              placeholder="Search claimed gift..."
              value={claimSearch}
              onChange={(e) => setClaimSearch(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="empty">Loading claimed gifts...</div>
          ) : filteredRedemptions.length === 0 ? (
            <div className="empty">No claimed gifts found.</div>
          ) : (
            <div className="claim-grid">
              {filteredRedemptions.map((item) => (
                <div className="claim-card" key={item.id}>
                  <div className="claim-img">
                    {item.gift?.imageUrl ? (
                      <img src={item.gift.imageUrl} alt={item.gift?.name} />
                    ) : (
                      "🎁"
                    )}
                  </div>

                  <div>
                    <h3>{item.gift?.name || "Reward Gift"}</h3>

                    <p>
                      Claim No: {item.redemptionNo || "-"}
                      <br />
                      Points: {item.pointsUsed || 0}
                      <br />
                      Claimed On: {formatDate(item.createdAt)}
                      {item.adminNote && (
                        <>
                          <br />
                          Admin Note: {item.adminNote}
                        </>
                      )}
                    </p>
                  </div>

                  <span className={`status ${statusClass(item.status)}`}>
                    {statusText(item.status)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerPoints;