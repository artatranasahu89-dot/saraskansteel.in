import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Suppliers() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    gstNumber: "",
    active: true,
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadSuppliers = async () => {
    const res = await axios.get("http://localhost:5000/api/suppliers", {
      headers,
    });

    setSuppliers(res.data.data || []);
  };

  const emptyForm = () => {
    setForm({
      name: "",
      mobile: "",
      address: "",
      gstNumber: "",
      active: true,
    });
    setEditingId("");
  };

  const saveSupplier = async () => {
    if (!form.name || !form.mobile) {
      alert("Name and mobile are required");
      return;
    }

    if (editingId) {
      await axios.put(
        `http://localhost:5000/api/suppliers/${editingId}`,
        form,
        { headers }
      );

      alert("Supplier updated");
    } else {
      await axios.post("http://localhost:5000/api/suppliers", form, {
        headers,
      });

      alert("Supplier added");
    }

    emptyForm();
    setShowForm(false);
    loadSuppliers();
  };

  const startEdit = (s: any) => {
    setEditingId(s.id);
    setShowForm(true);
    setForm({
      name: s.name || "",
      mobile: s.mobile || "",
      address: s.address || "",
      gstNumber: s.gstNumber || "",
      active: s.active !== false,
    });
  };

  const deleteSupplier = async (id: string) => {
    if (!confirm("Delete this supplier?")) return;

    await axios.delete(`http://localhost:5000/api/suppliers/${id}`, {
      headers,
    });

    alert("Supplier deleted");
    loadSuppliers();
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const text = `${s.name} ${s.mobile} ${s.supplierCode || ""} ${
      s.gstNumber || ""
    }`.toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const exportCSV = () => {
    const rows = [
      ["Supplier Code", "Name", "Mobile", "GST", "Address", "Status"],
      ...filteredSuppliers.map((s) => [
        s.supplierCode || "",
        s.name || "",
        s.mobile || "",
        s.gstNumber || "",
        s.address || "",
        s.active === false ? "Inactive" : "Active",
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
    a.download = "STRIDE_Suppliers.csv";
    a.click();

    window.URL.revokeObjectURL(url);
  };

  useEffect(() => {
    loadSuppliers();
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

        .toolbar {
          background: white;
          border-radius: 16px;
          padding: 16px;
          margin-bottom: 20px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 10px;
        }

        .form-card {
          background: white;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
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

        .blue {
          background: #2563eb;
        }

        .red {
          background: #dc2626;
        }

        .table-wrap {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
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

        .status-active {
          color: #16a34a;
          font-weight: 900;
        }

        .status-inactive {
          color: #dc2626;
          font-weight: 900;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        @media (max-width: 900px) {
          .toolbar,
          .form-grid {
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
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🚚 Suppliers</h1>
          <p style={{ margin: "6px 0 0" }}>
            Add, edit and manage suppliers for purchase entries.
          </p>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search supplier, mobile, code or GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button
            className="btn green"
            onClick={() => {
              emptyForm();
              setShowForm(!showForm);
            }}
          >
            {showForm ? "Close Form" : "+ Add Supplier"}
          </button>

          <button className="btn blue" onClick={exportCSV}>
            Export Excel
          </button>
        </div>

        {showForm && (
          <div className="form-card">
            <h2>{editingId ? "Edit Supplier" : "Add Supplier"}</h2>

            <div className="form-grid">
              <input
                className="input"
                placeholder="Supplier Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              />

              <input
                className="input"
                placeholder="GST Number"
                value={form.gstNumber}
                onChange={(e) =>
                  setForm({ ...form, gstNumber: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Address"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
              />

              <select
                className="input"
                value={form.active ? "ACTIVE" : "INACTIVE"}
                onChange={(e) =>
                  setForm({ ...form, active: e.target.value === "ACTIVE" })
                }
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>

              <button className="btn green" onClick={saveSupplier}>
                {editingId ? "Save Changes" : "Add Supplier"}
              </button>
            </div>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Supplier Code</th>
                <th>Name</th>
                <th>Mobile</th>
                <th>GST</th>
                <th>Address</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.id}>
                  <td>{s.supplierCode}</td>
                  <td>{s.name}</td>
                  <td>{s.mobile}</td>
                  <td>{s.gstNumber || "-"}</td>
                  <td>{s.address || "-"}</td>
                  <td>
                    <span
                      className={
                        s.active === false
                          ? "status-inactive"
                          : "status-active"
                      }
                    >
                      {s.active === false ? "Inactive" : "Active"}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <button className="btn" onClick={() => startEdit(s)}>
                        Edit
                      </button>

                      <button
                        className="btn red"
                        onClick={() => deleteSupplier(s.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td colSpan={7}>No suppliers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Suppliers;