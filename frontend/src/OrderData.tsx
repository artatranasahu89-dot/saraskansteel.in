import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";

function OrderData() {
  const [orders, setOrders] = useState<any[]>([]);
  const [staffs, setStaffs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    search: "",
    fromDate: "",
    toDate: "",
    status: "",
    deliveryStatus: "",
    paymentStatus: "",
    staffId: "",
    transportId: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const orderRes = await axios.get("http://localhost:5000/api/order-data", {
      headers,
    });
    setOrders(orderRes.data.data || []);

    const staffRes = await axios.get("http://localhost:5000/api/staff", {
      headers,
    });
    setStaffs(staffRes.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const addressText = (o: any) =>
    o.deliveryAddressSnapshot ||
    o.deliveryLocation ||
    o.customerRecord?.address ||
    "-";

  const itemsText = (o: any) =>
    o.items?.length
      ? o.items
          .map(
            (i: any) =>
              `${i.product?.name || "Product"} × ${i.quantity} ${
                i.product?.unit || ""
              }`
          )
          .join(" | ")
      : "-";

  const totalPaid = (o: any) =>
    (o.payments || []).reduce(
      (sum: number, p: any) => sum + Number(p.amount || 0),
      0
    );

  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => o.invoice?.id || o.invoiceValue > 0)
      .filter((o) => {
        const created = new Date(o.createdAt);

        const text = `${o.orderNumber || ""} ${o.customerRecord?.name || ""} ${
          o.customerRecord?.mobile || ""
        } ${o.customerRecord?.customerNumber || ""} ${addressText(o)} ${itemsText(
          o
        )} ${o.status || ""} ${o.deliveryStatus || ""}`.toLowerCase();

        return (
          (!filters.fromDate || created >= new Date(filters.fromDate)) &&
          (!filters.toDate ||
            created <= new Date(filters.toDate + "T23:59:59")) &&
          text.includes(filters.search.toLowerCase()) &&
          (!filters.status || o.status === filters.status) &&
          (!filters.deliveryStatus ||
            o.deliveryStatus === filters.deliveryStatus) &&
          (!filters.paymentStatus || o.paymentStatus === filters.paymentStatus) &&
          (!filters.staffId || o.assignedStaffId === filters.staffId) &&
          (!filters.transportId || o.transportId === filters.transportId)
        );
      });
  }, [orders, filters]);

  const openPaymentHistory = (o: any) => {
    const search = encodeURIComponent(
  JSON.stringify({
    mobile: o.customerRecord?.mobile || "",
    customerId: o.customerRecord?.customerNumber || "",
  })
);

    navigate(`/payment-history?search=${search}`);
  };

  const exportCSV = () => {
  const rows = [
    [
      "Date",
      "Order No",
      "Customer Name + Delivery Address",
      "Mobile / Customer ID",
      "Items",
      "Invoice Value",
      "Last Outstanding",
      "Paid",
      "Current Outstanding",
      "Transporter",
      "Last Payment Mode",
      "Last Payment Date",
    ],
    ...filteredOrders.map((o) => {
      const payments = o.payments || [];
      const lastPayment = payments.length
        ? [...payments].sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() -
              new Date(a.createdAt).getTime()
          )[0]
        : null;

      return [
        new Date(o.createdAt).toLocaleDateString(),
        o.orderNumber || "",
        `${o.customerRecord?.name || "-"} | ${addressText(o)}`,
        `${o.customerRecord?.mobile || "-"} / ${
          o.customerRecord?.customerNumber || "-"
        }`,
        itemsText(o),
        money(o.invoiceValue),
        money(o.previousOutstanding),
        money(totalPaid(o)),
        money(o.nowOutstanding || o.customerRecord?.outstandingAmount),
        o.transport?.name || "-",
        lastPayment?.paymentMode || o.paymentMethod || "-",
        lastPayment
          ? new Date(lastPayment.createdAt).toLocaleDateString()
          : o.paymentDate
          ? new Date(o.paymentDate).toLocaleDateString()
          : "-",
      ];
    }),
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
  a.download = "STRIDE_Order_Data.csv";
  a.click();
  window.URL.revokeObjectURL(url);
};

  const markDelivered = async (id: string) => {
    await axios.patch(`http://localhost:5000/api/order-data/${id}/delivered`, {}, { headers });
    alert("Marked delivered");
    loadData();
  };

  const resetFilters = () => {
    setFilters({
      search: "",
      fromDate: "",
      toDate: "",
      status: "",
      deliveryStatus: "",
      paymentStatus: "",
      staffId: "",
      transportId: "",
    });
  };

  return (
    <AdminLayout>
      <style>{`
        .page{min-height:100vh;background:#f3f4f6;padding:20px;color:#111827}
        .header{background:linear-gradient(135deg,#111827,#1f2937);color:white;border-radius:22px;padding:22px;margin-bottom:16px}
        .header h1{margin:0}
        .filters{background:white;border-radius:18px;padding:14px;box-shadow:0 6px 18px rgba(0,0,0,.08);display:grid;grid-template-columns:1.5fr repeat(7,1fr) auto auto auto;gap:9px;margin-bottom:16px}
        .input{width:100%;padding:11px;border-radius:10px;border:1px solid #d1d5db}
        .btn{border:none;border-radius:10px;padding:10px 12px;background:#111827;color:white;font-weight:900;cursor:pointer}
        .green{background:#16a34a}.blue{background:#2563eb}.red{background:#dc2626}
        .table-card{background:white;border-radius:18px;padding:14px;box-shadow:0 6px 18px rgba(0,0,0,.08)}
        .table-wrap{overflow-x:auto}
        table{width:100%;border-collapse:collapse;min-width:1450px}
        th{background:#f3f4f6;padding:12px;text-align:left;font-size:13px;white-space:nowrap}
        td{padding:12px;border-bottom:1px solid #e5e7eb;vertical-align:top}
        .customer-cell{max-width:280px;line-height:1.4}
        .items-cell{max-width:260px;line-height:1.5}
        .badge{display:inline-block;padding:5px 10px;border-radius:999px;font-size:12px;font-weight:1000;background:#dbeafe;color:#1d4ed8}
        .paid{background:#dcfce7;color:#166534}
        .pending{background:#fef3c7;color:#92400e}
        .danger{color:#dc2626;font-weight:1000}
        .success{color:#16a34a;font-weight:1000}
        .actions{display:flex;gap:7px;flex-wrap:wrap}
        .mobile-cards{display:none}

        @media(max-width:1100px){
          .filters{grid-template-columns:1fr 1fr}
          table{min-width:1200px}
        }

        @media(max-width:700px){
          .page{padding:10px}
          .filters{grid-template-columns:1fr}
          .table-card{display:none}
          .mobile-cards{display:grid;gap:12px}
          .order-card{background:white;border-radius:18px;padding:14px;box-shadow:0 6px 18px rgba(0,0,0,.08)}
          .card-top{display:flex;justify-content:space-between;gap:10px}
          .card-title{font-weight:1000;font-size:16px}
          .section{margin-top:10px;padding-top:10px;border-top:1px solid #e5e7eb}
          .row{display:flex;justify-content:space-between;gap:10px;margin:6px 0}
          .mobile-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px}
          .btn{width:100%}
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1>📊 Order Data</h1>
          <p>Only accepted orders with invoices appear here.</p>
        </div>

        <div className="filters">
          <input className="input" placeholder="Search order, customer, mobile, item, address..." value={filters.search} onChange={(e) => setFilters({ ...filters, search: e.target.value })} />
          <input className="input" type="date" value={filters.fromDate} onChange={(e) => setFilters({ ...filters, fromDate: e.target.value })} />
          <input className="input" type="date" value={filters.toDate} onChange={(e) => setFilters({ ...filters, toDate: e.target.value })} />

          <select className="input" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
            <option value="">Order Status</option>
            <option value="PROCESSING">Processing</option>
            <option value="DELIVERED">Delivered</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select className="input" value={filters.deliveryStatus} onChange={(e) => setFilters({ ...filters, deliveryStatus: e.target.value })}>
            <option value="">Delivery Status</option>
            <option value="PENDING">Pending</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>

          <select className="input" value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
            <option value="">Payment Status</option>
            <option value="PENDING">Pending</option>
            <option value="PARTIAL">Partial</option>
            <option value="PAID">Paid</option>
          </select>

          <select className="input" value={filters.staffId} onChange={(e) => setFilters({ ...filters, staffId: e.target.value })}>
            <option value="">Staff</option>
            {staffs.filter((s) => s.type === "STAFF" || s.role === "STAFF").map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <select className="input" value={filters.transportId} onChange={(e) => setFilters({ ...filters, transportId: e.target.value })}>
            <option value="">Transporter</option>
            {staffs.filter((s) => s.type === "TRANSPORT" || s.role === "TRANSPORT").map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          <button className="btn blue" onClick={loadData}>Refresh</button>
          <button className="btn red" onClick={resetFilters}>Clear</button>
          <button className="btn green" onClick={exportCSV}>Export</button>
        </div>

        <div className="table-card">
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Order No</th>
                  <th>Customer Name + Delivery Address</th>
                  <th>Mobile / Customer ID</th>
                  <th>Items</th>
                  <th>Invoice Value</th>
                  <th>Paid</th>
                  <th>Outstanding</th>
                  <th>Transporter</th>
                  <th>Actions</th>
                  <th>Order Status</th>
                  <th>Delivery Status</th>
                  <th>Assigned Staff</th>
                </tr>
              </thead>

              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td><b>{o.orderNumber}</b></td>
                    <td className="customer-cell">
                      <b>{o.customerRecord?.name || "-"}</b>
                      <br />
                      <small>📍 {addressText(o)}</small>
                    </td>
                    <td>
                      {o.customerRecord?.mobile || "-"}
                      <br />
                      <small>{o.customerRecord?.customerNumber || "-"}</small>
                    </td>
                    <td className="items-cell">
                      {o.items?.length
                        ? o.items.map((i: any) => (
                            <div key={i.id}>
                              <b>{i.product?.name || "Product"}</b> × {i.quantity} {i.product?.unit || ""}
                            </div>
                          ))
                        : "-"}
                    </td>
                    <td>₹{money(o.invoiceValue)}</td>
                    <td className="success">₹{money(totalPaid(o))}</td>
                    <td className="danger">₹{money(o.nowOutstanding || o.customerRecord?.outstandingAmount)}</td>
                    <td>{o.transport?.name || "-"}</td>
                    <td>
                      <div className="actions">
                        {o.invoice?.id && (
                          <button className="btn" onClick={() => navigate(`/invoice-view/${o.invoice.id}`)}>Invoice</button>
                        )}
                        <button className="btn blue" onClick={() => openPaymentHistory(o)}>Payment History</button>
                        <button className="btn green" onClick={() => markDelivered(o.id)}>Delivered</button>
                        <button className="btn red" onClick={() => navigate(`/collect-payment/${o.id}`)}>Collect</button>
                      </div>
                    </td>
                    <td><span className="badge">{o.status || "-"}</span></td>
                    <td><span className={o.deliveryStatus === "DELIVERED" ? "badge paid" : "badge pending"}>{o.deliveryStatus || "-"}</span></td>
                    <td>{o.assignedStaff?.name || "-"}</td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr><td colSpan={13}>No invoiced order data found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mobile-cards">
          {filteredOrders.map((o) => (
            <div className="order-card" key={o.id}>
              <div className="card-top">
                <div>
                  <div className="card-title">{o.orderNumber}</div>
                  <small>{new Date(o.createdAt).toLocaleDateString()}</small>
                </div>
                <span className="badge">{o.status}</span>
              </div>

              <div className="section">
                <b>{o.customerRecord?.name || "-"}</b>
                <div>{o.customerRecord?.mobile || "-"} / {o.customerRecord?.customerNumber || "-"}</div>
                <small>📍 {addressText(o)}</small>
              </div>

              <div className="section">
                <b>Items</b>
                {o.items?.length
                  ? o.items.map((i: any) => (
                      <div key={i.id}>
                        {i.product?.name || "Product"} × {i.quantity} {i.product?.unit || ""}
                      </div>
                    ))
                  : <div>-</div>}
              </div>

              <div className="section">
                <div className="row"><span>Invoice</span><b>₹{money(o.invoiceValue)}</b></div>
                <div className="row"><span>Paid</span><b className="success">₹{money(totalPaid(o))}</b></div>
                <div className="row"><span>Outstanding</span><b className="danger">₹{money(o.nowOutstanding || o.customerRecord?.outstandingAmount)}</b></div>
              </div>

              <div className="section">
                <div>Transporter: <b>{o.transport?.name || "-"}</b></div>
                <div>Staff: <b>{o.assignedStaff?.name || "-"}</b></div>
                <div>Delivery: <b>{o.deliveryStatus || "-"}</b></div>
              </div>

              <div className="mobile-actions">
                {o.invoice?.id && <button className="btn" onClick={() => navigate(`/invoice-view/${o.invoice.id}`)}>Invoice</button>}
                <button className="btn blue" onClick={() => openPaymentHistory(o)}>Payment</button>
                <button className="btn green" onClick={() => markDelivered(o.id)}>Delivered</button>
                <button className="btn red" onClick={() => navigate(`/collect-payment/${o.id}`)}>Collect</button>
              </div>
            </div>
          ))}

          {filteredOrders.length === 0 && <p>No invoiced order data found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderData;