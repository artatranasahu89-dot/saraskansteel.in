import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Staffs() {
  const [records, setRecords] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"STAFF" | "TRANSPORT">("STAFF");
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    type: "STAFF",
    name: "",
    mobile: "",
    password: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadRecords = async () => {
    const res = await axios.get("http://localhost:5000/api/staff", {
      headers,
    });
    setRecords(res.data.data);
  };

  const addRecord = async () => {
    if (!form.name || !form.mobile) {
      alert("Name and mobile are required");
      return;
    }

    if (form.type === "STAFF" && !form.password) {
      alert("Password is required for staff");
      return;
    }

    await axios.post("http://localhost:5000/api/staff", form, {
      headers,
    });

    alert(form.type === "STAFF" ? "Staff added" : "Transport added");

    setForm({
      type: "STAFF",
      name: "",
      mobile: "",
      password: "",
    });

    setActiveTab(form.type as "STAFF" | "TRANSPORT");
    loadRecords();
  };

  const changeStatus = async (id: string, active: boolean) => {
    await axios.patch(
      `http://localhost:5000/api/staff/${id}/status`,
      { active },
      { headers }
    );

    loadRecords();
  };

  const deleteRecord = async (id: string) => {
    if (!confirm("Are you sure?")) return;

    await axios.delete(`http://localhost:5000/api/staff/${id}`, {
      headers,
    });

    alert("Deleted");
    loadRecords();
  };

  const filteredRecords = records
    .filter((r) => (r.type || "STAFF") === activeTab)
    .filter(
      (r) =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.mobile?.includes(search) ||
        r.staffCode?.toLowerCase().includes(search.toLowerCase())
    );

  useEffect(() => {
    loadRecords();
  }, []);

  return (
    <AdminLayout>
      <style>{`
        .staff-page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .staff-header {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 18px;
          padding: 22px;
          margin-bottom: 20px;
        }

        .staff-layout {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
          align-items: start;
        }

        .panel {
          background: white;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
        }

        .form-grid {
          display: grid;
          gap: 12px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
        }

        .primary-btn {
          background: #111827;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 12px;
          cursor: pointer;
          font-weight: 700;
        }

        .tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }

        .tab-btn {
          border: none;
          border-radius: 999px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 700;
        }

        .tab-active {
          background: #111827;
          color: white;
        }

        .tab-normal {
          background: #e5e7eb;
          color: #111827;
        }

        .top-tools {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          align-items: center;
        }

        .cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .person-card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          border: 1px solid #e5e7eb;
        }

        .staff-avatar {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          display: grid;
          place-items: center;
          font-weight: 800;
          color: white;
          background: #2563eb;
          margin-bottom: 10px;
        }

        .status {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 700;
        }

        .active {
          background: #dcfce7;
          color: #166534;
        }

        .inactive {
          background: #fee2e2;
          color: #991b1b;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 14px;
        }

        .activate-btn {
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 9px 11px;
          cursor: pointer;
        }

        .deactivate-btn {
          background: #f97316;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 9px 11px;
          cursor: pointer;
        }

        .delete-btn {
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 9px 11px;
          cursor: pointer;
        }

        @media (max-width: 1000px) {
          .staff-layout {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 600px) {
          .staff-page {
            padding: 12px;
          }

          .top-tools {
            flex-direction: column;
            align-items: stretch;
          }

          .cards-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="staff-page">
        <div className="staff-header">
          <h1 style={{ margin: 0 }}>👨‍💼 Staff / Transport</h1>
          <p style={{ margin: "6px 0 0" }}>
            Manage staff users and transport records for STRIDE operations.
          </p>
        </div>

        <div className="staff-layout">
          <section className="panel">
            <h2>Add New</h2>

            <div className="form-grid">
              <select
                className="input"
                value={form.type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    type: e.target.value,
                    password: "",
                  })
                }
              >
                <option value="STAFF">Staff</option>
                <option value="TRANSPORT">Transport</option>
              </select>

              <input
                className="input"
                placeholder={
                  form.type === "STAFF"
                    ? "Staff Name"
                    : "Transport / Vehicle Name"
                }
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Mobile Number"
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: e.target.value })
                }
              />

              {form.type === "STAFF" && (
                <input
                  className="input"
                  type="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              )}

              <button className="primary-btn" onClick={addRecord}>
                {form.type === "STAFF" ? "Add Staff" : "Add Transport"}
              </button>
            </div>
          </section>

          <section>
            <div className="top-tools">
              <div className="tabs">
                <button
                  className={`tab-btn ${
                    activeTab === "STAFF" ? "tab-active" : "tab-normal"
                  }`}
                  onClick={() => setActiveTab("STAFF")}
                >
                  Staff
                </button>

                <button
                  className={`tab-btn ${
                    activeTab === "TRANSPORT" ? "tab-active" : "tab-normal"
                  }`}
                  onClick={() => setActiveTab("TRANSPORT")}
                >
                  Transport
                </button>
              </div>

              <input
                className="input"
                placeholder="Search by name, mobile or code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ maxWidth: "360px" }}
              />
            </div>

            <div className="cards-grid">
              {filteredRecords.map((s) => (
                <div className="person-card" key={s.id}>
                  <div className="staff-avatar">
                    {(s.name || "?").charAt(0).toUpperCase()}
                  </div>

                  <h3 style={{ margin: "0 0 6px" }}>{s.name}</h3>

                  <p>
                    <b>Code:</b> {s.staffCode}
                  </p>

                  <p>
                    <b>Mobile:</b> {s.mobile}
                  </p>

                  <p>
                    <b>Type:</b> {s.type || "STAFF"}
                  </p>

                  <span className={`status ${s.active ? "active" : "inactive"}`}>
                    {s.active ? "ACTIVE" : "DEACTIVE"}
                  </span>

                  <div className="actions">
                    {s.active ? (
                      <button
                        className="deactivate-btn"
                        onClick={() => changeStatus(s.id, false)}
                      >
                        Deactivate
                      </button>
                    ) : (
                      <button
                        className="activate-btn"
                        onClick={() => changeStatus(s.id, true)}
                      >
                        Activate
                      </button>
                    )}

                    <button
                      className="delete-btn"
                      onClick={() => deleteRecord(s.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}

              {filteredRecords.length === 0 && (
                <p>No {activeTab.toLowerCase()} records found.</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  );
}

export default Staffs;