import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Products() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    imageUrl: "",
    price: "",
    stock: "",
    unit: "PCS",
    labourRate: "",
    categoryId: "",
    isActive: true,
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadData = async () => {
    const productRes = await axios.get("http://localhost:5000/api/products", {
      headers,
    });

    const categoryRes = await axios.get("http://localhost:5000/api/categories", {
      headers,
    });

    setProducts(productRes.data.data || []);
    setCategories(categoryRes.data.data || []);
  };

  const resetForm = () => {
    setEditingId("");
    setForm({
      name: "",
      sku: "",
      description: "",
      imageUrl: "",
      price: "",
      stock: "",
      unit: "PCS",
      labourRate: "",
      categoryId: "",
      isActive: true,
    });
  };
  const uploadProductImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
  try {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    const res = await axios.post(
      "http://localhost:5000/api/upload/product-image",
      formData,
      {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "multipart/form-data",
        },
      }
    );

    setForm({
      ...form,
      imageUrl: res.data.imageUrl,
    });

    alert("Product image uploaded");
  } catch (error: any) {
    alert(error?.response?.data?.message || "Image upload failed");
  }
};

  const saveProduct = async () => {
    if (!form.name || !form.sku || !form.categoryId) {
      alert("Product name, SKU and category are required");
      return;
    }

    const payload = {
      name: form.name,
      sku: form.sku,
      description: form.description || null,
      imageUrl: form.imageUrl || null,
      price: Number(form.price || 0),
      stock: Number(form.stock || 0),
      unit: form.unit,
      labourRate: Number(form.labourRate || 0),
      categoryId: form.categoryId,
      isActive: form.isActive,
    };

    if (editingId) {
      await axios.put(`http://localhost:5000/api/products/${editingId}`, payload, {
        headers,
      });

      alert("Product updated");
    } else {
      await axios.post("http://localhost:5000/api/products", payload, {
        headers,
      });

      alert("Product added");
    }

    resetForm();
    setShowForm(false);
    loadData();
  };

  const editProduct = (p: any) => {
    setEditingId(p.id);
    setShowForm(true);

    setForm({
      name: p.name || "",
      sku: p.sku || "",
      description: p.description || "",
      imageUrl: p.imageUrl || "",
      price: String(p.price || ""),
      stock: String(p.stock || ""),
      unit: p.unit || "PCS",
      labourRate: String(p.labourRate || ""),
      categoryId: p.categoryId || p.category?.id || "",
      isActive: p.isActive !== false,
    });
  };

  const deleteProduct = async (id: string) => {
    if (!confirm("Delete this product?")) return;

    await axios.delete(`http://localhost:5000/api/products/${id}`, {
      headers,
    });

    alert("Product deleted");
    loadData();
  };

  const filteredProducts = products.filter((p) => {
    const text = `${p.name} ${p.sku} ${p.category?.name || ""} ${
      p.unit || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const totalStockValue = products.reduce(
    (sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0),
    0
  );

  const activeProducts = products.filter((p) => p.isActive !== false);
  const lowStockProducts = products.filter((p) => Number(p.stock || 0) <= 10);

  const exportCSV = () => {
    const rows = [
      [
        "Product",
        "SKU",
        "Category",
        "Price",
        "Current Stock",
        "Unit",
        "Labour Rate",
        "Status",
      ],
      ...filteredProducts.map((p) => [
        p.name || "",
        p.sku || "",
        p.category?.name || "",
        money(p.price),
        p.stock,
        p.unit,
        money(p.labourRate),
        p.isActive === false ? "Inactive" : "Active",
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
    a.download = "STRIDE_Products.csv";
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
        .toolbar,
        .form-card,
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

        .toolbar {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .wide {
          grid-column: span 2;
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

        .danger {
          color: #dc2626;
          font-weight: 900;
        }

        .orange {
          color: #f59e0b;
          font-weight: 900;
        }

        .success {
          color: #16a34a;
          font-weight: 900;
        }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 1100px;
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

        .product-cell {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .product-img {
          width: 46px;
          height: 46px;
          border-radius: 10px;
          object-fit: cover;
          background: #e5e7eb;
        }

        .badge {
          padding: 5px 10px;
          border-radius: 999px;
          font-weight: 900;
          font-size: 12px;
          display: inline-block;
        }

        .badge-green {
          background: #dcfce7;
          color: #166534;
        }

        .badge-red {
          background: #fee2e2;
          color: #991b1b;
        }

        .badge-orange {
          background: #fef3c7;
          color: #92400e;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mobile-cards {
          display: none;
        }

        .product-card {
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

          .toolbar,
          .form-grid {
            grid-template-columns: 1fr;
          }

          .wide {
            grid-column: span 1;
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

          .table-card {
            display: none;
          }

          .mobile-cards {
            display: block;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>📦 Product Management</h1>
          <p style={{ margin: "6px 0 0" }}>
            Manage selling products. Stock changes are handled from Inventory and Purchase Entry.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Products</h3>
            <h2>{products.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Active Products</h3>
            <h2 className="success">{activeProducts.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Low Stock</h3>
            <h2 className="orange">{lowStockProducts.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Stock Value</h3>
            <h2>₹{money(totalStockValue)}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search product, SKU, category or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn green"
            onClick={() => {
              resetForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close Form" : "+ Add Product"}
          </button>

          <button className="btn blue" onClick={exportCSV}>
            Export Excel
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingId ? "Edit Product" : "Add Product"}</h2>

            <div className="form-grid">
              <input
                className="input"
                placeholder="Product Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input"
                placeholder="SKU"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
              />

              <select
                className="input"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.categoryNumber} - {c.name}
                  </option>
                ))}
              </select>

              <select
                className="input"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              >
                <option value="PCS">PCS</option>
                <option value="BAG">BAG</option>
                <option value="KG">KG</option>
                <option value="TON">TON</option>
                <option value="MTR">MTR</option>
                <option value="SHEET">SHEET</option>
              </select>

              <input
                className="input"
                type="number"
                placeholder="Selling Price"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />

              <input
                className="input"
                type="number"
                placeholder="Opening / Current Stock"
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: e.target.value })}
              />

              <input
                className="input"
                type="number"
                placeholder="Labour Rate"
                value={form.labourRate}
                onChange={(e) =>
                  setForm({ ...form, labourRate: e.target.value })
                }
              />

              <select
                className="input"
                value={form.isActive ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.value === "ACTIVE" })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <div className="wide">
  <input
    className="input"
    type="file"
    accept="image/*"
    onChange={uploadProductImage}
  />

  {form.imageUrl && (
    <img
      src={form.imageUrl}
      alt="Product Preview"
      style={{
        width: 90,
        height: 90,
        objectFit: "cover",
        borderRadius: 12,
        marginTop: 8,
        border: "1px solid #ddd",
      }}
    />
  )}
</div>

              <input
                className="input wide"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <button className="btn green" onClick={saveProduct}>
                {editingId ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                  <th>Labour Rate</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredProducts.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="product-cell">
                        <img
                          className="product-img"
                          src={
                            p.imageUrl ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(p.name || "Product")
                          }
                          alt={p.name}
                        />
                        <div>
                          <b>{p.name}</b>
                          <br />
                          <small>{p.description || "-"}</small>
                        </div>
                      </div>
                    </td>
                    <td>{p.sku}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td>₹{money(p.price)}</td>
                    <td
                      className={
                        Number(p.stock || 0) <= 0
                          ? "danger"
                          : Number(p.stock || 0) <= 10
                          ? "orange"
                          : ""
                      }
                    >
                      {p.stock}
                    </td>
                    <td>{p.unit}</td>
                    <td>₹{money(p.labourRate)}</td>
                    <td>
                      {p.isActive === false ? (
                        <span className="badge badge-red">Inactive</span>
                      ) : (
                        <span className="badge badge-green">Active</span>
                      )}
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn" onClick={() => editProduct(p)}>
                          Edit
                        </button>

                        <button
                          className="btn red"
                          onClick={() => deleteProduct(p.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={9}>No products found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-cards">
          {filteredProducts.map((p) => (
            <div className="product-card" key={p.id}>
              <h3>{p.name}</h3>
              <p><b>SKU:</b> {p.sku}</p>
              <p><b>Category:</b> {p.category?.name || "-"}</p>
              <p><b>Price:</b> ₹{money(p.price)}</p>
              <p><b>Stock:</b> {p.stock} {p.unit}</p>
              <p><b>Labour Rate:</b> ₹{money(p.labourRate)}</p>
              <p>
                <b>Status:</b>{" "}
                {p.isActive === false ? "Inactive" : "Active"}
              </p>

              <div className="actions">
                <button className="btn" onClick={() => editProduct(p)}>
                  Edit
                </button>

                <button className="btn red" onClick={() => deleteProduct(p.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredProducts.length === 0 && <p>No products found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Products;