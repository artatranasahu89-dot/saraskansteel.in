import { useEffect, useState } from "react";
import axios from "axios";
import CustomerLayout from "./CustomerLayout";

function CustomerOutstanding() {
  const [orders, setOrders] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const orderRes = await axios.get("http://localhost:5000/api/customer-portal/my-orders", {
      headers,
    });

    const paymentRes = await axios.get("http://localhost:5000/api/customer-portal/my-payments", {
      headers,
    });

    const myOrders = (orderRes.data.data || []).filter(
      (o: any) =>
        o.customerRecordId === user.id ||
        o.customerRecord?.id === user.id ||
        o.customerRecord?.mobile === user.mobile
    );

    const myPayments = (paymentRes.data.data || []).filter(
      (p: any) =>
        p.customerId === user.id ||
        p.customer?.mobile === user.mobile
    );

    setOrders(myOrders);
    setPayments(myPayments);
  };

  const currentOutstanding =
    orders[0]?.customerRecord?.outstandingAmount ||
    user.outstandingAmount ||
    0;

  const totalInvoice = orders.reduce(
    (sum, o) => sum + Number(o.invoiceValue || 0),
    0
  );

  const totalPaid = payments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const payLaterOrders = orders.filter(
    (o) => o.collectionStatus === "PAY_LATER"
  );

  const customerPoints = 0;

  useEffect(() => {
    loadData();
  }, []);

  return (
    <CustomerLayout>
      <style>{`
        .page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .header {
          background: linear-gradient(135deg,#111827,#1f2937);
          color: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(4,1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .card,
        .table-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
          margin-bottom: 20px;
        }

        .card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .card h2 {
          margin: 8px 0 0;
          font-size: 27px;
        }

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .success {
          color: #16a34a;
          font-weight: 900;
        }

        .blue {
          color: #2563eb;
          font-weight: 900;
        }

        .orange {
          color: #f59e0b;
          font-weight: 900;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 800px;
        }

        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 13px;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 900;
          font-size: 12px;
        }

        @media(max-width: 900px) {
          .grid {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media(max-width: 600px) {
          .page {
            padding: 12px;
          }

          .grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🔴 Outstanding</h1>
          <p style={{ margin: "6px 0 0" }}>
            View your current outstanding amount, payment history and pay-later orders.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h3>Current Outstanding</h3>
            <h2 className="danger">₹{money(currentOutstanding)}</h2>
          </div>

          <div className="card">
            <h3>Total Invoice Value</h3>
            <h2>₹{money(totalInvoice)}</h2>
          </div>

          <div className="card">
            <h3>Total Paid</h3>
            <h2 className="success">₹{money(totalPaid)}</h2>
          </div>

          <div className="card">
            <h3>Pay Later Orders</h3>
            <h2 className="orange">{payLaterOrders.length}</h2>
          </div>

          <div className="card">
            <h3>Customer Points</h3>
            <h2 className="blue">{customerPoints}</h2>
          </div>
        </div>

        <div className="table-card">
          <h2>Payment History</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Payment No</th>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Source</th>
                </tr>
              </thead>

              <tbody>
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td>{p.paymentNumber || "PMT"}</td>
                    <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                    <td className="success">₹{money(p.amount)}</td>
                    <td>{p.paymentMode || "-"}</td>
                    <td><span className="badge">{p.source || "-"}</span></td>
                  </tr>
                ))}

                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5}>No payments found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h2>Pay Later Orders</h2>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Date</th>
                  <th>Outstanding</th>
                  <th>Remark</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {payLaterOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td className="danger">₹{money(o.nowOutstanding)}</td>
                    <td>{o.collectionRemark || "-"}</td>
                    <td><span className="badge">{o.collectionStatus}</span></td>
                  </tr>
                ))}

                {payLaterOrders.length === 0 && (
                  <tr>
                    <td colSpan={5}>No pay later orders.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CustomerOutstanding;