import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Invoices() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadInvoices = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/invoices", {
      headers,
    });

    setInvoices(res.data.data);
  };

  const getOutstanding = (invoice: any) => {
    return Number(invoice.order?.nowOutstanding || 0);
  };

  const getPaid = (invoice: any) => {
    return Number(invoice.order?.totalPaid || invoice.order?.amountPaidToday || 0);
  };

  const filteredInvoices = invoices.filter((i) => {
    const text =
      i.invoiceNumber +
      " " +
      (i.order?.orderNumber || "") +
      " " +
      (i.customerName || "") +
      " " +
      (i.customerMobile || "") +
      " " +
      (i.order?.customerRecord?.customerNumber || "");

    const matchSearch = text.toLowerCase().includes(search.toLowerCase());

    const matchDate = date
      ? new Date(i.createdAt).toISOString().slice(0, 10) === date
      : true;

    return matchSearch && matchDate;
  });

  const totalInvoices = filteredInvoices.length;

  const invoiceValue = filteredInvoices.reduce(
    (sum, i) => sum + Number(i.finalAmount || 0),
    0
  );

  const totalPaid = filteredInvoices.reduce(
    (sum, i) => sum + getPaid(i),
    0
  );

  const totalOutstanding = filteredInvoices.reduce(
    (sum, i) => sum + getOutstanding(i),
    0
  );

  useEffect(() => {
    loadInvoices();
  }, []);

  return (
    <AdminLayout>
      <style>{`
        .page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .header {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 20px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .summary-card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-card h2 {
          margin: 8px 0 0;
        }

        .filter-card {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          display: grid;
          grid-template-columns: 1fr 220px auto;
          gap: 12px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .btn {
          border: none;
          border-radius: 10px;
          padding: 11px 14px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .blue {
          background: #2563eb;
        }

        .green {
          background: #16a34a;
        }

        .red {
          background: #dc2626;
        }

        .table-wrap {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1050px;
        }

        th {
          background: #f3f4f6;
          text-align: left;
          padding: 12px;
          font-size: 13px;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .status {
          padding: 5px 9px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          background: #fef3c7;
          color: #92400e;
        }

        .paid {
          color: #16a34a;
          font-weight: 900;
        }

        .outstanding {
          color: #dc2626;
          font-weight: 900;
        }

        .actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(90px, 1fr));
  gap: 8px;
}

.actions .btn {
  width: 100%;
}

        .mobile-cards {
          display: none;
        }

        .invoice-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filter-card {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 650px) {
          .page {
            padding: 12px;
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .table-wrap {
            display: none;
          }

          .mobile-cards {
            display: block;
          }

          .actions .btn {
            flex: 1;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🧾 Find Invoice</h1>
          <p style={{ margin: "6px 0 0" }}>
            Search invoices, view bill, collect balance and track outstanding.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Invoices</h3>
            <h2>{totalInvoices}</h2>
          </div>
          <div className="invoice-section">
         </div>

          <div className="summary-card">
            <h3>Invoice Value</h3>
            <h2>₹{money(invoiceValue)}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Paid</h3>
            <h2 className="paid">₹{money(totalPaid)}</h2>
          </div>

          <div className="summary-card">
            <h3>Outstanding</h3>
            <h2 className="outstanding">₹{money(totalOutstanding)}</h2>
          </div>
        </div>

        <div className="filter-card">
          <input
            className="input"
            placeholder="Search invoice no, order no, name, mobile, customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <input
            className="input"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <button
            className="btn red"
            onClick={() => {
              setSearch("");
              setDate("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Invoice No</th>
                <th>Date</th>
                <th>Order No</th>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Invoice Value</th>
                <th>Paid</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Transport</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((i) => (
                <tr key={i.id}>
                  <td>{i.invoiceNumber}</td>
                  <td>{new Date(i.createdAt).toLocaleDateString()}</td>
                  <td>{i.order?.orderNumber || "-"}</td>
                  <td>{i.customerName || "-"}</td>
                  <td>{i.customerMobile || "-"}</td>
                  <td>₹{money(i.finalAmount)}</td>
                  <td className="paid">₹{money(getPaid(i))}</td>
                  <td className="outstanding">₹{money(getOutstanding(i))}</td>
                  <td>
                    <span className="status">
                      {i.order?.paymentStatus || "-"}
                    </span>
                  </td>
                  <td>{i.order?.transport?.name || "-"}</td>
                  <td>
                    <div className="actions">
                      <button
                        className="btn blue"
                        onClick={() =>
                          (window.location.href = `/invoice-view/${i.id}`)
                        }
                      >
                        View
                      </button>
                      <button
  className="btn"
  onClick={async () => {
    const token = localStorage.getItem("token");

    const response = await axios.get(
      `https://saraskansteel-in.onrender.com/api/pdf/invoice/${i.id}`,
      {
        responseType: "blob",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const url = window.URL.createObjectURL(response.data);
    window.open(url, "_blank");
  }}
>
  PDF
</button>

                      {Number(getOutstanding(i)) > 0 && (
                        <button
                          className="btn green"
                          onClick={() =>
                            (window.location.href = `/collect-payment/${i.orderId}`)
                          }
                        >
                          Collect
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td colSpan={11}>No invoices found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {filteredInvoices.map((i) => (
            <div className="invoice-card" key={i.id}>
              <h3>{i.invoiceNumber}</h3>
              <p><b>Date:</b> {new Date(i.createdAt).toLocaleDateString()}</p>
              <p><b>Order:</b> {i.order?.orderNumber || "-"}</p>
              <p><b>Customer:</b> {i.customerName || "-"}</p>
              <p><b>Mobile:</b> {i.customerMobile || "-"}</p>
              <p><b>Invoice Value:</b> ₹{money(i.finalAmount)}</p>
              <p className="paid"><b>Paid:</b> ₹{money(getPaid(i))}</p>
              <p className="outstanding">
                <b>Outstanding:</b> ₹{money(getOutstanding(i))}
              </p>
              <p><b>Status:</b> {i.order?.paymentStatus || "-"}</p>

              <div className="actions">
                <button
                  className="btn blue"
                  onClick={() =>
                    (window.location.href = `/invoice-view/${i.id}`)
                  }
                >
                  View
                </button>

                {Number(getOutstanding(i)) > 0 && (
                  <button
                    className="btn green"
                    onClick={() =>
                      (window.location.href = `/pay-bill?mobile=${i.customerMobile}`)
                    }
                  >
                    Collect
                  </button>
                )}
              </div>
            </div>
          ))}

          {filteredInvoices.length === 0 && <p>No invoices found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Invoices;