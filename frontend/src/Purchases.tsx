import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Purchases() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [purchases, setPurchases] = useState<any[]>([]);
  const [supplierId, setSupplierId] = useState("");
  const [note, setNote] = useState("");
  const [search, setSearch] = useState("");

  const [items, setItems] = useState([
    { productId: "", quantity: 1, rate: 0 },
  ]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadData = async () => {
    const supplierRes = await axios.get("https://saraskansteel-in.onrender.com/api/suppliers", {
      headers,
    });

    const productRes = await axios.get("https://saraskansteel-in.onrender.com/api/products", {
      headers,
    });

    const purchaseRes = await axios.get("https://saraskansteel-in.onrender.com/api/purchases", {
      headers,
    });

    setSuppliers(supplierRes.data.data || []);
    setProducts(productRes.data.data || []);
    setPurchases(purchaseRes.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addItem = () => {
    setItems([...items, { productId: "", quantity: 1, rate: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length === 1) {
      alert("At least one product is required");
      return;
    }

    const copy = [...items];
    copy.splice(index, 1);
    setItems(copy);
  };

  const updateItem = (index: number, field: string, value: any) => {
    const copy = [...items];
    copy[index] = { ...copy[index], [field]: value };
    setItems(copy);
  };

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.rate || 0),
    0
  );

  const totalQuantity = items.reduce(
    (sum, item) => sum + Number(item.quantity || 0),
    0
  );

  const savePurchase = async () => {
    if (!supplierId) {
      alert("Select supplier");
      return;
    }

    const invalid = items.some(
      (item) =>
        !item.productId ||
        Number(item.quantity || 0) <= 0 ||
        Number(item.rate || 0) < 0
    );

    if (invalid) {
      alert("Please complete all product rows");
      return;
    }

    try {
      await axios.post(
        "https://saraskansteel-in.onrender.com/api/purchases",
        { supplierId, items, note },
        { headers }
      );

      alert("Purchase saved and stock updated");

      setSupplierId("");
      setNote("");
      setItems([{ productId: "", quantity: 1, rate: 0 }]);
      loadData();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Purchase save failed");
    }
  };

  const selectedSupplier = suppliers.find((s) => s.id === supplierId);

  const filteredPurchases = purchases.filter((p) => {
    const text = `${p.purchaseNumber} ${p.supplier?.name || ""} ${
      p.supplier?.mobile || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const totalPurchaseValue = purchases.reduce(
    (sum, p) => sum + Number(p.totalAmount || 0),
    0
  );

  const exportCSV = () => {
    const rows = [
      ["Purchase No", "Supplier", "Mobile", "Date", "Total", "Items"],
      ...filteredPurchases.map((p) => [
        p.purchaseNumber,
        p.supplier?.name || "",
        p.supplier?.mobile || "",
        new Date(p.createdAt).toLocaleDateString(),
        money(p.totalAmount),
        (p.items || [])
          .map(
            (i: any) =>
              `${i.product?.name || ""} x ${i.quantity} @ ${money(i.rate)}`
          )
          .join(" | "),
      ]),
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
    a.download = "STRIDE_Purchases.csv";
    a.click();

    window.URL.revokeObjectURL(url);
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

        .summary-card,
        .card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .summary-card h3 {
          margin: 0;
          color: #6b7280;
          font-size: 14px;
        }

        .summary-card h2 {
          margin: 8px 0 0;
          font-size: 26px;
        }

        .layout {
          display: grid;
          grid-template-columns: 420px 1fr;
          gap: 20px;
          align-items: start;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .supplier-box {
          background: #f9fafb;
          border-radius: 14px;
          padding: 14px;
          border: 1px solid #e5e7eb;
        }

        .items-table-wrap,
        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 760px;
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

        .btn {
          border: none;
          border-radius: 10px;
          padding: 11px 14px;
          background: #111827;
          color: white;
          font-weight: 800;
          cursor: pointer;
        }

        .green { background: #16a34a; }
        .blue { background: #2563eb; }
        .red { background: #dc2626; }

        .total-box {
          background: #fff7ed;
          border: 1px solid #fed7aa;
          border-radius: 16px;
          padding: 16px;
          margin-top: 16px;
        }

        .total-box h2 {
          margin: 4px 0 0;
          color: #c2410c;
          font-size: 28px;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          margin-bottom: 16px;
        }

        .purchase-items {
          font-size: 13px;
          color: #374151;
          line-height: 1.5;
        }

        .mobile-cards {
          display: none;
        }

        .purchase-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }

        @media (max-width: 1050px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
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
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🛒 Purchase Entry</h1>
          <p style={{ margin: "6px 0 0" }}>
            Add supplier purchases and automatically update inventory stock.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Suppliers</h3>
            <h2>{suppliers.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Purchases</h3>
            <h2>{purchases.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Purchase Value</h3>
            <h2>₹{money(totalPurchaseValue)}</h2>
          </div>

          <div className="summary-card">
            <h3>Current Entry Total</h3>
            <h2>₹{money(totalAmount)}</h2>
          </div>
        </div>

        <div className="layout">
          <aside>
            <div className="card">
              <h2>Create Purchase</h2>

              <div className="form-grid">
                <label>Supplier</label>
                <select
                  className="input"
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                >
                  <option value="">Select Supplier</option>
                  {suppliers
                    .filter((s) => s.active !== false)
                    .map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} - {s.mobile}
                      </option>
                    ))}
                </select>

                {selectedSupplier && (
                  <div className="supplier-box">
                    <b>{selectedSupplier.name}</b>
                    <p style={{ margin: "6px 0" }}>
                      Mobile: {selectedSupplier.mobile}
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      GST: {selectedSupplier.gstNumber || "-"}
                    </p>
                    <p style={{ margin: "6px 0" }}>
                      Address: {selectedSupplier.address || "-"}
                    </p>
                  </div>
                )}

                <label>Purchase Note</label>
                <textarea
                  className="input"
                  rows={4}
                  placeholder="Optional purchase note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />

                <div className="total-box">
                  <span>Total Quantity</span>
                  <h2>{totalQuantity}</h2>
                  <br />
                  <span>Total Purchase Amount</span>
                  <h2>₹{money(totalAmount)}</h2>
                </div>

                <button className="btn green" onClick={savePurchase}>
                  Save Purchase
                </button>
              </div>
            </div>
          </aside>

          <main>
            <div className="card">
              <h2>Purchase Products</h2>

              <div className="items-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Current Stock</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Amount</th>
                      <th>Action</th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((item, index) => {
                      const product = products.find(
                        (p) => p.id === item.productId
                      );

                      return (
                        <tr key={index}>
                          <td>
                            <select
                              className="input"
                              value={item.productId}
                              onChange={(e) =>
                                updateItem(index, "productId", e.target.value)
                              }
                            >
                              <option value="">Select Product</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} ({p.sku})
                                </option>
                              ))}
                            </select>
                          </td>

                          <td>
                            {product
                              ? `${product.stock} ${product.unit}`
                              : "-"}
                          </td>

                          <td>
                            <input
                              className="input"
                              type="number"
                              value={item.quantity}
                              onChange={(e) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </td>

                          <td>
                            <input
                              className="input"
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                updateItem(index, "rate", Number(e.target.value))
                              }
                            />
                          </td>

                          <td>
                            ₹
                            {money(
                              Number(item.quantity || 0) *
                                Number(item.rate || 0)
                            )}
                          </td>

                          <td>
                            <button
                              className="btn red"
                              onClick={() => removeItem(index)}
                            >
                              Remove
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <br />

              <button className="btn blue" onClick={addItem}>
                + Add Product
              </button>
            </div>

            <div className="card">
              <h2>Purchase History</h2>

              <div className="toolbar">
                <input
                  className="input"
                  placeholder="Search purchase no, supplier, mobile..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <button className="btn green" onClick={exportCSV}>
                  Export Excel
                </button>

                <button className="btn red" onClick={() => setSearch("")}>
                  Clear
                </button>
              </div>

              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Purchase No</th>
                      <th>Supplier</th>
                      <th>Mobile</th>
                      <th>Date</th>
                      <th>Total</th>
                      <th>Items</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredPurchases.map((p) => (
                      <tr key={p.id}>
                        <td>{p.purchaseNumber}</td>
                        <td>{p.supplier?.name || "-"}</td>
                        <td>{p.supplier?.mobile || "-"}</td>
                        <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                        <td>₹{money(p.totalAmount)}</td>
                        <td className="purchase-items">
                          {(p.items || []).map((i: any) => (
                            <div key={i.id}>
                              {i.product?.name} × {i.quantity} @ ₹
                              {money(i.rate)}
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))}

                    {filteredPurchases.length === 0 && (
                      <tr>
                        <td colSpan={6}>No purchases found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mobile-cards">
                {filteredPurchases.map((p) => (
                  <div className="purchase-card" key={p.id}>
                    <h3>{p.purchaseNumber}</h3>
                    <p>
                      <b>Supplier:</b> {p.supplier?.name || "-"}
                    </p>
                    <p>
                      <b>Mobile:</b> {p.supplier?.mobile || "-"}
                    </p>
                    <p>
                      <b>Date:</b>{" "}
                      {new Date(p.createdAt).toLocaleDateString()}
                    </p>
                    <p>
                      <b>Total:</b> ₹{money(p.totalAmount)}
                    </p>
                    <div className="purchase-items">
                      {(p.items || []).map((i: any) => (
                        <div key={i.id}>
                          {i.product?.name} × {i.quantity} @ ₹{money(i.rate)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {filteredPurchases.length === 0 && <p>No purchases found.</p>}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Purchases;