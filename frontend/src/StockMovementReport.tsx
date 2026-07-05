import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function StockMovementReport() {
  const [products, setProducts] = useState<any[]>([]);
  const [movements, setMovements] = useState<any[]>([]);
  const [productId, setProductId] = useState("");
  const [type, setType] = useState("");
  const [search, setSearch] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadData = async () => {
    const productRes = await axios.get("https://saraskansteel-in.onrender.com/api/products", {
      headers,
    });

    const params = new URLSearchParams();
    if (productId) params.append("productId", productId);
    if (type) params.append("type", type);

    const movementRes = await axios.get(
      "https://saraskansteel-in.onrender.com/api/inventory/report?" + params.toString(),
      { headers }
    );

    setProducts(productRes.data.data || []);
    setMovements(movementRes.data.data || []);
  };

  const filtered = movements.filter((m) => {
    const text = `${m.product?.name || ""} ${m.product?.sku || ""} ${
      m.referenceNo || ""
    } ${m.remark || ""}`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const stockInQty = filtered
    .filter((m) => m.type === "IN")
    .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  const stockOutQty = filtered
    .filter((m) => m.type === "OUT")
    .reduce((sum, m) => sum + Number(m.quantity || 0), 0);

  const productsAffected = new Set(filtered.map((m) => m.productId)).size;

  const exportCSV = () => {
    const rows = [
      ["Date", "Product", "SKU", "Type", "Quantity", "Reference", "Remark", "Current Stock"],
      ...filtered.map((m) => [
        new Date(m.createdAt).toLocaleString(),
        m.product?.name || "",
        m.product?.sku || "",
        m.type,
        m.quantity,
        m.referenceNo || "",
        m.remark || "",
        m.product?.stock || 0,
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
    a.download = "STRIDE_Stock_Movement_Report.csv";
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
        .filter-card,
        .table-card {
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

        .filter-card {
          display: grid;
          grid-template-columns: 1fr 180px 1fr auto auto;
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

        .green { background: #16a34a; }
        .red { background: #dc2626; }

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
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
        }

        .in {
          background: #dcfce7;
          color: #166534;
        }

        .out {
          background: #fee2e2;
          color: #991b1b;
        }

        @media (max-width: 1000px) {
          .summary-grid {
            grid-template-columns: 1fr 1fr;
          }

          .filter-card {
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
          <h1 style={{ margin: 0 }}>📊 Stock Movement Report</h1>
          <p style={{ margin: "6px 0 0" }}>
            Track stock IN and OUT from purchases, invoices, cancellations and manual adjustments.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Movements</h3>
            <h2>{filtered.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Stock In Qty</h3>
            <h2>{stockInQty}</h2>
          </div>

          <div className="summary-card">
            <h3>Stock Out Qty</h3>
            <h2>{stockOutQty}</h2>
          </div>

          <div className="summary-card">
            <h3>Products Affected</h3>
            <h2>{productsAffected}</h2>
          </div>
        </div>

        <div className="filter-card">
          <select
            className="input"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
          >
            <option value="">All Products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.sku})
              </option>
            ))}
          </select>

          <select
            className="input"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="">All Types</option>
            <option value="IN">Stock IN</option>
            <option value="OUT">Stock OUT</option>
          </select>

          <input
            className="input"
            placeholder="Search product, reference or remark..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button className="btn" onClick={loadData}>
            Apply
          </button>

          <button className="btn green" onClick={exportCSV}>
            Export Excel
          </button>

          <button
            className="btn red"
            onClick={() => {
              setProductId("");
              setType("");
              setSearch("");
              setTimeout(loadData, 100);
            }}
          >
            Clear
          </button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Reference</th>
                  <th>Remark</th>
                  <th>Current Stock</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>{new Date(m.createdAt).toLocaleString()}</td>
                    <td>{m.product?.name || "-"}</td>
                    <td>{m.product?.sku || "-"}</td>
                    <td>
                      <span className={`badge ${m.type === "IN" ? "in" : "out"}`}>
                        {m.type}
                      </span>
                    </td>
                    <td>{m.quantity}</td>
                    <td>{m.referenceNo || "-"}</td>
                    <td>{m.remark || "-"}</td>
                    <td>{m.product?.stock || 0}</td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8}>No stock movements found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default StockMovementReport;