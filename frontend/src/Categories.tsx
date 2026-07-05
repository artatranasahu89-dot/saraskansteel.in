import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Categories() {
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    categoryNumber: "",
    name: "",
    description: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadData = async () => {
    const categoryRes = await axios.get("http://localhost:5000/api/categories", {
      headers,
    });

    const productRes = await axios.get("http://localhost:5000/api/products", {
      headers,
    });

    setCategories(categoryRes.data.data || []);
    setProducts(productRes.data.data || []);
  };

  const resetForm = () => {
    setForm({
      categoryNumber: "",
      name: "",
      description: "",
    });
    setEditingId("");
  };

  const saveCategory = async () => {
    if (!form.categoryNumber || !form.name) {
      alert("Category number and name are required");
      return;
    }

    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/categories/${editingId}`,
        {
          categoryNumber: Number(form.categoryNumber),
          name: form.name,
          description: form.description,
        },
        { headers }
      );

      alert("Category updated");
    } else {
      await axios.post(
        "http://localhost:5000/api/categories",
        {
          categoryNumber: Number(form.categoryNumber),
          name: form.name,
          description: form.description,
        },
        { headers }
      );

      alert("Category added");
    }

    resetForm();
    setShowForm(false);
    loadData();
  };

  const editCategory = (c: any) => {
    setEditingId(c.id);
    setShowForm(true);
    setForm({
      categoryNumber: String(c.categoryNumber || ""),
      name: c.name || "",
      description: c.description || "",
    });
  };

  const deleteCategory = async (id: string) => {
    const productCount = products.filter((p) => p.categoryId === id).length;

    if (productCount > 0) {
      alert("This category has products. Move/delete products first.");
      return;
    }

    if (!confirm("Delete this category?")) return;

    await axios.delete(`http://localhost:5000/api/categories/${id}`, {
      headers,
    });

    alert("Category deleted");
    loadData();
  };

  const getProductCount = (categoryId: string) => {
    return products.filter((p) => p.categoryId === categoryId).length;
  };

  const filteredCategories = categories.filter((c) => {
    const text = `${c.categoryNumber} ${c.name} ${c.description || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const rows = [
      ["Category Number", "Name", "Description", "Product Count"],
      ...filteredCategories.map((c) => [
        c.categoryNumber,
        c.name,
        c.description || "",
        getProductCount(c.id),
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
    a.download = "STRIDE_Categories.csv";
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
          grid-template-columns: 160px 1fr 1fr auto;
          gap: 10px;
          align-items: end;
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
        .blue { background: #2563eb; }
        .red { background: #dc2626; }

        .table-wrap {
          overflow-x: auto;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 850px;
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
          padding: 5px 10px;
          border-radius: 999px;
          background: #dbeafe;
          color: #1d4ed8;
          font-weight: 900;
          font-size: 12px;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mobile-cards {
          display: none;
        }

        .category-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }

        @media (max-width: 950px) {
          .summary-grid,
          .toolbar,
          .form-grid {
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
          <h1 style={{ margin: 0 }}>📂 Category Management</h1>
          <p style={{ margin: "6px 0 0" }}>
            Manage product categories for cement, sariya and construction materials.
          </p>
        </div>

        <div className="summary-grid">
          <div className="summary-card">
            <h3>Total Categories</h3>
            <h2>{categories.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Total Products</h3>
            <h2>{products.length}</h2>
          </div>

          <div className="summary-card">
            <h3>Filtered Results</h3>
            <h2>{filteredCategories.length}</h2>
          </div>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search category number, name or description..."
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
            {showForm ? "Close Form" : "+ Add Category"}
          </button>

          <button className="btn blue" onClick={exportCSV}>
            Export Excel
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingId ? "Edit Category" : "Add Category"}</h2>

            <div className="form-grid">
              <input
                className="input"
                placeholder="Category No"
                type="number"
                value={form.categoryNumber}
                onChange={(e) =>
                  setForm({ ...form, categoryNumber: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Category Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input"
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />

              <button className="btn green" onClick={saveCategory}>
                {editingId ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        )}

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Category No</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Products</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((c) => (
                  <tr key={c.id}>
                    <td>{c.categoryNumber}</td>
                    <td>{c.name}</td>
                    <td>{c.description || "-"}</td>
                    <td>
                      <span className="badge">{getProductCount(c.id)}</span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="btn" onClick={() => editCategory(c)}>
                          Edit
                        </button>

                        <button
                          className="btn red"
                          onClick={() => deleteCategory(c.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={5}>No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-cards">
          {filteredCategories.map((c) => (
            <div className="category-card" key={c.id}>
              <h3>{c.name}</h3>
              <p><b>Category No:</b> {c.categoryNumber}</p>
              <p><b>Description:</b> {c.description || "-"}</p>
              <p><b>Products:</b> {getProductCount(c.id)}</p>

              <div className="actions">
                <button className="btn" onClick={() => editCategory(c)}>
                  Edit
                </button>

                <button className="btn red" onClick={() => deleteCategory(c.id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}

          {filteredCategories.length === 0 && <p>No categories found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Categories;