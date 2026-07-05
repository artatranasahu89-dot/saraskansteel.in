import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function CustomerLedger() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [ledger, setLedger] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);
const formatDate = (value: any) => {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
};

const getItemsText = (source: any) => {
  const items =
    source?.items ||
    source?.orderItems ||
    source?.products ||
    source?.cartItems ||
    source?.invoice?.items ||
    source?.invoiceItems ||
    [];

  if (!Array.isArray(items) || items.length === 0) {
    return "-";
  }

  return items
    .map((item: any) => {
      const name =
        item.product?.name ||
        item.productName ||
        item.name ||
        item.itemName ||
        "Item";

      const qty =
        item.quantity ||
        item.qty ||
        item.bags ||
        item.weight ||
        item.actualWeight ||
        "";

      const unit = item.unit || item.product?.unit || "";

      if (qty) {
        return `${name} × ${qty}${unit ? " " + unit : ""}`;
      }

      return name;
    })
    .join(", ");
};

const getLedgerItems = (ledgerRow: any) => {
  const directItems = getItemsText(ledgerRow);

  if (directItems !== "-") {
    return directItems;
  }

  const matchedOrder = orders.find((order: any) => {
    const ledgerReference = String(
      ledgerRow.orderNumber ||
        ledgerRow.reference ||
        ledgerRow.orderId ||
        ledgerRow.invoiceNumber ||
        ""
    );

    return (
      String(order.id || "") === ledgerReference ||
      String(order.orderNumber || "") === ledgerReference ||
      String(order.invoice?.invoiceNumber || "") === ledgerReference ||
      String(order.invoice?.id || "") === ledgerReference
    );
  });

  if (!matchedOrder) {
    return "-";
  }

  return getItemsText(matchedOrder);
};
  const loadCustomers = async () => {
    try {
      const res = await axios.get("https://saraskansteel-in.onrender.com/api/customers", {
        headers,
      });

      setCustomers(res.data.data || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to load customers");
    }
  };
const loadOrders = async () => {
  try {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/orders", {
      headers,
    });

    setOrders(res.data.data || []);
  } catch (error) {
    console.log("Orders load skipped for ledger", error);
    setOrders([]);
  }
};
  useEffect(() => {
  loadCustomers();
  loadOrders();
}, []);

  const filteredCustomers = useMemo(() => {
    if (!search.trim()) return [];

    return customers
      .filter((c) =>
        `${c.name || ""} ${c.mobile || ""} ${c.customerNumber || ""} ${c.email || ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .slice(0, 8);
  }, [customers, search]);

  const loadLedger = async (customerId?: string) => {
    const id = customerId || selectedCustomer?.id;

    if (!id) {
      alert("Please search and select a customer first");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.get(
        `https://saraskansteel-in.onrender.com/api/customer-ledger/${id}`,
        { headers }
      );

    setLedger(res.data.data || res.data.ledger || []);  
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to load ledger");
    } finally {
      setLoading(false);
    }
  };

  const selectCustomer = (customer: any) => {
    setSelectedCustomer(customer);
    setSearch(`${customer.name} - ${customer.mobile || customer.customerNumber || ""}`);
    setLedger([]);
    loadLedger(customer.id);
  };

  const totalInvoice = ledger.reduce(
    (sum, l) => sum + Number(l.debit || 0),
    0
  );

  const totalPayment = ledger.reduce(
    (sum, l) => sum + Number(l.credit || 0),
    0
  );

  const outstanding = totalInvoice - totalPayment;

  const lastPayment = [...ledger]
    .reverse()
    .find((l) => Number(l.credit || 0) > 0);

  const exportExcel = () => {
    if (!ledger.length) {
      alert("No ledger data to export");
      return;
    }

    const rows = [
      ["Customer Ledger"],
      ["Customer", selectedCustomer?.name || ""],
      ["Mobile", selectedCustomer?.mobile || ""],
      ["Customer ID", selectedCustomer?.customerNumber || ""],
      [],
     ["Date", "Type", "Reference", "Items Ordered", "Description", "Debit", "Credit", "Balance"],
      ...ledger.map((l) => [
        formatDate(l.date),
        l.type || "",
        l.orderNumber || l.reference || "",
        getLedgerItems(l),
l.description || "",
money(l.debit),
        money(l.credit),
        money(l.balance),
      ]),
      [],
      ["Total Invoice", money(totalInvoice)],
      ["Total Payment", money(totalPayment)],
      ["Outstanding", money(outstanding)],
    ];

    const csv = rows
      .map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `customer-ledger-${selectedCustomer?.name || "customer"}.csv`;
    a.click();

    URL.revokeObjectURL(url);
  };

  const printLedger = () => {
    if (!ledger.length) {
      alert("No ledger data to print");
      return;
    }

    window.print();
  };

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
          border-radius: 24px;
          padding: 26px;
          margin-bottom: 20px;
          box-shadow: 0 12px 35px rgba(0,0,0,.16);
        }

        .header h1 {
          margin: 0;
          font-size: 32px;
        }

        .header p {
          margin: 8px 0 0;
          color: #d1d5db;
        }

        .toolbar {
          background: white;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
          margin-bottom: 20px;
          position: relative;
        }

        .search-row {
          display: grid;
          grid-template-columns: 1fr auto auto auto auto;
          gap: 10px;
          align-items: center;
        }

        .input {
          width: 100%;
          padding: 13px 14px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          font-size: 15px;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 13px 16px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          white-space: nowrap;
        }

        .btn-blue { background: #2563eb; }
        .btn-green { background: #16a34a; }
        .btn-orange { background: #f59e0b; }
        .btn-gray { background: #6b7280; }

        .suggestions {
          position: absolute;
          left: 18px;
          right: 18px;
          top: 74px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          box-shadow: 0 18px 40px rgba(0,0,0,.16);
          overflow: hidden;
          z-index: 10;
        }

        .suggestion-item {
          padding: 13px 15px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
        }

        .suggestion-item:hover {
          background: #f3f4f6;
        }

        .suggestion-item:last-child {
          border-bottom: none;
        }

        .customer-box {
          margin-top: 16px;
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          border-radius: 18px;
          padding: 14px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .customer-box small {
          color: #2563eb;
          font-weight: 900;
          display: block;
          margin-bottom: 4px;
        }

        .cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }

        .card {
          background: white;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }

        .card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .card h2 {
          margin: 10px 0 0;
          font-size: 27px;
        }

        .red { color: #dc2626; }
        .green { color: #16a34a; }
        .blue { color: #2563eb; }
        .orange { color: #f59e0b; }

        .table-card {
          background: white;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }

        .table-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 950px;
        }

        th {
          background: #f3f4f6;
          padding: 12px;
          text-align: left;
          font-size: 13px;
          color: #374151;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .badge {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 1000;
        }

        .badge-invoice {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-payment {
          background: #dcfce7;
          color: #166534;
        }

        .amount-red {
          color: #dc2626;
          font-weight: 900;
        }

        .amount-green {
          color: #16a34a;
          font-weight: 900;
        }

        .footer-total {
          margin-top: 16px;
          background: #111827;
          color: white;
          border-radius: 16px;
          padding: 16px;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .footer-total small {
          color: #d1d5db;
          display: block;
          margin-bottom: 5px;
        }

        @media(max-width: 1100px) {
          .search-row {
            grid-template-columns: 1fr 1fr;
          }

          .cards {
            grid-template-columns: 1fr 1fr;
          }

          .customer-box {
            grid-template-columns: 1fr 1fr;
          }
        }

        @media(max-width: 650px) {
          .page {
            padding: 12px;
          }

          .header h1 {
            font-size: 25px;
          }

          .search-row,
          .cards,
          .customer-box,
          .footer-total {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
          }
        }

        @media print {
          .topbar,
          .sidebar,
          .toolbar,
          .btn {
            display: none !important;
          }

          .page {
            background: white;
            padding: 0;
          }

          .header {
            background: white;
            color: #111827;
            box-shadow: none;
            border: 1px solid #ddd;
          }

          .card,
          .table-card {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1>📒 Customer Ledger</h1>
          <p>
            Generate customer ledger, outstanding statement, invoice history and payment history.
          </p>
        </div>

        <div className="toolbar">
          <div className="search-row">
            <input
              className="input"
              placeholder="Search customer by name, mobile, customer ID or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setSelectedCustomer(null);
                setLedger([]);
              }}
            />

            <button
              className="btn btn-blue"
              onClick={() => {
                if (filteredCustomers.length === 1) {
                  selectCustomer(filteredCustomers[0]);
                } else if (!selectedCustomer) {
                  alert("Please select customer from search result");
                } else {
                  loadLedger();
                }
              }}
            >
              🔍 Search
            </button>

            <button className="btn btn-green" onClick={exportExcel}>
              📊 Export Excel
            </button>

            <button className="btn btn-orange" onClick={printLedger}>
              📄 Export PDF
            </button>

            <button className="btn btn-gray" onClick={() => loadLedger()}>
              🔄 Refresh
            </button>
          </div>

          {search && !selectedCustomer && (
            <div className="suggestions">
              {filteredCustomers.map((c) => (
                <div
                  className="suggestion-item"
                  key={c.id}
                  onClick={() => selectCustomer(c)}
                >
                  <b>{c.name}</b>
                  <br />
                  <small>
                    Mobile: {c.mobile || "-"} | ID: {c.customerNumber || "-"} | Email: {c.email || "-"}
                  </small>
                </div>
              ))}

              {filteredCustomers.length === 0 && (
                <div className="suggestion-item">
                  No customer found.
                </div>
              )}
            </div>
          )}

          {selectedCustomer && (
            <div className="customer-box">
              <div>
                <small>Customer Name</small>
                <b>{selectedCustomer.name}</b>
              </div>

              <div>
                <small>Mobile</small>
                <b>{selectedCustomer.mobile || "-"}</b>
              </div>

              <div>
                <small>Customer ID</small>
                <b>{selectedCustomer.customerNumber || "-"}</b>
              </div>

              <div>
                <small>Current Outstanding</small>
                <b className="red">₹{money(selectedCustomer.outstandingAmount)}</b>
              </div>
            </div>
          )}
        </div>

        <div className="cards">
          <div className="card">
            <h3>Total Invoice</h3>
            <h2>₹{money(totalInvoice)}</h2>
          </div>

          <div className="card">
            <h3>Total Payment</h3>
            <h2 className="green">₹{money(totalPayment)}</h2>
          </div>

          <div className="card">
            <h3>Outstanding</h3>
            <h2 className="red">₹{money(outstanding)}</h2>
          </div>

          <div className="card">
            <h3>Last Payment</h3>
            <h2 className="blue">
              ₹{money(lastPayment?.credit || 0)}
            </h2>
          </div>
        </div>

        <div className="table-card">
          <div className="table-head">
            <h2 style={{ margin: 0 }}>Ledger History</h2>
            <b>{loading ? "Loading..." : `${ledger.length} Records`}</b>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
<th>Type</th>
<th>Reference</th>
<th>Items Ordered</th>
<th>Description</th>
<th>Debit</th>
<th>Credit</th>
<th>Balance</th>
                </tr>
              </thead>

              <tbody>
                {ledger.map((l, index) => (
                  <tr key={index}>
                   <td>{formatDate(l.date)}</td> 

                    <td>
                      <span
                        className={
                          l.type === "INVOICE"
                            ? "badge badge-invoice"
                            : "badge badge-payment"
                        }
                      >
                        {l.type}
                      </span>
                    </td>

                    <td>{l.orderNumber || l.reference || "-"}</td>
                    <td>{getLedgerItems(l)}</td>
<td>{l.description || "-"}</td>

                    <td className="amount-red">₹{money(l.debit)}</td>
                    <td className="amount-green">₹{money(l.credit)}</td>
                    <td>₹{money(l.balance)}</td>
                  </tr>
                ))}

                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      Search and select a customer to generate ledger.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="footer-total">
            <div>
              <small>Total Debit</small>
              <b>₹{money(totalInvoice)}</b>
            </div>

            <div>
              <small>Total Credit</small>
              <b>₹{money(totalPayment)}</b>
            </div>

            <div>
              <small>Closing Balance</small>
              <b>₹{money(outstanding)}</b>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default CustomerLedger;