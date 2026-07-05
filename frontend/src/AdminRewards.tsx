import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminRewards() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [setting, setSetting] = useState({
  redemptionOpen: true,
  message: "Redemption is open",
});
  const [editingId, setEditingId] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    imageUrl: "",
    pointsRequired: "",
    stock: "",
    active: true,
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };
const loadSetting = async () => {
  const res = await axios.get("http://localhost:5000/api/rewards/setting", {
    headers,
  });

  setSetting(res.data.data);
};

const saveSetting = async () => {
  await axios.put("http://localhost:5000/api/rewards/setting", setting, {
    headers,
  });

  alert("Reward setting saved");
  loadSetting();
};
useEffect(() => {
  loadGifts();
  loadSetting();
}, []);
  const loadGifts = async () => {
    const res = await axios.get("http://localhost:5000/api/rewards/gifts", {
      headers,
    });

    setGifts(res.data.data || []);
  };

  useEffect(() => {
    loadGifts();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm({
      name: "",
      description: "",
      imageUrl: "",
      pointsRequired: "",
      stock: "",
      active: true,
    });
  };
  const uploadGiftImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    alert("Image uploaded");
  } catch (error: any) {
    alert(error?.response?.data?.message || "Image upload failed");
  }
};

  const saveGift = async () => {
    try {
      if (!form.name) {
        alert("Gift name is required");
        return;
      }

      if (!form.pointsRequired) {
        alert("Points required is required");
        return;
      }

      const payload = {
        ...form,
        pointsRequired: Number(form.pointsRequired || 0),
        stock: Number(form.stock || 0),
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/rewards/gifts/${editingId}`,
          payload,
          { headers }
        );

        alert("Gift updated");
      } else {
        await axios.post("http://localhost:5000/api/rewards/gifts", payload, {
          headers,
        });

        alert("Gift created");
      }

      resetForm();
      loadGifts();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to save gift");
    }
  };

  const editGift = (gift: any) => {
    setEditingId(gift.id);
    setForm({
      name: gift.name || "",
      description: gift.description || "",
      imageUrl: gift.imageUrl || "",
      pointsRequired: String(gift.pointsRequired || ""),
      stock: String(gift.stock || ""),
      active: gift.active,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };  return (
    <AdminLayout>
      <style>{`
        .page{
          min-height:100vh;
          background:#f3f4f6;
          padding:24px;
        }

        .header{
          background:linear-gradient(135deg,#111827,#1f2937);
          color:white;
          padding:24px;
          border-radius:20px;
          margin-bottom:20px;
        }

        .layout{
          display:grid;
          grid-template-columns:420px 1fr;
          gap:20px;
        }

        .card{
          background:white;
          border-radius:18px;
          padding:16px;
          box-shadow:0 6px 18px rgba(0,0,0,.08);
        }

        .input{
          width:100%;
          padding:12px;
          border:1px solid #d1d5db;
          border-radius:12px;
          margin-bottom:10px;
        }

        .btn{
          border:none;
          border-radius:12px;
          padding:12px;
          font-weight:900;
          cursor:pointer;
        }

        .green{
          background:#16a34a;
          color:white;
        }

        .blue{
          background:#2563eb;
          color:white;
        }

        .gray{
          background:#e5e7eb;
        }

        .gift-grid{
          display:grid;
          grid-template-columns:repeat(auto-fill,minmax(260px,1fr));
          gap:16px;
        }

        .gift-card{
          background:white;
          border-radius:18px;
          overflow:hidden;
          box-shadow:0 6px 18px rgba(0,0,0,.08);
        }

        .gift-image{
          height:180px;
          background:#e5e7eb;
          display:flex;
          align-items:center;
          justify-content:center;
          overflow:hidden;
        }

        .gift-image img{
          width:100%;
          height:100%;
          object-fit:cover;
        }

        .gift-body{
          padding:14px;
        }

        .gift-name{
          font-size:18px;
          font-weight:900;
          margin-bottom:6px;
        }

        .badge{
          display:inline-block;
          padding:6px 10px;
          border-radius:999px;
          font-size:12px;
          font-weight:900;
          margin-right:6px;
        }

        .active{
          background:#dcfce7;
          color:#166534;
        }

        .inactive{
          background:#fee2e2;
          color:#991b1b;
        }

        .row{
          display:flex;
          justify-content:space-between;
          margin-top:8px;
        }

        @media(max-width:1000px){
          .layout{
            grid-template-columns:1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🎁 Reward Gifts Management</h1>
          <p style={{ marginTop: 8 }}>
            Manage gifts, stock, points and redemption rewards.
          </p>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
  <h2>🎛 Redemption Control</h2>

  <select
    className="input"
    value={setting.redemptionOpen ? "OPEN" : "CLOSED"}
    onChange={(e) =>
      setSetting({
        ...setting,
        redemptionOpen: e.target.value === "OPEN",
      })
    }
  >
    <option value="OPEN">OPEN - Customers can redeem</option>
    <option value="CLOSED">CLOSED - Redemption stopped</option>
  </select>

  <input
    className="input"
    placeholder="Message shown to customer"
    value={setting.message || ""}
    onChange={(e) =>
      setSetting({
        ...setting,
        message: e.target.value,
      })
    }
  />

  <button className="btn green" onClick={saveSetting}>
    Save Redemption Setting
  </button>
</div>

        <div className="layout">
          <div className="card">
            <h2>
              {editingId ? "✏️ Edit Gift" : "➕ Create Gift"}
            </h2>

            <input
              className="input"
              placeholder="Gift Name"
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />

            <textarea
              className="input"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
  className="input"
  type="file"
  accept="image/*"
  onChange={uploadGiftImage}
/>

            <input
              className="input"
              type="number"
              placeholder="Points Required"
              value={form.pointsRequired}
              onChange={(e) =>
                setForm({
                  ...form,
                  pointsRequired: e.target.value,
                })
              }
            />

            <input
              className="input"
              type="number"
              placeholder="Stock"
              value={form.stock}
              onChange={(e) =>
                setForm({
                  ...form,
                  stock: e.target.value,
                })
              }
            />

            <select
              className="input"
              value={String(form.active)}
              onChange={(e) =>
                setForm({
                  ...form,
                  active: e.target.value === "true",
                })
              }
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            <button
              className="btn green"
              style={{ width: "100%" }}
              onClick={saveGift}
            >
              {editingId ? "Update Gift" : "Create Gift"}
            </button>

            {editingId && (
              <button
                className="btn gray"
                style={{ width: "100%", marginTop: 10 }}
                onClick={resetForm}
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div>
            <div className="gift-grid">
              {gifts.map((gift) => (
                <div className="gift-card" key={gift.id}>
                  <div className="gift-image">
                    {gift.imageUrl ? (
                      <img
                        src={gift.imageUrl}
                        alt={gift.name}
                      />
                    ) : (
                      <div style={{ fontSize: 50 }}>
                        🎁
                      </div>
                    )}
                  </div>

                  <div className="gift-body">
                    <div className="gift-name">
                      {gift.name}
                    </div>

                    <div style={{ color: "#6b7280" }}>
                      {gift.description || "-"}
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <span
                        className={
                          gift.active
                            ? "badge active"
                            : "badge inactive"
                        }
                      >
                        {gift.active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>
                    </div>

                    <div className="row">
                      <b>Points</b>
                      <span>
                        {gift.pointsRequired}
                      </span>
                    </div>

                    <div className="row">
                      <b>Stock</b>
                      <span>{gift.stock}</span>
                    </div>

                    <button
                      className="btn blue"
                      style={{
                        width: "100%",
                        marginTop: 12,
                      }}
                      onClick={() => editGift(gift)}
                    >
                      Edit Gift
                    </button>
                  </div>
                </div>
              ))}

              {gifts.length === 0 && (
                <div className="card">
                  No gifts created yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminRewards;