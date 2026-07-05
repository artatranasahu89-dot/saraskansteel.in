import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function OutstandingReport() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadData = async () => {
    const customerRes = await axios.get("https://saraskansteel-in.onrender.com/api/customers", {
      headers,
    });

    const orderRes = await axios.get("https://saraskansteel-in.onrender.com/api/order-data", {
      headers,
    });

    setCustomers(customerRes.data.data || []);
    setOrders(orderRes.data.data || []);
  };

  const getPayLaterOrders = (customer: any) => {
    return orders.filter(
      (o) =>
        o.customerRecord?.id === customer.id &&
        o.collectionStatus === "PAY_LATER"
    );
  };

  const getLastPurchase = (customer: any) => {
    const customerOrders = orders.filter(
      (o) => o.customerRecord?.id === customer.id
    );

    if (customerOrders.length === 0) return "-";

    const latest = [...customerOrders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return new Date(latest.createdAt).toLocaleDateString();
  };

  const getDaysDue = (customer: any) => {
    const payLaterOrders = getPayLaterOrders(customer);

    if (payLaterOrders.length === 0) return "-";

    const oldest = [...payLaterOrders].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )[0];

    const diff =
      new Date().getTime() - new Date(oldest.createdAt).getTime();

    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const filtered = customers
    .filter((c) => Number(c.outstandingAmount || 0) > 0)
    .filter((c) => {
      const text =
        `${c.name} ${c.mobile} ${c.customerNumber || ""}`.toLowerCase();

      return text.includes(search.toLowerCase());
    });

  const totalOutstanding = filtered.reduce(
    (sum, c) => sum + Number(c.outstandingAmount || 0),
    0
  );

  const totalPayLaterOrders = filtered.reduce(
    (sum, c) => sum + getPayLaterOrders(c).length,
    0
  );

  const exportCSV = () => {
    const rows = [
      [
        "Customer",
        "Mobile",
        "Customer ID",
        "Outstanding",
        "Pay Later Orders",
        "Last Purchase",
        "Days Due",
        "Last Remark",
      ],
      ...filtered.map((c) => {
        const payLaterOrders = getPayLaterOrders(c);
        const lastPayLater = payLaterOrders[payLaterOrders.length - 1];

        return [
          c.name,
          c.mobile,
          c.customerNumber || c.id,
          money(c.outstandingAmount),
          payLaterOrders.length,
          getLastPurchase(c),
          getDaysDue(c),
          lastPayLater?.collectionRemark || "",
        ];
      }),
    ];

    const csv = rows
      .map((r) =>
        r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "STRIDE_Outstanding_Report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadData();
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
          grid-template-columns: repeat(3, 1fr);
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

        .toolbar {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
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

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .orange {
          color: #f59e0b;
          font-weight: 900;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .summary-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🔴 Outstanding Customers Report</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track unpaid customers, pay-later orders, due days and collection action.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Outstanding Customers</h3>
            <h2>{filtered.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Outstanding</h3>
            <h2 className="danger">₹{money(totalOutstanding)}</h2>
          </div>

          <div className="summary-card">
            <h3>Pay Later Orders</h3>
            <h2 className="orange">{totalPayLaterOrders}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search by customer, mobile or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn green" onClick={exportCSV}>
            Export Excel
          </button>

          <button
            className="btn red"
            onClick={() => {
              setSearch("");
            }}
          >
            Clear
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Mobile</th>
                <th>Customer ID</th>
                <th>Outstanding</th>
                <th>Pay Later Orders</th>
                <th>Last Purchase</th>
                <th>Days Due</th>
                <th>Last Remark</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c) => {
                const payLaterOrders = getPayLaterOrders(c);
                const lastPayLater = payLaterOrders[payLaterOrders.length - 1];

                return (
                  <tr key={c.id}>
                    <td>{c.name}</td>
                    <td>{c.mobile}</td>
                    <td>{c.customerNumber || c.id}</td>
                    <td className="danger">₹{money(c.outstandingAmount)}</td>
                    <td className="orange">{payLaterOrders.length}</td>
                    <td>{getLastPurchase(c)}</td>
                    <td>{getDaysDue(c)}</td>
                    <td>{lastPayLater?.collectionRemark || "-"}</td>
                    <td>
                      <div className="actions">
                        <button
                          className="btn"
                          onClick={() =>
                            (window.location.href = `/pay-bill?mobile=${c.mobile}`)
                          }
                        >
                          Pay Bill
                        </button>

                        <button
                          className="btn green"
                          onClick={() =>
                            (window.location.href = `/customer-ledger?mobile=${c.mobile}`)
                          }
                        >
                          Ledger
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9}>No outstanding customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OutstandingReport;