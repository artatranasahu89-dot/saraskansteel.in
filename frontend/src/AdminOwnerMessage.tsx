import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

type OwnerForm = {
  name: string;
  designation: string;
  message: string;
  imageUrl: string;
  coOwnerName: string;
  coOwnerDesignation: string;
  coOwnerMessage: string;
  coOwnerImageUrl: string;
};

function AdminOwnerMessage() {
  const [form, setForm] = useState<OwnerForm>({
    name: "",
    designation: "",
    message: "",
    imageUrl: "",
    coOwnerName: "",
    coOwnerDesignation: "",
    coOwnerMessage: "",
    coOwnerImageUrl: "",
  });

  const [loading, setLoading] = useState(false);
  const [uploadingOwner, setUploadingOwner] = useState(false);
  const [uploadingCoOwner, setUploadingCoOwner] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadOwnerMessage = async () => {
    try {
      const res = await axios.get(
        "https://saraskansteel-in.onrender.com/api/website/owner-message"
      );

      if (res.data.data) {
        setForm({
          name: res.data.data.name || "",
          designation: res.data.data.designation || "",
          message: res.data.data.message || "",
          imageUrl: res.data.data.imageUrl || "",
          coOwnerName: res.data.data.coOwnerName || "",
          coOwnerDesignation: res.data.data.coOwnerDesignation || "",
          coOwnerMessage: res.data.data.coOwnerMessage || "",
          coOwnerImageUrl: res.data.data.coOwnerImageUrl || "",
        });
      }
    } catch (error) {
      console.log("Owner message load error", error);
    }
  };

  useEffect(() => {
    loadOwnerMessage();
  }, []);

  const uploadImage = async (file: File, type: "owner" | "coOwner") => {
    try {
      if (type === "owner") setUploadingOwner(true);
      if (type === "coOwner") setUploadingCoOwner(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "https://saraskansteel-in.onrender.com/api/upload/profile-image",
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (type === "owner") {
        setForm((prev) => ({
          ...prev,
          imageUrl: res.data.imageUrl,
        }));
      }

      if (type === "coOwner") {
        setForm((prev) => ({
          ...prev,
          coOwnerImageUrl: res.data.imageUrl,
        }));
      }

      alert("Photo uploaded successfully");
    } catch (error) {
      alert("Photo upload failed");
      console.log(error);
    } finally {
      setUploadingOwner(false);
      setUploadingCoOwner(false);
    }
  };

  const saveOwnerMessage = async () => {
    if (!form.name.trim()) {
      alert("Please enter owner name");
      return;
    }

    if (!form.designation.trim()) {
      alert("Please enter owner designation");
      return;
    }

    if (!form.message.trim()) {
      alert("Please enter owner message");
      return;
    }

    if (!form.imageUrl.trim()) {
      alert("Please upload owner photo");
      return;
    }

    if (!form.coOwnerName.trim()) {
      alert("Please enter co-owner name");
      return;
    }

    if (!form.coOwnerDesignation.trim()) {
      alert("Please enter co-owner designation");
      return;
    }

    if (!form.coOwnerMessage.trim()) {
      alert("Please enter co-owner message");
      return;
    }

    if (!form.coOwnerImageUrl.trim()) {
      alert("Please upload co-owner photo");
      return;
    }

    try {
      setLoading(true);

      await axios.put(
        "https://saraskansteel-in.onrender.com/api/website/owner-message",
        form,
        { headers }
      );

      alert("Owner and Co-owner messages saved successfully");
      loadOwnerMessage();
    } catch (error) {
      alert("Save failed");
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .owner-page {
          padding: 34px;
          background: linear-gradient(135deg, #f8fafc, #eef2ff);
          min-height: calc(100vh - 80px);
        }

        .owner-top {
          background: linear-gradient(135deg, #111827, #1e3a8a);
          color: white;
          border-radius: 30px;
          padding: 34px;
          display: flex;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.2);
          margin-bottom: 28px;
        }

        .owner-top h1 {
          margin: 0;
          font-size: 38px;
          font-weight: 1000;
        }

        .owner-top p {
          margin: 10px 0 0;
          color: #dbeafe;
          font-size: 16px;
          max-width: 760px;
          line-height: 1.7;
        }

        .owner-badge {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 14px 18px;
          border-radius: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .main-grid {
          display: grid;
          grid-template-columns: 1.1fr 0.9fr;
          gap: 26px;
          align-items: start;
        }

        .form-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
          border: 1px solid #e5e7eb;
        }

        .section-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0 0 22px;
          font-size: 25px;
          font-weight: 1000;
          color: #111827;
        }

        .section-title span {
          width: 42px;
          height: 42px;
          border-radius: 14px;
          background: #eff6ff;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .person-box {
          border: 1px solid #e5e7eb;
          background: #f8fafc;
          border-radius: 26px;
          padding: 24px;
          margin-bottom: 24px;
        }

        .person-box:last-child {
          margin-bottom: 0;
        }

        .person-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 18px;
        }

        .person-header h3 {
          margin: 0;
          font-size: 23px;
          font-weight: 1000;
          color: #111827;
        }

        .person-tag {
          background: #dbeafe;
          color: #1d4ed8;
          font-size: 13px;
          font-weight: 1000;
          padding: 8px 12px;
          border-radius: 999px;
        }

        .form-row {
          margin-bottom: 18px;
        }

        .form-row label {
          display: block;
          font-weight: 900;
          color: #374151;
          margin-bottom: 8px;
        }

        .owner-input,
        .owner-textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          background: white;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .owner-input:focus,
        .owner-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .owner-textarea {
          height: 150px;
          resize: vertical;
          line-height: 1.7;
        }

        .upload-box {
          border: 2px dashed #93c5fd;
          background: #eff6ff;
          padding: 22px;
          border-radius: 22px;
          text-align: center;
          cursor: pointer;
          display: block;
        }

        .upload-box input {
          display: none;
        }

        .upload-box strong {
          display: block;
          font-size: 18px;
          color: #1d4ed8;
          margin-bottom: 6px;
        }

        .upload-box span {
          color: #475569;
          font-size: 14px;
        }

        .saved-photo {
          margin-top: 14px;
          display: flex;
          align-items: center;
          gap: 12px;
          background: white;
          border-radius: 16px;
          padding: 10px;
          border: 1px solid #e5e7eb;
        }

        .saved-photo img {
          width: 58px;
          height: 58px;
          border-radius: 50%;
          object-fit: cover;
        }

        .saved-photo b {
          color: #16a34a;
        }

        .save-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 17px 20px;
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          font-size: 17px;
          font-weight: 1000;
          cursor: pointer;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
          margin-top: 8px;
        }

        .save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .preview-wrap {
          display: grid;
          gap: 22px;
          position: sticky;
          top: 100px;
        }

        .preview-card {
          background: linear-gradient(135deg, #111827, #0f172a);
          color: white;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 18px 40px rgba(15, 23, 42, 0.25);
          text-align: center;
        }

        .preview-title {
          background: rgba(255, 255, 255, 0.1);
          display: inline-block;
          padding: 8px 14px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
          margin-bottom: 20px;
          color: #fbbf24;
        }

        .preview-img {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          object-fit: cover;
          border: 6px solid rgba(255, 255, 255, 0.22);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
          margin-bottom: 18px;
          background: #1f2937;
        }

        .preview-empty {
          width: 150px;
          height: 150px;
          border-radius: 50%;
          margin: 0 auto 18px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 58px;
          border: 6px solid rgba(255, 255, 255, 0.22);
        }

        .preview-card h3 {
          margin: 0;
          font-size: 26px;
          font-weight: 1000;
        }

        .preview-card h4 {
          margin: 8px 0 18px;
          color: #fbbf24;
          font-size: 15px;
          letter-spacing: 0.5px;
        }

        .preview-card p {
          color: #d1d5db;
          line-height: 1.8;
          font-size: 15px;
          margin: 0;
        }

        .help-box {
          margin-top: 22px;
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 20px;
          padding: 18px;
          color: #475569;
          line-height: 1.7;
        }

        .help-box b {
          color: #111827;
        }

        @media(max-width: 1000px) {
          .owner-page {
            padding: 18px;
          }

          .owner-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .owner-top h1 {
            font-size: 30px;
          }

          .main-grid {
            grid-template-columns: 1fr;
          }

          .preview-wrap {
            position: static;
          }
        }
      `}</style>

      <div className="owner-page">
        <div className="owner-top">
          <div>
            <h1>Owner & Co-owner Message</h1>
            <p>
              Manage the owner and co-owner photo, name, designation and message
              shown on the public About page of SARASKANA STEEL.
            </p>
          </div>

          <div className="owner-badge">Website Management</div>
        </div>

        <div className="main-grid">
          <div className="form-card">
            <h2 className="section-title">
              <span>✍️</span>
              Edit Website Messages
            </h2>

            <div className="person-box">
              <div className="person-header">
                <h3>Owner Details</h3>
                <div className="person-tag">OWNER</div>
              </div>

              <div className="form-row">
                <label>Owner Name</label>
                <input
                  className="owner-input"
                  placeholder="Example: Artatrana Sahu"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Owner Designation</label>
                <input
                  className="owner-input"
                  placeholder="Example: Founder, SARASKANA STEEL"
                  value={form.designation}
                  onChange={(e) =>
                    setForm({ ...form, designation: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Owner Message</label>
                <textarea
                  className="owner-textarea"
                  placeholder="Write owner message here..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Owner Photo</label>

                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "owner");
                    }}
                  />

                  <strong>
                    {uploadingOwner
                      ? "Uploading owner photo..."
                      : "Click to upload owner photo"}
                  </strong>

                  <span>Upload a clear owner photo.</span>
                </label>

                {form.imageUrl && (
                  <div className="saved-photo">
                    <img src={form.imageUrl} alt="Owner" />
                    <div>
                      <b>Owner photo uploaded</b>
                      <br />
                      <small>Ready to save</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="person-box">
              <div className="person-header">
                <h3>Co-owner Details</h3>
                <div className="person-tag">CO-OWNER</div>
              </div>

              <div className="form-row">
                <label>Co-owner Name</label>
                <input
                  className="owner-input"
                  placeholder="Example: Co-owner Name"
                  value={form.coOwnerName}
                  onChange={(e) =>
                    setForm({ ...form, coOwnerName: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Co-owner Designation</label>
                <input
                  className="owner-input"
                  placeholder="Example: Co-founder, SARASKANA STEEL"
                  value={form.coOwnerDesignation}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      coOwnerDesignation: e.target.value,
                    })
                  }
                />
              </div>

              <div className="form-row">
                <label>Co-owner Message</label>
                <textarea
                  className="owner-textarea"
                  placeholder="Write co-owner message here..."
                  value={form.coOwnerMessage}
                  onChange={(e) =>
                    setForm({ ...form, coOwnerMessage: e.target.value })
                  }
                />
              </div>

              <div className="form-row">
                <label>Co-owner Photo</label>

                <label className="upload-box">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) uploadImage(file, "coOwner");
                    }}
                  />

                  <strong>
                    {uploadingCoOwner
                      ? "Uploading co-owner photo..."
                      : "Click to upload co-owner photo"}
                  </strong>

                  <span>Upload a clear co-owner photo.</span>
                </label>

                {form.coOwnerImageUrl && (
                  <div className="saved-photo">
                    <img src={form.coOwnerImageUrl} alt="Co-owner" />
                    <div>
                      <b>Co-owner photo uploaded</b>
                      <br />
                      <small>Ready to save</small>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              className="save-btn"
              onClick={saveOwnerMessage}
              disabled={loading || uploadingOwner || uploadingCoOwner}
            >
              {loading ? "Saving..." : "Save Owner & Co-owner Message"}
            </button>

            <div className="help-box">
              <b>Where this appears:</b>
              <br />
              This data will show on the public About page:
              <br />
              <b>http://localhost:5173/about</b>
            </div>
          </div>

          <div className="preview-wrap">
            <div className="preview-card">
              <div className="preview-title">OWNER PREVIEW</div>

              {form.imageUrl ? (
                <img className="preview-img" src={form.imageUrl} alt="Owner" />
              ) : (
                <div className="preview-empty">👤</div>
              )}

              <h3>{form.name || "Owner Name"}</h3>

              <h4>{form.designation || "Owner Designation"}</h4>

              <p>
                {form.message ||
                  "Owner message preview will appear here as you type."}
              </p>
            </div>

            <div className="preview-card">
              <div className="preview-title">CO-OWNER PREVIEW</div>

              {form.coOwnerImageUrl ? (
                <img
                  className="preview-img"
                  src={form.coOwnerImageUrl}
                  alt="Co-owner"
                />
              ) : (
                <div className="preview-empty">👤</div>
              )}

              <h3>{form.coOwnerName || "Co-owner Name"}</h3>

              <h4>{form.coOwnerDesignation || "Co-owner Designation"}</h4>

              <p>
                {form.coOwnerMessage ||
                  "Co-owner message preview will appear here as you type."}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOwnerMessage;