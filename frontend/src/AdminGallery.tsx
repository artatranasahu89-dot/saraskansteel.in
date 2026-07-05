import { useEffect, useState } from "react";
import axios from "axios";
import AdminLayout from "./AdminLayout";

type GalleryItem = {
  id: string;
  title?: string;
  description?: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

type GalleryForm = {
  title: string;
  description: string;
  imageUrl: string;
  displayOrder: number;
  isActive: boolean;
};

function AdminGallery() {
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [form, setForm] = useState<GalleryForm>({
    title: "",
    description: "",
    imageUrl: "",
    displayOrder: 1,
    isActive: true,
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  const loadGallery = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/website-gallery/admin",
        { headers }
      );

      setGallery(res.data.data || []);
    } catch (error) {
      console.log("Gallery load error", error);
      alert("Failed to load gallery");
    }
  };

  useEffect(() => {
    loadGallery();
  }, []);

  const uploadGalleryImage = async (file: File) => {
    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("image", file);

      const res = await axios.post(
        "http://localhost:5000/api/upload/gallery-image",
        formData,
        {
          headers: {
            ...headers,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setForm((prev) => ({
        ...prev,
        imageUrl: res.data.imageUrl,
      }));

      alert("Gallery image uploaded successfully");
    } catch (error) {
      console.log(error);
      alert("Gallery image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      description: "",
      imageUrl: "",
      displayOrder: 1,
      isActive: true,
    });

    setEditingId(null);
  };

  const saveGallery = async () => {
    if (!form.imageUrl.trim()) {
      alert("Please upload gallery image");
      return;
    }

    try {
      setLoading(true);

      if (editingId) {
        await axios.put(
          `http://localhost:5000/api/website-gallery/${editingId}`,
          form,
          { headers }
        );

        alert("Gallery image updated successfully");
      } else {
        await axios.post("http://localhost:5000/api/website-gallery", form, {
          headers,
        });

        alert("Gallery image added successfully");
      }

      resetForm();
      loadGallery();
    } catch (error) {
      console.log(error);
      alert("Save failed");
    } finally {
      setLoading(false);
    }
  };

  const editGallery = (item: GalleryItem) => {
    setEditingId(item.id);

    setForm({
      title: item.title || "",
      description: item.description || "",
      imageUrl: item.imageUrl || "",
      displayOrder: item.displayOrder || 1,
      isActive: item.isActive,
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const deleteGallery = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this gallery image?"
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/website-gallery/${id}`, {
        headers,
      });

      alert("Gallery image deleted successfully");
      loadGallery();
    } catch (error) {
      console.log(error);
      alert("Delete failed");
    }
  };

  return (
    <AdminLayout>
      <style>{`
        .gallery-page {
          padding: 34px;
          background: linear-gradient(135deg, #f8fafc, #eef2ff);
          min-height: calc(100vh - 80px);
        }

        .gallery-top {
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

        .gallery-top h1 {
          margin: 0;
          font-size: 38px;
          font-weight: 1000;
        }

        .gallery-top p {
          margin: 10px 0 0;
          color: #dbeafe;
          font-size: 16px;
          max-width: 760px;
          line-height: 1.7;
        }

        .gallery-badge {
          background: rgba(255, 255, 255, 0.14);
          border: 1px solid rgba(255, 255, 255, 0.25);
          padding: 14px 18px;
          border-radius: 18px;
          font-weight: 900;
          white-space: nowrap;
        }

        .gallery-layout {
          display: grid;
          grid-template-columns: 0.9fr 1.1fr;
          gap: 26px;
          align-items: start;
        }

        .gallery-card {
          background: white;
          border-radius: 28px;
          padding: 28px;
          box-shadow: 0 14px 34px rgba(15, 23, 42, 0.09);
          border: 1px solid #e5e7eb;
        }

        .gallery-card h2 {
          margin: 0 0 22px;
          font-size: 26px;
          font-weight: 1000;
          color: #111827;
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

        .gallery-input,
        .gallery-textarea {
          width: 100%;
          border: 1px solid #d1d5db;
          background: #f9fafb;
          border-radius: 16px;
          padding: 14px 16px;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .gallery-input:focus,
        .gallery-textarea:focus {
          border-color: #2563eb;
          background: white;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
        }

        .gallery-textarea {
          height: 120px;
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

        .preview-image {
          margin-top: 18px;
          width: 100%;
          height: 230px;
          object-fit: cover;
          border-radius: 22px;
          box-shadow: 0 12px 28px rgba(15, 23, 42, 0.14);
        }

        .check-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 900;
          color: #374151;
        }

        .check-row input {
          width: 18px;
          height: 18px;
        }

        .action-row {
          display: grid;
          grid-template-columns: 1fr 140px;
          gap: 12px;
          margin-top: 20px;
        }

        .save-btn,
        .cancel-btn {
          border: none;
          border-radius: 18px;
          padding: 16px 20px;
          font-size: 16px;
          font-weight: 1000;
          cursor: pointer;
        }

        .save-btn {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          color: white;
          box-shadow: 0 12px 24px rgba(37, 99, 235, 0.25);
        }

        .cancel-btn {
          background: #e5e7eb;
          color: #111827;
        }

        .save-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .gallery-list-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .gallery-list-top h2 {
          margin: 0;
        }

        .count-pill {
          background: #eff6ff;
          color: #1d4ed8;
          padding: 9px 14px;
          border-radius: 999px;
          font-weight: 1000;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
        }

        .gallery-item {
          background: #f8fafc;
          border: 1px solid #e5e7eb;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 8px 22px rgba(15, 23, 42, 0.06);
        }

        .gallery-item img {
          width: 100%;
          height: 220px;
          object-fit: cover;
          display: block;
        }

        .gallery-info {
          padding: 18px;
        }

        .gallery-info h3 {
          margin: 0 0 6px;
          font-size: 20px;
          color: #111827;
        }

        .gallery-info p {
          margin: 0;
          color: #64748b;
          line-height: 1.6;
          font-size: 14px;
        }

        .meta-row {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          align-items: center;
          margin-top: 14px;
        }

        .status {
          padding: 7px 10px;
          border-radius: 999px;
          font-weight: 1000;
          font-size: 12px;
        }

        .status.active {
          background: #dcfce7;
          color: #166534;
        }

        .status.hidden {
          background: #fee2e2;
          color: #991b1b;
        }

        .order-pill {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 7px 10px;
          border-radius: 999px;
          font-weight: 900;
          color: #475569;
          font-size: 12px;
        }

        .item-actions {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-top: 16px;
        }

        .edit-btn,
        .delete-btn {
          border: none;
          border-radius: 14px;
          padding: 11px 14px;
          font-weight: 1000;
          cursor: pointer;
        }

        .edit-btn {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .delete-btn {
          background: #fee2e2;
          color: #991b1b;
        }

        .empty-box {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          padding: 40px;
          text-align: center;
          color: #64748b;
          font-weight: 800;
        }

        @media(max-width: 1100px) {
          .gallery-layout {
            grid-template-columns: 1fr;
          }

          .gallery-grid {
            grid-template-columns: 1fr;
          }
        }

        @media(max-width: 700px) {
          .gallery-page {
            padding: 18px;
          }

          .gallery-top {
            flex-direction: column;
            align-items: flex-start;
          }

          .gallery-top h1 {
            font-size: 30px;
          }

          .action-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="gallery-page">
        <div className="gallery-top">
          <div>
            <h1>Website Gallery</h1>
            <p>
              Upload and manage company gallery images shown on the public About
              page of SARASKANA STEEL.
            </p>
          </div>

          <div className="gallery-badge">Website Management</div>
        </div>

        <div className="gallery-layout">
          <div className="gallery-card">
            <h2>{editingId ? "Edit Gallery Image" : "Add Gallery Image"}</h2>

            <div className="form-row">
              <label>Title</label>
              <input
                className="gallery-input"
                placeholder="Example: Cement Delivery"
                value={form.title}
                onChange={(e) =>
                  setForm({ ...form, title: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <label>Description</label>
              <textarea
                className="gallery-textarea"
                placeholder="Small description about this photo..."
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
              />
            </div>

            <div className="form-row">
              <label>Display Order</label>
              <input
                className="gallery-input"
                type="number"
                min="1"
                value={form.displayOrder}
                onChange={(e) =>
                  setForm({
                    ...form,
                    displayOrder: Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="form-row">
              <label>Gallery Photo</label>

              <label className="upload-box">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) uploadGalleryImage(file);
                  }}
                />

                <strong>
                  {uploading ? "Uploading image..." : "Click to upload image"}
                </strong>

                <span>
                  Upload a company, delivery, material or customer image.
                </span>
              </label>

              {form.imageUrl && (
                <img
                  className="preview-image"
                  src={form.imageUrl}
                  alt="Gallery preview"
                />
              )}
            </div>

            <div className="form-row">
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Show this image on public website
              </label>
            </div>

            <div className="action-row">
              <button
                className="save-btn"
                onClick={saveGallery}
                disabled={loading || uploading}
              >
                {loading
                  ? "Saving..."
                  : editingId
                  ? "Update Gallery Image"
                  : "Add Gallery Image"}
              </button>

              <button className="cancel-btn" onClick={resetForm}>
                Clear
              </button>
            </div>
          </div>

          <div className="gallery-card">
            <div className="gallery-list-top">
              <h2>Gallery Images</h2>
              <div className="count-pill">{gallery.length} Images</div>
            </div>

            {gallery.length === 0 ? (
              <div className="empty-box">
                No gallery images added yet.
              </div>
            ) : (
              <div className="gallery-grid">
                {gallery.map((item) => (
                  <div className="gallery-item" key={item.id}>
                    <img src={item.imageUrl} alt={item.title || "Gallery"} />

                    <div className="gallery-info">
                      <h3>{item.title || "Untitled Image"}</h3>

                      <p>
                        {item.description ||
                          "No description added for this image."}
                      </p>

                      <div className="meta-row">
                        <span
                          className={
                            item.isActive
                              ? "status active"
                              : "status hidden"
                          }
                        >
                          {item.isActive ? "ACTIVE" : "HIDDEN"}
                        </span>

                        <span className="order-pill">
                          Order: {item.displayOrder}
                        </span>
                      </div>

                      <div className="item-actions">
                        <button
                          className="edit-btn"
                          onClick={() => editGallery(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="delete-btn"
                          onClick={() => deleteGallery(item.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminGallery;