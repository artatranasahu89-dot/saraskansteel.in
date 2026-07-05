import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function PayBill() {
  const [searchType, setSearchType] = useState("MOBILE");
  const [searchValue, setSearchValue] = useState("");
  const [customer, setCustomer] = useState<any>(null);

  const [amount, setAmount] = useState("");
  const [paymentMode, setPaymentMode] = useState("CASH");
  const [note, setNote] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);
  const [searchParams] = useSearchParams();
  const clearForm = () => {
    setSearchValue("");
    setCustomer(null);
    setAmount("");
    setPaymentMode("CASH");
    setNote("");
  };

  const searchCustomer = async () => {
    if (!searchValue.trim()) {
      alert("Enter mobile number or customer ID");
      return;
    }

    try {
      if (searchType === "MOBILE") {
        const res = await axios.get(
          "http://localhost:5000/api/customers/mobile/" + searchValue,
          { headers }
        );

        setCustomer(res.data.data);
      } else {
        const res = await axios.get("http://localhost:5000/api/customers", {
          headers,
        });

        const found = res.data.data.find(
          (c: any) =>
            c.id === searchValue ||
            c.customerNumber === searchValue ||
            c.customerId === searchValue
        );

        if (!found) {
          alert("Customer ID not found");
          setCustomer(null);
          return;
        }

        setCustomer(found);
      }

      setAmount("");
      setNote("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Customer not found");
      setCustomer(null);
    }
  };

  const receivePayment = async () => {
    if (user.role !== "ADMIN") {
      alert("Only admin can receive Pay Bill payment");
      return;
    }

    if (!customer) {
      alert("Search customer first");
      return;
    }

    const paid = Number(amount || 0);
    const outstanding = Number(customer.outstandingAmount || 0);

    if (paid <= 0) {
      alert("Enter valid amount");
      return;
    }

    if (paid > outstanding) {
      alert("Amount cannot be more than outstanding amount");
      return;
    }

    try {
      await axios.post(
        "http://localhost:5000/api/payments",
        {
          customerId: customer.id,
          amount: paid,
          paymentMode,
          source: "PAY_BILL",
          note,
        },
        { headers }
      );

      alert("Payment received successfully");

      setCustomer({
        ...customer,
        outstandingAmount: Math.max(outstanding - paid, 0),
      });

      setAmount("");
      setNote("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Payment receive failed");
      console.error(error.response?.data || error);
    }
  };
const searchCustomerByValue = async (value: string, type: string) => {
  try {
    if (type === "MOBILE") {
      const res = await axios.get(
        "http://localhost:5000/api/customers/mobile/" + value,
        { headers }
      );

      setCustomer(res.data.data);
    }
  } catch {
    alert("Customer not found");
    setCustomer(null);
  }
};
  const remaining =
    Number(customer?.outstandingAmount || 0) - Number(amount || 0);
 useEffect(() => {
  const mobileFromUrl = searchParams.get("mobile");

  if (mobileFromUrl) {
    setSearchType("MOBILE");
    setSearchValue(mobileFromUrl);

    setTimeout(() => {
      searchCustomerByValue(mobileFromUrl, "MOBILE");
    }, 100);
  }
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

        .layout {
          display: grid;
          grid-template-columns: 1fr 390px;
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

        .search-grid {
          display: grid;
          grid-template-columns: 180px 1fr auto auto;
          gap: 10px;
          align-items: start;
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
          border: none;
          border-radius: 12px;
          padding: 13px 16px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          margin-top: 6px;
        }

        .clear-btn {
          background: #dc2626;
        }

        .pay-btn {
          width: 100%;
          background: #16a34a;
          font-size: 16px;
        }

        .customer-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }

        .outstanding-box {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 16px;
          padding: 18px;
          margin-top: 16px;
        }

        .outstanding-box h1 {
          margin: 6px 0 0;
          color: #c2410c;
          font-size: 34px;
        }

        .disabled-note {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 12px;
          font-weight: 800;
          margin-bottom: 14px;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 9px 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .remaining {
          font-size: 20px;
          font-weight: 900;
          color: #dc2626;
          border-bottom: none;
          padding-top: 14px;
        }

        @media (max-width: 950px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .search-grid {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }

        @media (max-width: 600px) {
          .page {
            padding: 12px;
          }

          .customer-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>💵 Pay Bill</h1>
          <p style={{ margin: "6px 0 0" }}>
            Admin can collect customer outstanding by mobile number or customer ID.
          </p>
        </div>

        <div className="layout">
          <main>
            <div className="card">
              <h2>Search Customer</h2>

              <div className="search-grid">
                <div>
                  <label>Search By</label>
                  <select
                    className="input"
                    value={searchType}
                    onChange={(e) => {
                      setSearchType(e.target.value);
                      setSearchValue("");
                      setCustomer(null);
                    }}
                  >
                    <option value="MOBILE">Mobile Number</option>
                    <option value="CUSTOMER_ID">Customer ID</option>
                  </select>
                </div>

                <div>
                  <label>
                    {searchType === "MOBILE"
                      ? "Mobile Number"
                      : "Customer ID"}
                  </label>
                  <input
                    className="input"
                    placeholder={
                      searchType === "MOBILE"
                        ? "Enter mobile number"
                        : "Enter customer ID"
                    }
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") searchCustomer();
                    }}
                  />
                </div>

                <button className="btn" onClick={searchCustomer}>
                  Search
                </button>

                <button className="btn clear-btn" onClick={clearForm}>
                  Clear
                </button>
              </div>
            </div>

            {customer && (
              <div className="card">
                <h2>Customer Details</h2>

                <div className="customer-grid">
                  <p><b>Name:</b> {customer.name}</p>
                  <p><b>Mobile:</b> {customer.mobile}</p>
                  <p><b>Customer ID:</b> {customer.customerNumber || customer.customerId || customer.id}</p>
                  <p><b>GST:</b> {customer.gstNumber || "-"}</p>
                  <p><b>Address:</b> {customer.address || "-"}</p>
                  <p><b>Status:</b> {customer.active === false ? "Inactive" : "Active"}</p>
                </div>

                <div className="outstanding-box">
                  <span>Current Outstanding</span>
                  <h1>₹{money(customer.outstandingAmount)}</h1>
                </div>
              </div>
            )}
          </main>

          <aside className="card">
            <h2>Receive Payment</h2>

            {user.role !== "ADMIN" && (
              <div className="disabled-note">
                Only admin can access Pay Bill collection.
              </div>
            )}

            <div className="summary-row">
              <span>Current Outstanding</span>
              <b>₹{money(customer?.outstandingAmount)}</b>
            </div>

            <div className="summary-row">
              <span>Amount Paying</span>
              <b>₹{money(amount)}</b>
            </div>

            <div className="summary-row remaining">
              <span>Remaining</span>
              <span>₹{money(Math.max(remaining, 0))}</span>
            </div>

            <br />

            <label>Amount Received</label>
            <input
              className="input"
              type="number"
              value={amount}
              disabled={user.role !== "ADMIN" || !customer}
              onChange={(e) => setAmount(e.target.value)}
            />

            <label>Payment Mode</label>
            <select
              className="input"
              value={paymentMode}
              disabled={user.role !== "ADMIN" || !customer}
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
              disabled={user.role !== "ADMIN" || !customer}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Optional note"
            />

            <button
              className="btn pay-btn"
              disabled={user.role !== "ADMIN" || !customer}
              onClick={receivePayment}
            >
              Receive Payment
            </button>
          </aside>
        </div>
      </div>
    </AdminLayout>
  );
}

export default PayBill;