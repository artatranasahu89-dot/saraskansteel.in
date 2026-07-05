import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

function CreateInvoice() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);

  const [labourCharge, setLabourCharge] = useState("");
  const [transportCharge, setTransportCharge] = useState("");
  const [discountAmount, setDiscountAmount] = useState("");
  const [actualWeight, setActualWeight] = useState("");
  const [notes, setNotes] = useState("");

  const [amountPaidNow, setAmountPaidNow] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [paymentNote, setPaymentNote] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadOrder = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/orders", {
      headers,
    });

    const found = res.data.data.find((o: any) => o.id === orderId);

    if (!found) {
      alert("Order not found");
      return;
    }

    setOrder(found);

    setItems(
      found.items.map((item: any) => ({
        productId: item.productId,
        productName: item.product?.name,
        quantity: item.quantity,
        unit: item.product?.unit,
        rate: item.unitPrice,
      }))
    );

    setLabourCharge(String(found.labourAmount || 0));
    setTransportCharge(String(found.transportCharge || 0));
  };

  const updateItem = (index: number, field: string, value: any) => {
    setItems(
      items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      )
    );
  };

  const materialAmount = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const labour = Number(labourCharge || 0);
  const transport = Number(transportCharge || 0);
  const discount = Number(discountAmount || 0);
  const currentInvoiceAmount = materialAmount + labour + transport - discount;

  const previousOutstanding = Number(
    order?.customerRecord?.outstandingAmount || 0
  );

  const finalPayable = currentInvoiceAmount + previousOutstanding;
  const paidNow = Number(amountPaidNow || 0);
  const remainingOutstanding = finalPayable - paidNow;

  const createInvoice = async () => {
    if (!orderId || !order) return;

    if (paidNow > finalPayable) {
      alert("Paid amount cannot be more than final payable amount");
      return;
    }

    try {
      await axios.post(
        `https://saraskansteel-in.onrender.com/api/invoices/create/${orderId}`,
        {
          labourCharge: labour,
          transportCharge: transport,
          discountAmount: discount,
          actualWeight: actualWeight ? Number(actualWeight) : undefined,
          notes,
          finalAmount: currentInvoiceAmount,
          materialAmount,
          items: items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            quantity: Number(item.quantity),
            unit: item.unit,
            rate: Number(item.rate),
          })),
        },
        { headers }
      );

      if (paidNow > 0) {
        await axios.post(
          "https://saraskansteel-in.onrender.com/api/payments",
          {
            orderId,
            customerId: order.customerRecord?.id,
            amount: paidNow,
            paymentMode,
            source: "INVOICE",
            note: paymentNote,
          },
          { headers }
        );
      }

      alert("Invoice created successfully");
      navigate("/order-data");
    } catch (error: any) {
      alert(error.response?.data?.message || "Invoice create failed");
      console.error(error.response?.data || error);
    }
  };

  useEffect(() => {
    loadOrder();
  }, []);

  if (!order) {
    return (
      <AdminLayout>
        <div style={{ padding: "20px" }}>Loading order...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        .invoice-page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .invoice-header {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 20px;
        }

        .card {
          background: white;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 18px;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .items-table {
          width: 100%;
          border-collapse: collapse;
        }

        .items-table th,
        .items-table td {
          border-bottom: 1px solid #e5e7eb;
          padding: 12px;
          text-align: left;
        }

        .input {
          width: 100%;
          padding: 11px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .summary {
          display: grid;
          grid-template-columns: 1fr 390px;
          gap: 18px;
        }

        .summary-box {
          position: sticky;
          top: 90px;
          height: fit-content;
        }

        .summary-box div {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
        }

        .total {
          border-top: 1px solid #e5e7eb;
          padding-top: 14px;
          font-size: 22px;
          font-weight: 900;
        }

        .outstanding {
          color: #dc2626;
        }

        .create-btn {
          width: 100%;
          padding: 16px;
          border: none;
          border-radius: 14px;
          background: #16a34a;
          color: white;
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
          margin-top: 18px;
        }

        @media (max-width: 900px) {
          .customer-grid {
            grid-template-columns: 1fr 1fr;
          }

          .summary {
            grid-template-columns: 1fr;
          }

          .summary-box {
            position: static;
          }
        }

        @media (max-width: 600px) {
          .invoice-page {
            padding: 12px;
          }

          .customer-grid {
            grid-template-columns: 1fr;
          }

          .items-table,
          .items-table thead,
          .items-table tbody,
          .items-table th,
          .items-table td,
          .items-table tr {
            display: block;
          }

          .items-table thead {
            display: none;
          }

          .items-table tr {
            border: 1px solid #e5e7eb;
            border-radius: 12px;
            margin-bottom: 12px;
            padding: 10px;
          }

          .items-table td {
            border: none;
            padding: 8px;
          }
        }
      `}</style>

      <div className="invoice-page">
        <div className="invoice-header">
          <h1 style={{ margin: 0 }}>🧾 Create Invoice</h1>
          <p style={{ margin: "6px 0 0" }}>
            Review invoice, customer outstanding and payment collection.
          </p>
        </div>

        <div className="card">
          <h2>Order Details</h2>

          <div className="customer-grid">
            <p><b>Order ID:</b> {order.orderNumber}</p>
            <p><b>Date:</b> formatDate(order.createdAt)</p>
            <p><b>Status:</b> {order.status}</p>
            <p><b>Mobile:</b> {order.customerRecord?.mobile}</p>
            <p><b>Name:</b> {order.customerRecord?.name}</p>
            <p><b>Address:</b> {order.customerRecord?.address}</p>
            <p><b>GST:</b> {order.customerRecord?.gstNumber || "-"}</p>
            <p><b>Old Outstanding:</b> ₹{money(previousOutstanding)}</p>
          </div>
        </div>

        <div className="card">
          <h2>Products Final Review</h2>

          <table className="items-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty / Actual Qty</th>
                <th>Unit</th>
                <th>Rate</th>
                <th>Amount</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index}>
                  <td>{item.productName}</td>

                  <td>
                    <input
                      className="input"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", e.target.value)
                      }
                    />
                  </td>

                  <td>{item.unit}</td>

                  <td>
                    <input
                      className="input"
                      type="number"
                      value={item.rate}
                      onChange={(e) =>
                        updateItem(index, "rate", e.target.value)
                      }
                    />
                  </td>

                  <td>
                    ₹{money(Number(item.quantity || 0) * Number(item.rate || 0))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="summary">
          <div className="card">
            <h2>Extra Charges / Notes</h2>

            <label>Labour Charge</label>
            <input
              className="input"
              value={labourCharge}
              onChange={(e) => setLabourCharge(e.target.value)}
            />

            <br /><br />

            <label>Transport Charge</label>
            <input
              className="input"
              value={transportCharge}
              onChange={(e) => setTransportCharge(e.target.value)}
            />

            <br /><br />

            <label>Discount Amount</label>
            <input
              className="input"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(e.target.value)}
            />

            <br /><br />

            <label>Actual TMT Weight</label>
            <input
              className="input"
              value={actualWeight}
              onChange={(e) => setActualWeight(e.target.value)}
            />

            <br /><br />

            <label>Notes</label>
            <textarea
              className="input"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />

            <br /><br />

            <h2>Payment Collection</h2>

            <label>Amount Paid Now</label>
            <input
              className="input"
              type="number"
              value={amountPaidNow}
              onChange={(e) => setAmountPaidNow(e.target.value)}
            />

            <br /><br />

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

            <br /><br />

            <label>Payment Note</label>
            <textarea
              className="input"
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              rows={3}
              placeholder="Optional payment note"
            />
          </div>

          <div className="card summary-box">
            <h2>Final Review</h2>

            <div><span>Material</span><b>₹{money(materialAmount)}</b></div>
            <div><span>Labour</span><b>₹{money(labour)}</b></div>
            <div><span>Transport</span><b>₹{money(transport)}</b></div>
            <div><span>Discount</span><b>- ₹{money(discount)}</b></div>

            <hr />

            <div>
              <span>Current Invoice</span>
              <b>₹{money(currentInvoiceAmount)}</b>
            </div>

            <div>
              <span>Previous Outstanding</span>
              <b>₹{money(previousOutstanding)}</b>
            </div>

            <div>
              <span>Final Payable</span>
              <b>₹{money(finalPayable)}</b>
            </div>

            <div>
              <span>Paid Now</span>
              <b>₹{money(paidNow)}</b>
            </div>

            <div className="total outstanding">
              <span>Remaining Outstanding</span>
              <span>₹{money(remainingOutstanding)}</span>
            </div>

            <button className="create-btn" onClick={createInvoice}>
              CREATE FINAL INVOICE
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CreateInvoice;