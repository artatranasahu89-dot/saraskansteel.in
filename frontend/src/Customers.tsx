import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function Customers() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState("");

  const [form, setForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    address: "",
    gstNumber: "",
    outstandingAmount: "",
  });

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const formatDate = (value: any) => {
    if (!value) return "-";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}-${month}-${year}`;
  };

  const onlyDigits = (value: any) => {
    return String(value || "").replace(/\D/g, "").slice(0, 10);
  };

  const getCustomerId = (customer: any) => {
    return (
      customer.customerNumber ||
      customer.customerId ||
      customer.customerCode ||
      customer.id ||
      "-"
    );
  };

  const getCustomerLoginId = (customer: any) => {
    return customer.mobile || getCustomerId(customer);
  };

 const buildCustomerPayload = () => {
  const cleanMobile = onlyDigits(form.mobile);

  const payload: any = {
    name: form.name.trim(),
    outstandingAmount: Number(form.outstandingAmount || 0),
  };

  if (cleanMobile) {
    payload.mobile = cleanMobile;
  }

  if (form.email.trim()) {
    payload.email = form.email.trim().toLowerCase();
  }

  if (form.dateOfBirth) {
    payload.dateOfBirth = form.dateOfBirth;
  }

  if (form.address.trim()) {
    payload.address = form.address.trim();
  }

  if (form.gstNumber.trim()) {
    payload.gstNumber = form.gstNumber.trim().toUpperCase();
  }

  return payload;
};

  const emptyForm = () => {
    setForm({
      name: "",
      mobile: "",
      email: "",
      dateOfBirth: "",
      address: "",
      gstNumber: "",
      outstandingAmount: "",
    });
    setEditingId("");
  };

  const loadCustomers = async () => {
    try {
      const res = await axios.get("https://saraskansteel-in.onrender.com/api/customers", {
        headers,
      });

      setCustomers(res.data?.data || res.data?.customers || []);
    } catch (error) {
      console.log("Customers load error:", error);
      setCustomers([]);
    }
  };

  const loadOrders = async () => {
    try {
      const res = await axios.get("https://saraskansteel-in.onrender.com/api/orders", {
        headers,
      });

      setOrders(res.data?.data || res.data?.orders || []);
    } catch (error) {
      console.log("Orders load skipped:", error);
      setOrders([]);
    }
  };

 const addCustomer = async () => {
  try {
    if (!form.name.trim()) {
      alert("Customer name is required");
      return;
    }

    const cleanMobile = String(form.mobile || "")
      .replace(/\D/g, "")
      .slice(0, 10);

    if (form.mobile.trim() && cleanMobile.length !== 10) {
      alert("Mobile number must be 10 digits, or leave it empty.");
      return;
    }

    const res = await axios.post(
      "https://saraskansteel-in.onrender.com/api/customers",
      {
        name: form.name,
        mobile: cleanMobile,
        address: form.address,
        gstNumber: form.gstNumber,
        outstandingAmount: Number(form.outstandingAmount || 0),
      },
      { headers }
    );

    alert(
      `Customer added successfully\nCustomer ID: ${
        res.data?.loginId ||
        res.data?.customerNumber ||
        res.data?.data?.customerNumber ||
        res.data?.data?.customerId ||
        res.data?.data?.id ||
        "Created"
      }\nInitial Password: ${res.data?.initialPassword || "-"}`
    );

    emptyForm();
    setShowForm(false);
    loadCustomers();
  } catch (error: any) {
    console.log("Add customer error:", error?.response?.data || error);

    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Customer add failed"
    );
  }
};

  const startEdit = (customer: any) => {
    setEditingId(customer.id);
    setShowForm(true);

    setForm({
      name: customer.name || "",
      mobile: customer.mobile || "",
      email: customer.email || "",
      dateOfBirth: customer.dateOfBirth
        ? String(customer.dateOfBirth).slice(0, 10)
        : "",
      address: customer.address || "",
      gstNumber: customer.gstNumber || "",
      outstandingAmount: String(customer.outstandingAmount || 0),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const saveEdit = async () => {
  try {
    if (!form.name.trim()) {
      alert("Customer name is required");
      return;
    }

    const cleanMobile = onlyDigits(form.mobile);

    if (form.mobile.trim() && cleanMobile.length !== 10) {
      alert("Mobile number must be 10 digits, or leave it empty.");
      return;
    }

    await axios.put(
      `https://saraskansteel-in.onrender.com/api/customers/${editingId}`,
      buildCustomerPayload(),
      { headers }
    );

    alert("Customer updated successfully");

    emptyForm();
    setShowForm(false);
    loadCustomers();
  } catch (error: any) {
    console.log("Update customer error:", error?.response?.data || error);

    alert(
      error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Customer update failed"
    );
  }
};

  const getLastPurchaseDate = (customer: any) => {
    const customerOrders = orders.filter((order: any) => {
      return (
        order.customerRecordId === customer.id ||
        order.customerId === customer.id ||
        order.customerRecord?.id === customer.id ||
        order.customerRecord?.mobile === customer.mobile ||
        order.customer?.mobile === customer.mobile
      );
    });

    if (customerOrders.length === 0) return "-";

    const latestOrder = [...customerOrders].sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    return formatDate(latestOrder.createdAt);
  };

  const filteredCustomers = customers.filter((customer) => {
    const keyword = search.toLowerCase();

    return (
      customer.name?.toLowerCase().includes(keyword) ||
      customer.mobile?.includes(search) ||
      customer.email?.toLowerCase().includes(keyword) ||
      customer.gstNumber?.toLowerCase().includes(keyword) ||
      getCustomerId(customer)?.toLowerCase?.().includes(keyword)
    );
  });

  useEffect(() => {
    loadCustomers();
    loadOrders();
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
          grid-template-columns: 1fr auto;
          gap: 12px;
        }

        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          border: 1px solid #d1d5db;
          outline: none;
        }

        .input:focus {
          border-color: #f59e0b;
          box-shadow: 0 0 0 3px rgba(245,158,11,.16);
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

        .gray {
          background: #64748b;
        }

        .form-card {
          background: white;
          border-radius: 18px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 20px;
        }

        .form-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          margin-bottom: 14px;
        }

        .form-head h2 {
          margin: 0;
        }

        .note {
          background: #fffbeb;
          color: #92400e;
          border: 1px solid #fde68a;
          border-radius: 14px;
          padding: 12px;
          font-weight: 800;
          margin-bottom: 14px;
          line-height: 1.6;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .full {
          grid-column: 1 / -1;
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
          min-width: 1050px;
        }

        th {
          background: #f3f4f6;
          text-align: left;
          padding: 12px;
          font-size: 13px;
          white-space: nowrap;
        }

        td {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          vertical-align: top;
        }

        .customer-id {
          font-weight: 900;
          color: #111827;
        }

        .muted {
          color: #64748b;
          font-size: 13px;
          font-weight: 700;
        }

        .no-mobile {
          color: #b45309;
          font-weight: 900;
        }

        .outstanding {
          color: #c2410c;
          font-weight: 900;
        }

        .actions {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .mobile-cards {
          display: none;
        }

        .customer-card {
          background: white;
          border-radius: 16px;
          padding: 15px;
          box-shadow: 0 6px 18px rgba(0,0,0,0.08);
          margin-bottom: 12px;
        }

        @media (max-width: 700px) {
          .page {
            padding: 12px;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .table-wrap {
            display: none;
          }

          .mobile-cards {
            display: block;
          }

          .actions .btn {
            flex: 1;
          }

          .form-head {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>👥 Customers</h1>
          <p style={{ margin: "6px 0 0" }}>
            Add, search, edit and manage customer outstanding.
          </p>
        </div>

        <div className="toolbar">
          <input
            className="input"
            placeholder="Search by name, mobile, email, GST or customer ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {user.role === "ADMIN" && (
            <button
              className="btn green"
              onClick={() => {
                emptyForm();
                setShowForm(!showForm);
              }}
            >
              {showForm ? "Close Form" : "+ Add New Customer"}
            </button>
          )}
        </div>

        {showForm && (
          <div className="form-card">
            <div className="form-head">
              <h2>{editingId ? "Edit Customer" : "Add New Customer"}</h2>

              <button
                className="btn gray"
                onClick={() => {
                  emptyForm();
                  setShowForm(false);
                }}
              >
                Close
              </button>
            </div>

            <div className="note">
              Mobile number is optional. If customer has no mobile number, use
              Customer ID as login/payment reference.
            </div>

            <div className="form-grid">
              <input
                className="input"
                placeholder="Customer Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <input
                className="input"
                placeholder="Mobile Number optional"
                value={form.mobile}
                onChange={(e) =>
                  setForm({ ...form, mobile: onlyDigits(e.target.value) })
                }
              />

              <input
                className="input"
                placeholder="Email optional"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />

              <input
                className="input"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) =>
                  setForm({ ...form, dateOfBirth: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="GST Number optional"
                value={form.gstNumber}
                onChange={(e) =>
                  setForm({ ...form, gstNumber: e.target.value })
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Opening Outstanding Amount"
                value={form.outstandingAmount}
                onChange={(e) =>
                  setForm({ ...form, outstandingAmount: e.target.value })
                }
              />

              <input
                className="input full"
                placeholder="Address optional"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />

              <button
                className="btn green"
                onClick={editingId ? saveEdit : addCustomer}
              >
                {editingId ? "Save Changes" : "Add Customer"}
              </button>
            </div>
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Customer ID</th>
                <th>Name</th>
                <th>Mobile / Login</th>
                <th>DOB</th>
                <th>Address</th>
                <th>GST</th>
                <th>Last Purchase</th>
                <th>Outstanding</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCustomers.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="customer-id">
                      {getCustomerId(customer)}
                    </div>
                  </td>

                  <td>{customer.name}</td>

                  <td>
                    {customer.mobile ? (
                      <>
                        <b>{customer.mobile}</b>
                        <div className="muted">Login by mobile or ID</div>
                      </>
                    ) : (
                      <>
                        <div className="no-mobile">No mobile</div>
                        <div className="muted">
                          Login ID: {getCustomerId(customer)}
                        </div>
                      </>
                    )}
                  </td>

                  <td>{formatDate(customer.dateOfBirth)}</td>
                  <td>{customer.address || "-"}</td>
                  <td>{customer.gstNumber || "-"}</td>
                  <td>{getLastPurchaseDate(customer)}</td>
                  <td className="outstanding">
                    ₹{money(customer.outstandingAmount)}
                  </td>
                  <td>{customer.active === false ? "Inactive" : "Active"}</td>

                  <td>
                    <div className="actions">
                      {user.role === "ADMIN" && (
                        <button
                          className="btn"
                          onClick={() => startEdit(customer)}
                        >
                          Edit
                        </button>
                      )}

                      <button
                        className="btn blue"
                        onClick={() =>
                          (window.location.href = `/pay-bill?mobile=${getCustomerLoginId(
                            customer
                          )}`)
                        }
                      >
                        Pay Bill
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredCustomers.length === 0 && (
                <tr>
                  <td colSpan={10}>No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mobile-cards">
          {filteredCustomers.map((customer) => (
            <div className="customer-card" key={customer.id}>
              <h3>{customer.name}</h3>

              <p>
                <b>ID:</b> {getCustomerId(customer)}
              </p>

              <p>
                <b>Mobile:</b>{" "}
                {customer.mobile ? (
                  customer.mobile
                ) : (
                  <span className="no-mobile">No mobile</span>
                )}
              </p>

              {!customer.mobile && (
                <p className="muted">
                  <b>Login ID:</b> {getCustomerId(customer)}
                </p>
              )}

              <p>
                <b>DOB:</b> {formatDate(customer.dateOfBirth)}
              </p>

              <p>
                <b>Address:</b> {customer.address || "-"}
              </p>

              <p>
                <b>GST:</b> {customer.gstNumber || "-"}
              </p>

              <p>
                <b>Last Purchase:</b> {getLastPurchaseDate(customer)}
              </p>

              <p className="outstanding">
                <b>Outstanding:</b> ₹{money(customer.outstandingAmount)}
              </p>

              <div className="actions">
                {user.role === "ADMIN" && (
                  <button className="btn" onClick={() => startEdit(customer)}>
                    Edit
                  </button>
                )}

                <button
                  className="btn blue"
                  onClick={() =>
                    (window.location.href = `/pay-bill?mobile=${getCustomerLoginId(
                      customer
                    )}`)
                  }
                >
                  Pay Bill
                </button>
              </div>
            </div>
          ))}

          {filteredCustomers.length === 0 && <p>No customers found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default Customers;