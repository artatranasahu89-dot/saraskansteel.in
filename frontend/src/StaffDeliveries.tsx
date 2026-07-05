import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function StaffDeliveries() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState("");
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");
const [trackingOrderId, setTrackingOrderId] = useState("");
const [watchId, setWatchId] = useState<number | null>(null);
  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const money = (value: any) => Number(value || 0).toFixed(2);

  const loadOrders = async () => {
    const res = await axios.get("http://localhost:5000/api/delivery", {
      headers,
    });
    setOrders(res.data.data || []);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getGPS = () =>
    new Promise<any>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("GPS not supported"));
      }

      navigator.geolocation.getCurrentPosition(
        (pos) =>
          resolve({
            deliveryLat: pos.coords.latitude,
            deliveryLng: pos.coords.longitude,
          }),
        () => reject(new Error("Location permission denied")),
        { enableHighAccuracy: true }
      );
    });
    const startAutoGPS = (orderId: string) => {
  if (!navigator.geolocation) {
    alert("GPS not supported");
    return;
  }

  const id = navigator.geolocation.watchPosition(
    async (pos) => {
      const gps = {
        deliveryLat: pos.coords.latitude,
        deliveryLng: pos.coords.longitude,
        deliveryLocation: `${pos.coords.latitude}, ${pos.coords.longitude}`,
        deliveryNote: note || "Live GPS auto update",
      };

      await axios.patch(
        `http://localhost:5000/api/delivery/${orderId}/location`,
        gps,
        { headers }
      );

      setTrackingOrderId(orderId);
      loadOrders();
    },
    () => alert("Location permission denied"),
    {
      enableHighAccuracy: true,
      maximumAge: 10000,
      timeout: 15000,
    }
  );

  setWatchId(id);
  alert("Live GPS tracking started");
};
const stopAutoGPS = () => {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId);
    setWatchId(null);
    setTrackingOrderId("");
    alert("Live GPS tracking stopped");
  }
};

  const updateDelivery = async (orderId: string, action: string) => {
    try {
      const gps = await getGPS();

      await axios.patch(
        `http://localhost:5000/api/delivery/${orderId}/${action}`,
        {
          ...gps,
          deliveryNote: note,
          deliveryLocation: `${gps.deliveryLat}, ${gps.deliveryLng}`,
        },
        { headers }
      );

      alert("Delivery updated");
      setNote("");
      loadOrders();
    } catch (error: any) {
      alert(error?.response?.data?.message || error.message);
    }
  };

  const markPayLater = async (orderId: string) => {
    const remark = prompt("Pay later remark", "Customer will pay later");
    if (!remark) return;

    await axios.patch(
      `http://localhost:5000/api/delivery/${orderId}/pay-later`,
      { collectionRemark: remark },
      { headers }
    );

    alert("Marked Pay Later");
    loadOrders();
  };

  const filteredOrders = orders.filter((o) => {
    const statusMatch = !filter || o.deliveryStatus === filter || o.status === filter;

    const text = `${o.orderNumber || ""} ${o.customerRecord?.name || ""} ${
      o.customerRecord?.mobile || ""
    } ${o.transport?.name || ""} ${o.deliveryAddressSnapshot || ""}`.toLowerCase();

    return statusMatch && text.includes(search.toLowerCase());
  });

  return (
    <AdminLayout>
      <style>{`
        .page{min-height:100vh;background:#f3f4f6;padding:24px;color:#111827}
        .header{background:linear-gradient(135deg,#111827,#1f2937);color:white;border-radius:20px;padding:24px;margin-bottom:20px}
        .toolbar{background:white;border-radius:18px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08);margin-bottom:20px;display:grid;grid-template-columns:180px 1fr 1fr auto;gap:10px}
        .input{width:100%;padding:12px;border-radius:10px;border:1px solid #d1d5db}
        .cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:16px}
        .delivery-card{background:white;border-radius:18px;padding:16px;box-shadow:0 6px 18px rgba(0,0,0,.08)}
        .top{display:flex;justify-content:space-between;gap:10px;margin-bottom:12px}
        .badge{padding:6px 10px;border-radius:999px;font-weight:900;font-size:12px;background:#dbeafe;color:#1d4ed8;height:fit-content}
        .badge.green{background:#dcfce7;color:#166534}
        .badge.orange{background:#fef3c7;color:#92400e}
        .info{display:grid;gap:6px;color:#374151;margin-bottom:12px}
        .address-box{background:#eff6ff;border:1px solid #bfdbfe;border-radius:12px;padding:10px;margin:10px 0 12px;color:#1e3a8a}
        .amount-box{background:#f9fafb;border-radius:12px;padding:10px;display:grid;gap:7px;margin-bottom:12px}
        .row{display:flex;justify-content:space-between;gap:10px}
        .danger{color:#dc2626;font-weight:900}
        .actions{display:flex;gap:8px;flex-wrap:wrap}
        .btn{border:none;border-radius:10px;padding:10px 12px;background:#111827;color:white;font-weight:800;cursor:pointer;text-decoration:none;display:inline-block}
        .blue{background:#2563eb}.green{background:#16a34a}.red{background:#dc2626}.yellow{background:#f59e0b}
        @media(max-width:1000px){.toolbar{grid-template-columns:1fr}.btn{width:100%;text-align:center}}
        @media(max-width:600px){.page{padding:12px}.cards{grid-template-columns:1fr}}
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🚛 My Deliveries</h1>
          <p style={{ margin: "6px 0 0" }}>
            Staff delivery page with GPS location update.
          </p>
        </div>

        <div className="toolbar">
          <select className="input" value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="PROCESSING">Processing</option>
            <option value="OUT_FOR_DELIVERY">Out For Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="FAILED">Failed</option>
          </select>

          <input className="input" placeholder="Search order/customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <input className="input" placeholder="Delivery note" value={note} onChange={(e) => setNote(e.target.value)} />
          <button className="btn blue" onClick={loadOrders}>Refresh</button>
        </div>

        <div className="cards">
          {filteredOrders.map((o) => {
            const invoiceReady = !!o.invoice?.id;
            const isDelivered = o.deliveryStatus === "DELIVERED";
            const isOutForDelivery = o.deliveryStatus === "OUT_FOR_DELIVERY";
            const outstanding = Number(o.customerRecord?.outstandingAmount || o.nowOutstanding || 0);
            const canCollect = isOutForDelivery && outstanding > 0;

            return (
              <div className="delivery-card" key={o.id}>
                <div className="top">
                  <div>
                    <h3 style={{ margin: 0 }}>{o.orderNumber}</h3>
                    <p style={{ margin: "4px 0", color: "#6b7280" }}>
                      {new Date(o.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <span className={isDelivered ? "badge green" : isOutForDelivery ? "badge orange" : "badge"}>
                    {o.deliveryStatus || o.status}
                  </span>
                </div>

                <div className="info">
                  <div><b>Customer:</b> {o.customerRecord?.name || "-"}</div>
                  <div><b>Mobile:</b> {o.customerRecord?.mobile || "-"}</div>
                  <div><b>Staff:</b> {o.assignedStaff?.name || "-"}</div>
                  <div><b>Transporter:</b> {o.transport?.name || "-"}</div>
                  <div><b>Invoice:</b> {invoiceReady ? "YES" : "NO"}</div>
                  <div><b>Last GPS:</b> {o.deliveryLat && o.deliveryLng ? `${o.deliveryLat}, ${o.deliveryLng}` : "-"}</div>
                  <div><b>Updated:</b> {o.deliveryUpdatedAt ? new Date(o.deliveryUpdatedAt).toLocaleString() : "-"}</div>
                  <div><b>Note:</b> {o.deliveryNote || "-"}</div>
                </div>

                <div className="address-box">
                  <b>Delivery Address</b>
                  <p style={{ margin: "6px 0 0" }}>
                    {o.deliveryAddressSnapshot || o.customerRecord?.address || "-"}
                  </p>
                </div>

                <div className="amount-box">
                  <div className="row"><span>Invoice Value</span><b>₹{money(o.invoiceValue)}</b></div>
                  <div className="row"><span>Outstanding</span><b className="danger">₹{money(outstanding)}</b></div>
                </div>

                <div className="actions">
                  {!invoiceReady && !isDelivered && <button className="btn" disabled>Waiting For Invoice</button>}

                  {invoiceReady && !isOutForDelivery && !isDelivered && (
                    <button
  className="btn blue"
  onClick={async () => {
    await updateDelivery(o.id, "out-for-delivery");
    startAutoGPS(o.id);
  }}
>
  Start Live GPS
</button>
                  )}

                  {isOutForDelivery && (
                    <button className="btn blue" onClick={() => updateDelivery(o.id, "location")}>
                      Update GPS
                    </button>
                  )}
{trackingOrderId === o.id && (
  <button className="btn red" onClick={stopAutoGPS}>
    Stop GPS
  </button>
)}
                  {canCollect && (
                    <a className="btn green" href={`/collect-payment/${o.id}`}>
                      Collect
                    </a>
                  )}

                  {canCollect && o.collectionStatus !== "PAY_LATER" && (
                    <button className="btn yellow" onClick={() => markPayLater(o.id)}>
                      Pay Later
                    </button>
                  )}

                  {isOutForDelivery && !isDelivered && (
                    <button className="btn green" onClick={async () => {
  await updateDelivery(o.id, "delivered");
  stopAutoGPS();
}}>
                      Delivered
                    </button>
                  )}

                  {isOutForDelivery && !isDelivered && (
                    <button className="btn red"onClick={async () => {
  await updateDelivery(o.id, "failed");
  stopAutoGPS();
}}>
                      Failed
                    </button>
                  )}

                  {o.deliveryLat && o.deliveryLng && (
                    <a
                      className="btn"
                      target="_blank"
                      href={`https://www.google.com/maps?q=${o.deliveryLat},${o.deliveryLng}`}
                    >
                      Open Map
                    </a>
                  )}
                </div>
              </div>
            );
          })}

          {filteredOrders.length === 0 && <p>No delivery orders found.</p>}
        </div>
      </div>
    </AdminLayout>
  );
}

export default StaffDeliveries;