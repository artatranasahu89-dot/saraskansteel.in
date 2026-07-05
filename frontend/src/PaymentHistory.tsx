import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function PaymentHistory() {
  const params = new URLSearchParams(window.location.search);
  const searchParam = params.get("search");

  let defaultMobile = "";
  let defaultCustomerId = "";

  try {
    if (searchParam) {
      const parsed = JSON.parse(decodeURIComponent(searchParam));
      defaultMobile = parsed.mobile || "";
      defaultCustomerId = parsed.customerId || "";
    }
  } catch {
    defaultMobile = searchParam || "";
  }

  const [payments, setPayments] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    date: "",
    source: "",
    paymentMode: "",
    mobile: defaultMobile,
    customerId: defaultCustomerId,
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadPayments = async (customFilters = filters) => {
    const query = new URLSearchParams();

    Object.entries(customFilters).forEach(([key, value]) => {
      if (value) query.append(key, value);
    });

    const res = await axios.get(
      "http://localhost:5000/api/payments?" + query.toString(),
      { headers }
    );

    setPayments(res.data.data || []);
  };

  useEffect(() => {
    loadPayments({
      date: "",
      source: "",
      paymentMode: "",
      mobile: defaultMobile,
      customerId: defaultCustomerId,
    });
  }, []);

  const total = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const cash = payments.filter((p) => p.paymentMode === "CASH").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const upi = payments.filter((p) => p.paymentMode === "UPI").reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const bank = payments.filter((p) => p.paymentMode === "BANK").reduce((sum, p) => sum + Number(p.amount || 0), 0);

  const showingFor =
    defaultMobile && defaultCustomerId
      ? `${defaultMobile} / ${defaultCustomerId}`
      : defaultMobile || defaultCustomerId;

  return (
    <AdminLayout>
      <style>{`
        .page{min-height:100vh;background:#f3f4f6;padding:24px;color:#111827}
        .header{background:linear-gradient(135deg,#111827,#1f2937);color:white;border-radius:18px;padding:22px;margin-bottom:20px}
        .summary-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .summary-card,.filters,.payment-card{background:white;border-radius:16px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08)}
        .summary-card h3{margin:0;color:#6b7280;font-size:14px}
        .summary-card h2{margin:8px 0 0}
        .filters{display:grid;grid-template-columns:repeat(6,minmax(140px,1fr));gap:10px;margin-bottom:20px}
        .input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db}
        .btn{border:none;border-radius:10px;padding:11px 13px;background:#111827;color:white;font-weight:800;cursor:pointer}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(330px,1fr));gap:16px}
        .top{display:flex;justify-content:space-between;gap:10px;margin-bottom:10px}
        .badge{padding:6px 10px;border-radius:999px;font-size:12px;font-weight:900;background:#dbeafe;color:#1d4ed8}
        .amount{font-size:24px;font-weight:900;color:#16a34a;margin:10px 0}
        .info{display:grid;gap:6px;color:#374151}
        @media(max-width:900px){.summary-grid{grid-template-columns:1fr 1fr}.filters{grid-template-columns:1fr 1fr}}
        @media(max-width:600px){.page{padding:12px}.summary-grid,.filters,.cards{grid-template-columns:1fr}}
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>💳 Payment History</h1>
          <p style={{ margin: "6px 0 0" }}>
            {showingFor
              ? `Showing payments for: ${showingFor}`
              : "Track all invoice, delivery and pay bill collections."}
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card"><h3>Total Collection</h3><h2>₹{money(total)}</h2></div>
          <div className="summary-card"><h3>Cash</h3><h2>₹{money(cash)}</h2></div>
          <div className="summary-card"><h3>UPI</h3><h2>₹{money(upi)}</h2></div>
          <div className="summary-card"><h3>Bank</h3><h2>₹{money(bank)}</h2></div>
        </div>

        <div className="filters">
          <input
            className="input"
            type="date"
            value={filters.date}
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />

          <input
            className="input"
            placeholder="Mobile number"
            value={filters.mobile}
            onChange={(e) => setFilters({ ...filters, mobile: e.target.value })}
          />

          <input
            className="input"
            placeholder="Customer ID"
            value={filters.customerId}
            onChange={(e) =>
              setFilters({ ...filters, customerId: e.target.value })
            }
          />

          <select
            className="input"
            value={filters.source}
            onChange={(e) => setFilters({ ...filters, source: e.target.value })}
          >
            <option value="">Source</option>
            <option value="INVOICE">Invoice Time</option>
            <option value="DELIVERY">Delivery Time</option>
            <option value="PAY_BILL">Pay Bill</option>
          </select>

          <select
            className="input"
            value={filters.paymentMode}
            onChange={(e) =>
              setFilters({ ...filters, paymentMode: e.target.value })
            }
          >
            <option value="">Payment Mode</option>
            <option value="CASH">Cash</option>
            <option value="UPI">UPI</option>
            <option value="BANK">Bank</option>
            <option value="CHEQUE">Cheque</option>
          </select>

          <button className="btn" onClick={() => loadPayments()}>
            Apply
          </button>
        </div>

        <div className="cards">
          {payments.map((p) => (
            <div className="payment-card" key={p.id}>
              <div className="top">
                <div>
                  <h3 style={{ margin: 0 }}>
                    {p.order?.orderNumber || "Customer Payment"}
                  </h3>
                  <p style={{ margin: "4px 0", color: "#6b7280" }}>
                    {new Date(p.createdAt).toLocaleDateString()}
                  </p>
                </div>

                <span className="badge">{p.source}</span>
              </div>

              <div className="amount">₹{money(p.amount)}</div>

              <div className="info">
                <div>
                  <b>Customer:</b>{" "}
                  {p.order?.customerRecord?.name || p.customer?.name || "-"}
                </div>

                <div>
                  <b>Mobile:</b>{" "}
                  {p.order?.customerRecord?.mobile || p.customer?.mobile || "-"}
                </div>

                <div>
                  <b>Customer ID:</b>{" "}
                  {p.order?.customerRecord?.customerNumber ||
                    p.customer?.customerNumber ||
                    "-"}
                </div>

                <div>
                  <b>Payment Mode:</b> {p.paymentMode}
                </div>

                <div>
                  <b>Collected By:</b> {p.collectedByName || "-"}
                </div>

                <div>
                  <b>Note:</b> {p.note || "-"}
                </div>
              </div>
            </div>
          ))}

          {payments.length === 0 && <p>No payments found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default PaymentHistory;