import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    description: "",
    imageUrl: "",
    buttonText: "Shop Now",
    buttonLink: "/customer-shop",
    backgroundColor: "#2563eb",
    priority: "1",
    isActive: true,
    startDate: "",
    endDate: "",
  });

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadOffers = async () => {
    try {
      setLoading(true);

      const res = await axios.get("http://localhost:5000/api/offers", {
        headers,
      });

      setOffers(res.data.data || []);
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed to load offers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const resetForm = () => {
    setEditingId("");
    setForm({
      title: "",
      subtitle: "",
      description: "",
      imageUrl: "",
      buttonText: "Shop Now",
      buttonLink: "/customer-shop",
      backgroundColor: "#2563eb",
      priority: "1",
      isActive: true,
      startDate: "",
      endDate: "",
    });
  };

  const uploadOfferImage = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const res = await axios.post(
    "http://localhost:5000/api/upload/offer-image",
    formData,
    {
      headers: {
        ...headers,
        "Content-Type": "multipart/form-data",
      },
    }
  );

  setForm({
    ...form,
    imageUrl: res.data.imageUrl,
  });
};

  const saveOffer = async () => {
    try {
      if (!form.title.trim()) {
        alert("Offer title is required");
        return;
      }

      const payload = {
        ...form,
        priority: Number(form.priority || 1),
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/offers/${editingId}`,
          payload,
          { headers }
        );

        alert("Offer updated");
      } else {
        await axios.post("http://localhost:5000/api/offers", payload, {
          headers,
        });

        alert("Offer created");
      }

      resetForm();
      loadOffers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Save failed");
    }
  };

  const editOffer = (offer: any) => {
    setEditingId(offer.id);

    setForm({
      title: offer.title || "",
      subtitle: offer.subtitle || "",
      description: offer.description || "",
      imageUrl: offer.imageUrl || "",
      buttonText: offer.buttonText || "Shop Now",
      buttonLink: offer.buttonLink || "/customer-shop",
      backgroundColor: offer.backgroundColor || "#2563eb",
      priority: String(offer.priority || 1),
      isActive: offer.isActive ?? true,
      startDate: offer.startDate ? offer.startDate.slice(0, 10) : "",
      endDate: offer.endDate ? offer.endDate.slice(0, 10) : "",
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteOffer = async (id: string) => {
    if (!confirm("Delete this offer?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/offers/${id}`, {
        headers,
      });

      alert("Offer deleted");
      loadOffers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Delete failed");
    }
  };

  const toggleActive = async (offer: any) => {
    try {
      await axios.put(
        `http://localhost:5000/api/offers/${offer.id}`,
        {
          ...offer,
          isActive: !offer.isActive,
        },
        { headers }
      );

      loadOffers();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Status update failed");
    }
  };

  const filteredOffers = useMemo(() => {
    return offers.filter((o) =>
      `${o.title || ""} ${o.subtitle || ""} ${o.description || ""}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [offers, search]);

  return (
    <AdminLayout>
      <style>{`
        .page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
          color: #111827;
        }

        .hero {
          background: linear-gradient(135deg, #111827, #1f2937);
          color: white;
          border-radius: 24px;
          padding: 24px;
          margin-bottom: 20px;
          box-shadow: 0 12px 35px rgba(0,0,0,.16);
        }

        .hero h1 {
          margin: 0;
          font-size: 32px;
        }

        .hero p {
          margin: 8px 0 0;
          color: #d1d5db;
        }

        .layout{
    display:grid;
    grid-template-columns:minmax(320px,420px) 1fr;
    gap:20px;
    align-items:start;
}

@media(max-width:1200px){
    .layout{
        grid-template-columns:1fr;
    }
}

.page{
    overflow-x:hidden;
}

.list-card{
    overflow-x:auto;
}

table{
    min-width:900px;
}

.preview img{
    max-width:100%;
    height:auto;
}

        .panel,
        .preview,
        .list-card {
          background: white;
          border-radius: 22px;
          padding: 18px;
          box-shadow: 0 8px 24px rgba(0,0,0,.08);
        }

        .panel h2,
        .preview h2,
        .list-card h2 {
          margin-top: 0;
        }

        .input,
        .textarea {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .textarea {
          min-height: 90px;
          resize: vertical;
        }

        .two {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }

        .check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0 14px;
          font-weight: 900;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
          text-align: center;
        }

        .btn.blue { background: #2563eb; }
        .btn.green { background: #16a34a; }
        .btn.red { background: #dc2626; }
        .btn.gray { background: #6b7280; }
        .btn.orange { background: #f59e0b; }

        .form-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 10px;
        }

        .banner-preview {
          min-height: 230px;
          border-radius: 24px;
          overflow: hidden;
          color: white;
          position: relative;
          display: grid;
          grid-template-columns: 1.3fr 1fr;
          align-items: center;
          padding: 26px;
          background: ${form.backgroundColor || "#2563eb"};
        }

        .banner-preview img {
          width: 100%;
          height: 180px;
          object-fit: cover;
          border-radius: 20px;
          box-shadow: 0 14px 35px rgba(0,0,0,.25);
        }

        .banner-text h1 {
          margin: 0;
          font-size: 32px;
        }

        .banner-text h4 {
          margin: 0 0 8px;
          opacity: .9;
        }

        .banner-text p {
          color: #e5e7eb;
          line-height: 1.5;
        }

        .banner-btn {
          display: inline-block;
          background: white;
          color: #111827;
          border-radius: 12px;
          padding: 11px 15px;
          font-weight: 1000;
          text-decoration: none;
          margin-top: 8px;
        }
          table{
  width:100%;
  border-collapse:collapse;
}

th{
  background:#f3f4f6;
  text-align:left;
  padding:12px;
  font-size:13px;
}

td{
  padding:12px;
  border-bottom:1px solid #e5e7eb;
  vertical-align:middle;
}

@media(max-width:1100px){
  .layout{
    grid-template-columns:1fr;
  }
}

@media(max-width:700px){
  .page{
    padding:12px;
  }

  .banner-preview{
    grid-template-columns:1fr;
    gap:20px;
  }

  .two{
    grid-template-columns:1fr;
  }

  .form-actions{
    grid-template-columns:1fr;
  }
}
      `}</style>

      <div className="page">
        <div className="hero">
          <h1>🎉 Offers & Banners</h1>
          <p>
            Create customer-facing promotional banners, offers and shopping announcements.
          </p>
        </div>

        <div className="layout">
          <div className="panel">
            <h2>{editingId ? "✏ Edit Offer" : "➕ Create Offer"}</h2>

            <input
              className="input"
              placeholder="Offer Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            <input
              className="input"
              placeholder="Subtitle"
              value={form.subtitle}
              onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
            />

            <textarea
              className="textarea"
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
  onChange={(e) => {
    const file = e.target.files?.[0];
    if (file) uploadOfferImage(file);
  }}
/>

{form.imageUrl && (
  <small>Image selected successfully</small>
)}
            <div className="two">
              <input
                className="input"
                placeholder="Button Text"
                value={form.buttonText}
                onChange={(e) =>
                  setForm({ ...form, buttonText: e.target.value })
                }
              />

              <input
                className="input"
                placeholder="Button Link"
                value={form.buttonLink}
                onChange={(e) =>
                  setForm({ ...form, buttonLink: e.target.value })
                }
              />
            </div>

            <div className="two">
              <input
                className="input"
                type="color"
                value={form.backgroundColor}
                onChange={(e) =>
                  setForm({ ...form, backgroundColor: e.target.value })
                }
              />

              <input
                className="input"
                type="number"
                placeholder="Priority"
                value={form.priority}
                onChange={(e) =>
                  setForm({ ...form, priority: e.target.value })
                }
              />
            </div>

            <div className="two">
              <input
                className="input"
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm({ ...form, startDate: e.target.value })
                }
              />

              <input
                className="input"
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm({ ...form, endDate: e.target.value })
                }
              />
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(e) =>
                  setForm({ ...form, isActive: e.target.checked })
                }
              />
              Active Offer
            </label>

            <div className="form-actions">
              <button className="btn green" onClick={saveOffer}>
                {editingId ? "Update Offer" : "Save Offer"}
              </button>

              <button className="btn gray" onClick={resetForm}>
                Clear
              </button>
            </div>
          </div>
                    <div>
            <div className="preview">
              <h2>👀 Live Banner Preview</h2>

              <div
                className="banner-preview"
                style={{
                  background: form.backgroundColor || "#2563eb",
                }}
              >
                <div className="banner-text">
                  <h4>{form.subtitle || "Special Offer"}</h4>

                  <h1>{form.title || "Your Offer Title"}</h1>

                  <p>
                    {form.description ||
                      "Offer description will appear here."}
                  </p>

                  <a className="banner-btn">
                    {form.buttonText || "Shop Now"}
                  </a>
                </div>

                <div>
                  {form.imageUrl ? (
                    <img src={form.imageUrl} alt="" />
                  ) : (
                    <div
                      style={{
                        height: 180,
                        borderRadius: 20,
                        background: "rgba(255,255,255,.18)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 80,
                      }}
                    >
                      🖼️
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="list-card" style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0 }}>All Offers</h2>

                <input
                  className="input"
                  placeholder="Search offers..."
                  style={{
                    width: 260,
                    margin: 0,
                  }}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    minWidth: 900,
                  }}
                >
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Start</th>
                      <th>End</th>
                      <th>Preview</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading && (
                      <tr>
                        <td colSpan={7}>Loading...</td>
                      </tr>
                    )}

                    {!loading &&
                      filteredOffers.map((offer) => (
                        <tr key={offer.id}>
                          <td>
                            <b>{offer.title}</b>

                            <div
                              style={{
                                color: "#6b7280",
                                fontSize: 13,
                                marginTop: 4,
                              }}
                            >
                              {offer.subtitle}
                            </div>
                          </td>

                          <td>
                            <span
                              style={{
                                padding: "5px 10px",
                                borderRadius: 999,
                                color: "white",
                                fontWeight: 800,
                                background: offer.isActive
                                  ? "#16a34a"
                                  : "#dc2626",
                              }}
                            >
                              {offer.isActive
                                ? "ACTIVE"
                                : "INACTIVE"}
                            </span>
                          </td>

                          <td>{offer.priority}</td>

                          <td>
                            {offer.startDate
                              ? new Date(
                                  offer.startDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td>
                            {offer.endDate
                              ? new Date(
                                  offer.endDate
                                ).toLocaleDateString()
                              : "-"}
                          </td>

                          <td>
                            {offer.imageUrl ? (
                              <img
                                src={offer.imageUrl}
                                style={{
                                  width: 90,
                                  height: 50,
                                  objectFit: "cover",
                                  borderRadius: 10,
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: 90,
                                  height: 50,
                                  borderRadius: 10,
                                  background:
                                    offer.backgroundColor ||
                                    "#2563eb",
                                }}
                              />
                            )}
                          </td>

                          <td>
                            <div
                              style={{
                                display: "flex",
                                gap: 8,
                                flexWrap: "wrap",
                              }}
                            >
                              <button
                                className="btn blue"
                                onClick={() => editOffer(offer)}
                              >
                                Edit
                              </button>

                              <button
                                className={
                                  offer.isActive
                                    ? "btn orange"
                                    : "btn green"
                                }
                                onClick={() =>
                                  toggleActive(offer)
                                }
                              >
                                {offer.isActive
                                  ? "Disable"
                                  : "Enable"}
                              </button>

                              <button
                                className="btn red"
                                onClick={() =>
                                  deleteOffer(offer.id)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}

                    {!loading &&
                      filteredOffers.length === 0 && (
                        <tr>
                          <td
                            colSpan={7}
                            style={{
                              textAlign: "center",
                              padding: 30,
                            }}
                          >
                            No offers found.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOffers;