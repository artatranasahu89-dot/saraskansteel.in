import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CustomerLayout from "./CustomerLayout";

function CustomerInvoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

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

  const loadInvoices = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/customer-portal/my-invoices",
        { headers }
      );

      setInvoices(res.data?.data || res.data?.invoices || []);
    } catch (error) {
      console.log("Customer invoices load error:", error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const getOrderNumber = (invoice: any) => {
    return invoice.order?.orderNumber || invoice.orderNumber || "-";
  };

  const getInvoiceNumber = (invoice: any) => {
    return invoice.invoiceNumber || invoice.invoiceNo || invoice.id || "-";
  };

  const getInvoiceAmount = (invoice: any) => {
    return (
      invoice.finalAmount ||
      invoice.invoiceValue ||
      invoice.totalAmount ||
      invoice.grandTotal ||
      invoice.order?.invoiceValue ||
      invoice.order?.finalAmount ||
      0
    );
  };

  const getPaidAmount = (invoice: any) => {
    return (
      invoice.amountPaidToday ||
      invoice.paidAmount ||
      invoice.totalPaid ||
      invoice.order?.amountPaidToday ||
      invoice.order?.paidAmount ||
      0
    );
  };

  const getOutstanding = (invoice: any) => {
    return (
      invoice.nowOutstanding ||
      invoice.outstandingAmount ||
      invoice.order?.nowOutstanding ||
      invoice.order?.outstandingAmount ||
      0
    );
  };

  const getStatus = (invoice: any) => {
    return (
      invoice.paymentStatus ||
      invoice.status ||
      invoice.order?.deliveryStatus ||
      invoice.order?.status ||
      "INVOICED"
    );
  };

  const getItems = (invoice: any) => {
    const items =
      invoice.items ||
      invoice.invoiceItems ||
      invoice.order?.items ||
      invoice.order?.orderItems ||
      invoice.order?.products ||
      invoice.order?.cartItems ||
      [];

    if (!Array.isArray(items)) return [];

    return items;
  };

  const getItemName = (item: any) => {
    return (
      item.product?.name ||
      item.productName ||
      item.name ||
      item.itemName ||
      "Item"
    );
  };

  const getItemQty = (item: any) => {
    return (
      item.quantity ||
      item.qty ||
      item.bags ||
      item.weight ||
      item.actualWeight ||
      ""
    );
  };

  const getItemUnit = (item: any) => {
    return item.unit || item.product?.unit || "";
  };

  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      const status = getStatus(invoice);

      const text = `
        ${getInvoiceNumber(invoice)}
        ${getOrderNumber(invoice)}
        ${status}
        ${getItems(invoice)
          .map((item: any) => getItemName(item))
          .join(" ")}
      `.toLowerCase();

      const matchSearch = text.includes(search.toLowerCase());
      const matchStatus = statusFilter === "ALL" || status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [invoices, search, statusFilter]);

  const totalInvoices = invoices.length;

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(getInvoiceAmount(invoice) || 0),
    0
  );

  const totalPaid = invoices.reduce(
    (sum, invoice) => sum + Number(getPaidAmount(invoice) || 0),
    0
  );

  const totalOutstanding = invoices.reduce(
    (sum, invoice) => sum + Number(getOutstanding(invoice) || 0),
    0
  );

  const statusClass = (status: string) => {
    if (status === "PAID" || status === "DELIVERED") return "paid";
    if (status === "CANCELLED") return "cancelled";
    if (status === "PENDING") return "pending";
    if (status === "PARTIAL") return "partial";
    return "invoiced";
  };

  return (
    <CustomerLayout>
      <style>{`
        .invoice-page {
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
            url("https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          color: white;
          border-radius: 34px;
          padding: 36px;
          margin-bottom: 24px;
          box-shadow: 0 24px 60px rgba(15,23,42,.24);
          display: flex;
          justify-content: space-between;
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
          background: rgba(245,158,11,.22);
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
          letter-spacing: -0.5px;
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

        .control-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 28px;
          padding: 20px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          margin-bottom: 24px;
          display: grid;
          grid-template-columns: 1fr 240px;
          gap: 14px;
        }

        .search,
        .select {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          font-weight: 800;
        }

        .search:focus,
        .select:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245,158,11,.16);
        }

        .invoice-list {
          display: grid;
          gap: 18px;
        }

        .invoice-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 30px;
          padding: 24px;
          box-shadow: 0 16px 36px rgba(15,23,42,.08);
          display: grid;
          grid-template-columns: 1.1fr .9fr;
          gap: 22px;
          transition: .25s;
        }

        .invoice-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 55px rgba(15,23,42,.13);
        }

        .invoice-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
          margin-bottom: 18px;
        }

        .invoice-number {
          font-size: 24px;
          font-weight: 1000;
          color: #111827;
          margin: 0;
        }

        .invoice-date {
          color: #64748b;
          font-weight: 800;
          margin-top: 5px;
        }

        .status-badge {
          padding: 8px 13px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
          white-space: nowrap;
        }

        .paid {
          background: #dcfce7;
          color: #166534;
        }

        .pending {
          background: #fef3c7;
          color: #92400e;
        }

        .partial,
        .invoiced {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .cancelled {
          background: #fee2e2;
          color: #991b1b;
        }

        .detail-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .detail-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 18px;
          padding: 14px;
        }

        .detail-box small {
          display: block;
          color: #64748b;
          font-weight: 1000;
          margin-bottom: 5px;
        }

        .detail-box b {
          font-size: 16px;
          color: #111827;
        }

        .order-box {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 16px;
          line-height: 1.7;
          color: #475569;
          font-weight: 800;
        }

        .order-box strong {
          color: #111827;
          display: block;
          margin-bottom: 6px;
        }

        .items-panel {
          background: #111827;
          color: white;
          border-radius: 24px;
          padding: 20px;
        }

        .items-panel h3 {
          margin: 0 0 14px;
          font-size: 22px;
          font-weight: 1000;
        }

        .item-list {
          display: grid;
          gap: 10px;
          margin-bottom: 18px;
        }

        .item-row {
          background: rgba(255,255,255,.08);
          border: 1px solid rgba(255,255,255,.14);
          border-radius: 16px;
          padding: 13px;
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .item-row b {
          color: white;
        }

        .item-row span {
          color: #fbbf24;
          font-weight: 1000;
          white-space: nowrap;
        }

        .empty-items {
          background: rgba(255,255,255,.08);
          border: 1px dashed rgba(255,255,255,.24);
          border-radius: 16px;
          padding: 18px;
          color: #d1d5db;
          text-align: center;
          margin-bottom: 18px;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .empty {
          background: white;
          border: 2px dashed #cbd5e1;
          border-radius: 28px;
          padding: 42px;
          text-align: center;
          color: #64748b;
          font-weight: 900;
          box-shadow: 0 16px 36px rgba(15,23,42,.06);
        }

        @media(max-width: 1100px) {
          .hero,
          .invoice-card {
            grid-template-columns: 1fr;
          }

          .summary-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media(max-width: 700px) {
          .invoice-page {
            padding: 14px;
          }

          .hero {
            padding: 26px;
            border-radius: 26px;
            flex-direction: column;
            align-items: flex-start;
          }

          .hero h1 {
            font-size: 34px;
          }

          .summary-grid,
          .control-card,
          .detail-grid {
            grid-template-columns: 1fr;
          }

          .invoice-card {
            padding: 18px;
          }

          .invoice-top,
          .item-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn {
            width: 100%;
          }

          .card-actions {
            width: 100%;
          }
        }
      `}</style>

      <div className="invoice-page">
        <div className="hero">
          <div className="hero-content">
            <div className="hero-badge">🧾 My Bills</div>

            <h1>
              View your <span>invoices</span>
            </h1>

            <p>
              Check invoice details, ordered products, total bill amount, paid
              amount, outstanding balance and order reference from one place.
            </p>
          </div>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/customer-shop">
              🛒 New Order
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
            <div className="summary-icon">🧾</div>
            <h3>Total Bills</h3>
            <h2>{totalInvoices}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">💰</div>
            <h3>Total Amount</h3>
            <h2 className="orange">₹{money(totalAmount)}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">✅</div>
            <h3>Total Paid</h3>
            <h2 className="green">₹{money(totalPaid)}</h2>
          </div>

          <div className="summary-card">
            <div className="summary-icon">⚠️</div>
            <h3>Outstanding</h3>
            <h2 className="red">₹{money(totalOutstanding)}</h2>
          </div>
        </div>

        <div className="control-card">
          <input
            className="search"
            placeholder="Search by invoice number, order number, item or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="INVOICED">Invoiced</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {loading ? (
          <div className="empty">Loading your bills...</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="empty">No invoices found.</div>
        ) : (
          <div className="invoice-list">
            {filteredInvoices.map((invoice) => {
              const status = getStatus(invoice);
              const items = getItems(invoice);

              return (
                <div className="invoice-card" key={invoice.id}>
                  <div>
                    <div className="invoice-top">
                      <div>
                        <h2 className="invoice-number">
                          {getInvoiceNumber(invoice)}
                        </h2>

                        <div className="invoice-date">
                          Date: {formatDate(invoice.createdAt)}
                        </div>
                      </div>

                      <span className={`status-badge ${statusClass(status)}`}>
                        {status}
                      </span>
                    </div>

                    <div className="detail-grid">
                      <div className="detail-box">
                        <small>Invoice Amount</small>
                        <b>₹{money(getInvoiceAmount(invoice))}</b>
                      </div>

                      <div className="detail-box">
                        <small>Paid</small>
                        <b className="green">₹{money(getPaidAmount(invoice))}</b>
                      </div>

                      <div className="detail-box">
                        <small>Outstanding</small>
                        <b className="red">₹{money(getOutstanding(invoice))}</b>
                      </div>
                    </div>

                    <div className="order-box">
                      <strong>Order Reference</strong>
                      Order No: {getOrderNumber(invoice)}
                      <br />
                      Status: {status}
                    </div>
                  </div>

                  <div className="items-panel">
                    <h3>Product Details</h3>

                    {items.length === 0 ? (
                      <div className="empty-items">No product details found.</div>
                    ) : (
                      <div className="item-list">
                        {items.map((item: any, index: number) => {
                          const qty = getItemQty(item);
                          const unit = getItemUnit(item);

                          return (
                            <div className="item-row" key={item.id || index}>
                              <b>{getItemName(item)}</b>

                              <span>
                                {qty
                                  ? `× ${qty}${unit ? " " + unit : ""}`
                                  : "Added"}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <div className="card-actions">
                      <Link
                        className="btn btn-primary"
                        to={`/invoice-view/${invoice.id}`}
                      >
                        View Invoice
                      </Link>

                      <Link className="btn btn-light" to="/customer-orders">
                        My Orders
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </CustomerLayout>
  );
}

export default CustomerInvoices;