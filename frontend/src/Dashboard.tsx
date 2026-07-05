import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminDashboard() {
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (v: any) => Number(v || 0).toFixed(2);

  const loadData = async () => {
    const orderRes = await axios.get("https://saraskansteel-in.onrender.com/api/order-data", { headers });
    const productRes = await axios.get("https://saraskansteel-in.onrender.com/api/products", { headers });
    const paymentRes = await axios.get("https://saraskansteel-in.onrender.com/api/payments", { headers });
    const customerRes = await axios.get("https://saraskansteel-in.onrender.com/api/customers", { headers });

    setOrders(orderRes.data.data || []);
    setProducts(productRes.data.data || []);
    setPayments(paymentRes.data.data || []);
    setCustomers(customerRes.data.data || []);
  };

  useEffect(() => {
    loadData();
  }, []);

  const today = new Date().toDateString();

  const todayOrders = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === today
  );

  const todayPayments = payments.filter(
    (p) => new Date(p.createdAt).toDateString() === today
  );

  const todaySales = todayOrders.reduce(
    (sum, o) => sum + Number(o.invoiceValue || 0),
    0
  );

  const todayCollection = todayPayments.reduce(
    (sum, p) => sum + Number(p.amount || 0),
    0
  );

  const totalOutstanding = customers.reduce(
    (sum, c) => sum + Number(c.outstandingAmount || 0),
    0
  );
  const todayLabour = todayOrders.reduce(
  (sum, o) => sum + Number(o.labourAmount || o.invoice?.labourCharge || 0),
  0
);

const todayPendingOrders = todayOrders.filter(
  (o) => o.status === "PENDING"
).length;

const todayProcessingOrders = todayOrders.filter(
  (o) => o.status === "PROCESSING"
).length;

const todayOutForDelivery = todayOrders.filter(
  (o) => o.deliveryStatus === "OUT_FOR_DELIVERY"
).length;

const todayDeliveredOrders = todayOrders.filter(
  (o) => o.status === "DELIVERED" || o.deliveryStatus === "DELIVERED"
).length;

  

  const lowStock = products.filter((p) => Number(p.stock || 0) < 20);

  

  return (
    <AdminLayout>
      <style>{`
        .page{min-height:100vh;background:#f3f4f6;padding:24px;color:#111827}
        .hero{background:linear-gradient(135deg,#111827,#1f2937);color:white;border-radius:24px;padding:24px;margin-bottom:20px}
        .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:20px}
        .card,.section{background:white;border-radius:18px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08)}
        .card h3{margin:0;color:#6b7280;font-size:14px}
        .card h2{margin:8px 0 0;font-size:26px}
        .green{color:#16a34a}.red{color:#dc2626}.blue{color:#2563eb}.orange{color:#f59e0b}
        .section{margin-bottom:20px}
        .quick{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
        .quick a{background:#111827;color:white;text-decoration:none;padding:16px;border-radius:16px;font-weight:900;text-align:center}
        table{width:100%;border-collapse:collapse;min-width:800px}
        th{background:#f3f4f6;text-align:left;padding:12px;font-size:13px}
        td{padding:12px;border-bottom:1px solid #e5e7eb}
        .table-wrap{overflow-x:auto}
        @media(max-width:1000px){.grid,.quick{grid-template-columns:1fr 1fr}}
        @media(max-width:600px){.page{padding:12px}.grid,.quick{grid-template-columns:1fr}}
      `}</style>

      <div className="page">
        <div className="hero">
          <h1 style={{ margin: 0 }}>📊 STRIDE Admin Dashboard</h1>
          <p style={{ margin: "6px 0 0" }}>
            Sales, collections, orders, delivery, outstanding and stock overview.
          </p>
        </div>

        <div className="grid">
          <div className="card"><h3>Today's Sales</h3><h2 className="green">₹{money(todaySales)}</h2></div>
          <div className="card"><h3>Today's Collection</h3><h2 className="blue">₹{money(todayCollection)}</h2></div>
          <div className="card"><h3>Total Outstanding</h3><h2 className="red">₹{money(totalOutstanding)}</h2></div>
          <div className="card"><h3>Today's Labour</h3><h2 className="orange">₹{money(todayLabour)}</h2></div>

<div className="card"><h3>Today's Pending Orders</h3><h2>{todayPendingOrders}</h2></div>
<div className="card"><h3>Today's Processing Orders</h3><h2>{todayProcessingOrders}</h2></div>
<div className="card"><h3>Today's Out For Delivery</h3><h2>{todayOutForDelivery}</h2></div>
<div className="card"><h3>Today's Delivered</h3><h2 className="green">{todayDeliveredOrders}</h2></div>
        </div>

        <div className="section">
          <h2>Quick Actions</h2>
          <div className="quick">
            <a href="/create-order">Create Order</a>
            <a href="/assign-order">Assign Orders</a>
            <a href="/order-data">Order Data</a>
            <a href="/collection-report">Collection Report</a>
            <a href="/customer-outstanding-report">Customer Outstanding</a>
            <a href="/transport-payment-report">Transport Report</a>
            <a href="/products">Products</a>
            <a href="/customers">Customers</a>
          </div>
        </div>

        <div className="section">
          <h2>🔴 Low Stock Alerts</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Current Stock</th>
                  <th>Unit</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.category?.name || "-"}</td>
                    <td className="red">{p.stock}</td>
                    <td>{p.unit}</td>
                  </tr>
                ))}
                {lowStock.length === 0 && (
                  <tr><td colSpan={4}>No low stock products.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="section">
          <h2>Recent Orders</h2>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order No</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Delivery</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 8).map((o) => (
                  <tr key={o.id}>
                    <td>{o.orderNumber}</td>
                    <td>{o.customerRecord?.name || "-"}</td>
                    <td>₹{money(o.invoiceValue)}</td>
                    <td>{o.status}</td>
                    <td>{o.deliveryStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminDashboard;