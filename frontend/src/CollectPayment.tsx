import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import AdminLayout from "./AdminLayout";

function CollectPayment() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [note, setNote] = useState("");
  const [payLaterRemark, setPayLaterRemark] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const latestOutstanding = (o: any) => {
    return (
      Number(o?.customerRecord?.outstandingAmount || 0) ||
      Number(o?.nowOutstanding || 0)
    );
  };

  const loadOrder = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/order-data", {
        headers,
      });

      const found = (res.data.data || []).find((o: any) => o.id === orderId);

      if (!found) {
        alert("Order not found");
        if (user.role === "ADMIN") {
  navigate("/delivery-management");
} else {
  navigate("/staff-deliveries");
}
        return;
      }

      const outstanding = latestOutstanding(found);

      setOrder(found);
      setAmount(String(outstanding));
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to load order");
      console.error(error.response?.data || error);
    }
  };

  const saveCollection = async () => {
    if (!order) return;

    const paid = Number(amount || 0);
    const outstanding = latestOutstanding(order);

    if (paid <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (paid > outstanding) {
      alert("Amount cannot be more than latest outstanding amount");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/payments",
        {
          orderId: order.id,
          customerId: order.customerRecord?.id,
          amount: paid,
          paymentMode,
          source: "DELIVERY",
          collectedById: user.id,
          collectedByName: user.name,
          note,
        },
        { headers }
      );

      alert("Payment collected successfully");
      if (user.role === "ADMIN") {
  navigate("/delivery-management");
} else {
  navigate("/staff-deliveries");
}
    } catch (error: any) {
      console.error(error.response?.data || error);
      alert(error.response?.data?.message || "Payment save failed");
    }
  };

  const markPayLater = async () => {
    try {
      if (!order?.id) {
        alert("Order not loaded");
        return;
      }

      await axios.patch(
        `http://localhost:5000/api/delivery/${order.id}/pay-later`,
        {
          collectionRemark: payLaterRemark || "Customer will pay later",
        },
        { headers }
      );

      alert("Marked as Pay Later");
      if (user.role === "ADMIN") {
  navigate("/delivery-management");
} else {
  navigate("/staff-deliveries");
}
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to mark Pay Later");
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) {
    return (
      <AdminLayout>
        <div style={{ padding: 20 }}>Loading payment details...</div>
      </AdminLayout>
    );
  }

  const outstanding = latestOutstanding(order);
  const hiddenOutstanding = outstanding > 200000;

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

        .layout {
          display: grid;
          grid-template-columns: 1fr 380px;
          gap: 20px;
          align-items: start;
        }

        .card {
          background: white;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 18px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .amount-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .big {
          font-size: 24px;
          font-weight: 900;
        }

        .outstanding {
          color: #dc2626;
        }

        .paid {
          color: #16a34a;
        }

        .input {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          margin-top: 6px;
          margin-bottom: 14px;
        }

        .btn {
          width: 100%;
          padding: 14px;
          border: none;
          border-radius: 12px;
          background: #16a34a;
          color: white;
          font-weight: 900;
          cursor: pointer;
          font-size: 16px;
          margin-top: 10px;
        }

        .back-btn {
          background: #111827;
        }

        .yellow-btn {
          background: #f59e0b;
        }

        .address-box {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e3a8a;
          padding: 12px;
          border-radius: 12px;
          margin-top: 12px;
        }

        @media (max-width: 900px) {
          .layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
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
          <h1 style={{ margin: 0 }}>💰 Delivery Collection</h1>
          <p style={{ margin: "6px 0 0" }}>
            Collect latest remaining amount from customer at delivery time.
          </p>
        </div>

        <div className="layout">
          <main>
            <div className="card">
              <h2>Order Details</h2>

              <div className="grid">
                <p><b>Order ID:</b> {order.orderNumber}</p>
                <p><b>Date:</b>formatDate(order.createdAt)</p>
                <p><b>Name:</b> {order.customerRecord?.name || "-"}</p>
                <p><b>Mobile:</b> {order.customerRecord?.mobile || "-"}</p>
                <p><b>Status:</b> {order.status}</p>
                <p><b>Transporter:</b> {order.transport?.name || "-"}</p>
                <p><b>Staff:</b> {order.assignedStaff?.name || "-"}</p>
              </div>

              <div className="address-box">
                <b>Delivery Address</b>
                <p style={{ margin: "6px 0 0" }}>
                  {order.deliveryAddressSnapshot ||
                    order.deliveryLocation ||
                    order.customerRecord?.address ||
                    "-"}
                </p>
              </div>
            </div>

            <div className="card">
              <h2>Payment Calculation</h2>

              <div className="amount-row">
                <span>Invoice Value</span>
                <b>₹{money(order.invoiceValue)}</b>
              </div>

              <div className="amount-row">
                <span>Previous Outstanding</span>
                <b>₹{money(order.previousOutstanding)}</b>
              </div>

              <div className="amount-row">
                <span>Final Payable</span>
                <b>₹{money(order.totalPayable)}</b>
              </div>

              <div className="amount-row paid">
                <span>Total Paid</span>
                <b>₹{money(order.totalPaid)}</b>
              </div>

              <div className="amount-row big outstanding">
                <span>Latest Amount To Collect</span>
                <span>{hiddenOutstanding ? "******" : `₹${money(outstanding)}`}</span>
              </div>
            </div>
          </main>

          <aside className="card">
            <h2>Collect Payment</h2>

            <label>Amount Collected</label>
            <input
              className="input"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label>Payment Mode</label>
            <select
              className="input"
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
            >
              <option value="CASH">Cash</option>
              <option value="UPI">UPI</option>
              <option value="BANK">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CREDIT">Credit</option>
            </select>

            <label>Note</label>
            <textarea
              className="input"
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
            />

            <button className="btn" onClick={saveCollection}>
              Save Collection
            </button>

            <label style={{ display: "block", marginTop: 15 }}>
              Pay Later Remark
            </label>

            <textarea
              className="input"
              value={payLaterRemark}
              onChange={(e) => setPayLaterRemark(e.target.value)}
              placeholder="Customer will pay later..."
              rows={4}
            />

            <button className="btn yellow-btn" onClick={markPayLater}>
              Pay Later
            </button>

            <button
              className="btn back-btn"
              onClick={() => navigate("/staff-deliveries")}
            >
              Back to Delivery
            </button>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CollectPayment;