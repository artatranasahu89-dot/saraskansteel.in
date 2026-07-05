import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

function AdminRedemptions() {
  const [redemptions, setRedemptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");
  const headers = {
    Authorization: "Bearer " + token,
  };

  const loadRedemptions = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        "http://localhost:5000/api/rewards/redemptions",
        { headers }
      );

      setRedemptions(res.data.data || []);
    } catch (error) {
      console.error(error);
      alert("Failed to load redemption requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRedemptions();
  }, []);

  const approve = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/rewards/${id}/approve`,
        {},
        { headers }
      );

      alert("Redemption approved");
      loadRedemptions();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed");
    }
  };

  const reject = async (id: string) => {
    const reason = prompt("Reject reason") || "";

    try {
      await axios.patch(
        `http://localhost:5000/api/rewards/${id}/reject`,
        {
          adminNote: reason,
        },
        { headers }
      );

      alert("Redemption rejected");
      loadRedemptions();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed");
    }
  };

  const markGiven = async (id: string) => {
    try {
      await axios.patch(
        `http://localhost:5000/api/rewards/${id}/given`,
        {},
        { headers }
      );

      alert("Gift marked as given");
      loadRedemptions();
    } catch (error: any) {
      alert(error?.response?.data?.message || "Failed");
    }
  };

  const getStatusColor = (status: string) => {
    if (status === "PENDING") return "#f59e0b";
    if (status === "APPROVED") return "#2563eb";
    if (status === "GIVEN") return "#16a34a";
    if (status === "REJECTED") return "#dc2626";
    return "#6b7280";
  };
    return (
    <AdminLayout>
      <style>{`
        .page {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 24px;
        }

        .header {
          background: linear-gradient(135deg,#111827,#1f2937);
          color: white;
          border-radius: 20px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
          gap: 16px;
        }

        .card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        .top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .badge {
          color: white;
          border-radius: 999px;
          padding: 6px 10px;
          font-weight: 900;
          font-size: 12px;
          height: fit-content;
        }

        .gift {
          display: flex;
          gap: 12px;
          margin: 14px 0;
          padding: 12px;
          background: #f9fafb;
          border-radius: 14px;
        }

        .gift-img {
          width: 70px;
          height: 70px;
          border-radius: 14px;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          flex-shrink: 0;
        }

        .gift-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .row {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          border-bottom: 1px solid #e5e7eb;
          padding: 8px 0;
        }

        .actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-top: 14px;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 11px;
          font-weight: 900;
          color: white;
          cursor: pointer;
        }

        .green { background:#16a34a; }
        .blue { background:#2563eb; }
        .red { background:#dc2626; }
        .gray { background:#6b7280; }

        @media(max-width:600px) {
          .page {
            padding: 12px;
          }

          .grid {
            grid-template-columns: 1fr;
          }

          .actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🎁 Redemption Requests</h1>
          <p style={{ marginTop: 8 }}>
            Approve, reject and mark gifts as given.
          </p>
        </div>

        {loading && <p>Loading redemptions...</p>}

        <div className="grid">
          {redemptions.map((r) => (
            <div className="card" key={r.id}>
              <div className="top">
                <div>
                  <h3 style={{ margin: 0 }}>{r.redemptionNo}</h3>
                  <small>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </small>
                </div>

                <span
                  className="badge"
                  style={{ background: getStatusColor(r.status) }}
                >
                  {r.status}
                </span>
              </div>

              <div className="gift">
                <div className="gift-img">
                  {r.gift?.imageUrl ? (
                    <img src={r.gift.imageUrl} alt={r.gift.name} />
                  ) : (
                    "🎁"
                  )}
                </div>

                <div>
                  <b>{r.gift?.name || "-"}</b>
                  <br />
                  <small>{r.gift?.description || "-"}</small>
                </div>
              </div>

              <div className="row">
                <span>Customer</span>
                <b>{r.customer?.name || "-"}</b>
              </div>

              <div className="row">
                <span>Mobile</span>
                <b>{r.customer?.mobile || "-"}</b>
              </div>

              <div className="row">
                <span>Customer ID</span>
                <b>{r.customer?.customerNumber || "-"}</b>
              </div>

              <div className="row">
                <span>Points Used</span>
                <b>{r.pointsUsed}</b>
              </div>

              <div className="row">
                <span>Gift Stock</span>
                <b>{r.gift?.stock ?? "-"}</b>
              </div>

              <div className="row">
                <span>Request Note</span>
                <b>{r.requestNote || "-"}</b>
              </div>

              <div className="row">
                <span>Admin Note</span>
                <b>{r.adminNote || "-"}</b>
              </div>

              <div className="actions">
                <button
                  className="btn blue"
                  disabled={r.status !== "PENDING"}
                  onClick={() => approve(r.id)}
                  style={{ opacity: r.status === "PENDING" ? 1 : 0.5 }}
                >
                  Approve
                </button>

                <button
                  className="btn red"
                  disabled={r.status !== "PENDING"}
                  onClick={() => reject(r.id)}
                  style={{ opacity: r.status === "PENDING" ? 1 : 0.5 }}
                >
                  Reject
                </button>

                <button
                  className="btn green"
                  disabled={r.status !== "APPROVED"}
                  onClick={() => markGiven(r.id)}
                  style={{ opacity: r.status === "APPROVED" ? 1 : 0.5 }}
                >
                  Mark Given
                </button>
              </div>
            </div>
          ))}

          {redemptions.length === 0 && !loading && (
            <div className="card">No redemption requests found.</div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminRedemptions;