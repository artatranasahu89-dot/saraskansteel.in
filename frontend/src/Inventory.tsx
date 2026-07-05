import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Inventory() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [movementType, setMovementType] = useState("IN");
  const [quantity, setQuantity] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [remark, setRemark] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadData = async () => {
    const productRes = await axios.get("http://localhost:5000/api/products", {
      headers,
    });

    const movementRes = await axios.get(
      "http://localhost:5000/api/inventory/movements",
      { headers }
    );

    setProducts(productRes.data.data || []);
    setMovements(movementRes.data.data || []);
  };

  const saveMovement = async () => {
    if (!selectedProductId) {
      alert("Select product");
      return;
    }

    if (Number(quantity || 0) <= 0) {
      alert("Enter valid quantity");
      return;
    }

    const endpoint =
      movementType === "IN"
        ? "http://localhost:5000/api/inventory/stock-in"
        : "http://localhost:5000/api/inventory/stock-out";

    try {
      await axios.post(
        endpoint,
        {
          productId: selectedProductId,
          quantity: Number(quantity),
          referenceNo,
          remark,
        },
        { headers }
      );

      alert("Stock updated successfully");

      setSelectedProductId("");
      setQuantity("");
      setReferenceNo("");
      setRemark("");
      setMovementType("IN");

      loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || "Stock update failed");
    }
  };

  const filteredProducts = products.filter((p) => {
    const text = `${p.name} ${p.sku} ${p.category?.name || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (sum, p) => sum + Number(p.stock || 0),
    0
  );

  const lowStockProducts = products.filter((p) => Number(p.stock || 0) <= 10);

  const stockValue = products.reduce(
    (sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0),
    0
  );

  const exportCSV = () => {
    const rows = [
      ["Product", "SKU", "Category", "Stock", "Unit", "Price", "Stock Value"],
      ...filteredProducts.map((p) => [
        p.name,
        p.sku,
        p.category?.name || "",
        p.stock,
        p.unit,
        money(p.price),
        money(Number(p.stock || 0) * Number(p.price || 0)),
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
    a.download = "STRIDE_Inventory.csv";
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
        }

        .inventory-layout {
          display: grid;
          grid-template-columns: 390px 1fr;
          gap: 20px;
          align-items: start;
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .toolbar {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
          margin-bottom: 16px;
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

        .blue {
          background: #2563eb;
        }

        .orange {
          color: #f59e0b;
          font-weight: 900;
        }

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 900px;
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

        .badge {
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 900;
        }

        .badge-in {
          background: #dcfce7;
          color: #166534;
        }

        .badge-out {
          background: #fee2e2;
          color: #991b1b;
        }

        .movement-list {
          max-height: 440px;
          overflow-y: auto;
          display: grid;
          gap: 10px;
        }

        .movement-item {
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 10px;
          background: #f9fafb;
        }

        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .inventory-layout {
            grid-template-columns: 1fr;
          }

          .toolbar {
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

          .summary-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>📦 Inventory Management</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track stock, stock in, stock out and movement history.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Products</h3>
            <h2>{totalProducts}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Stock Units</h3>
            <h2>{totalStockUnits}</h2>
          </div>

          <div className="summary-card">
            <h3>Low Stock Products</h3>
            <h2 className="danger">{lowStockProducts.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Stock Value</h3>
            <h2>₹{money(stockValue)}</h2>
          </div>
        </div>

        <div className="inventory-layout">
          <aside className="card">
            <h2>Stock Entry</h2>

            <div className="form-grid">
              <label>Movement Type</label>
              <select
                className="input"
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
              >
                <option value="IN">Stock In</option>
                <option value="OUT">Stock Out</option>
              </select>

              <label>Product</label>
              <select
                className="input"
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
              >
                <option value="">Select product</option>
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - Stock {p.stock} {p.unit}
                  </option>
                ))}
              </select>

              <label>Quantity</label>
              <input
                className="input"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="Enter quantity"
              />

              <label>Reference No</label>
              <input
                className="input"
                value={referenceNo}
                onChange={(e) => setReferenceNo(e.target.value)}
                placeholder="Purchase bill / adjustment ref"
              />

              <label>Remark</label>
              <textarea
                className="input"
                rows={4}
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                placeholder="Optional remark"
              />

              <button
                className={movementType === "IN" ? "btn green" : "btn red"}
                onClick={saveMovement}
              >
                {movementType === "IN" ? "Add Stock" : "Remove Stock"}
              </button>
            </div>
          </aside>

          <main>
            <div className="card">
              <h2>Current Stock</h2>

              <div className="toolbar">
                <input
                  className="input"
                  placeholder="Search product, SKU, category..."
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
                      <th>Product</th>
                      <th>SKU</th>
                      <th>Category</th>
                      <th>Stock</th>
                      <th>Unit</th>
                      <th>Price</th>
                      <th>Value</th>
                      <th>Status</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((p) => (
                      <tr key={p.id}>
                        <td>{p.name}</td>
                        <td>{p.sku}</td>
                        <td>{p.category?.name || "-"}</td>
                        <td className={Number(p.stock) <= 10 ? "danger" : ""}>
                          {p.stock}
                        </td>
                        <td>{p.unit}</td>
                        <td>₹{money(p.price)}</td>
                        <td>₹{money(Number(p.stock || 0) * Number(p.price || 0))}</td>
                        <td>
                          {Number(p.stock || 0) <= 0 ? (
                            <span className="danger">Out of Stock</span>
                          ) : Number(p.stock || 0) <= 10 ? (
                            <span className="orange">Low Stock</span>
                          ) : (
                            <span>Available</span>
                          )}
                        </td>
                      </tr>
                    ))}

                    {filteredProducts.length === 0 && (
                      <tr>
                        <td colSpan={8}>No products found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card">
              <h2>Stock Movement History</h2>

              <div className="movement-list">
                {movements.slice(0, 30).map((m) => (
                  <div className="movement-item" key={m.id}>
                    <b>{m.product?.name || "-"}</b>
                    <p style={{ margin: "6px 0" }}>
                      <span
                        className={
                          m.type === "IN"
                            ? "badge badge-in"
                            : "badge badge-out"
                        }
                      >
                        {m.type}
                      </span>{" "}
                      Qty: <b>{m.quantity}</b> | Ref: {m.referenceNo || "-"}
                    </p>
                    <small>
                      {new Date(m.createdAt).toLocaleString()} ·{" "}
                      {m.remark || "No remark"}
                    </small>
                  </div>
                ))}

                {movements.length === 0 && <p>No stock movements found.</p>}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Inventory;