import { useEffect, useRef, useState } from "react";
import axios from "axios";
import * as faceapi from "face-api.js";
import AdminLayout from "./AdminLayout";

function AdminFaceManagement() {
  const [faces, setFaces] = useState<any[]>([]);
  const [faceName, setFaceName] = useState("");
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);

  const token = localStorage.getItem("token");
  const headers = { Authorization: "Bearer " + token };

  const loadModels = async () => {
    await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
    await faceapi.nets.faceLandmark68Net.loadFromUri("/models");
    await faceapi.nets.faceRecognitionNet.loadFromUri("/models");
    setModelsLoaded(true);
  };

  const loadFaces = async () => {
    const res = await axios.get("https://saraskansteel-in.onrender.com/api/auth/admin-faces", {
      headers,
    });
    setFaces(res.data.data || []);
  };

  const startCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      setCameraOn(true);
    }
  };

  const registerFace = async () => {
    if (!modelsLoaded) {
      alert("Face models still loading");
      return;
    }

    if (faces.length >= 3) {
      alert("Maximum 3 faces allowed");
      return;
    }

    if (!videoRef.current) {
      alert("Camera not ready");
      return;
    }

    const detection = await faceapi
      .detectSingleFace(
        videoRef.current,
        new faceapi.TinyFaceDetectorOptions()
      )
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detection) {
      alert("No face detected. Look clearly at camera.");
      return;
    }

    const faceEncoding = Array.from(detection.descriptor);

    await axios.post(
      "https://saraskansteel-in.onrender.com/api/auth/admin-face-register",
      {
        faceName: faceName || `Face ${faces.length + 1}`,
        faceEncoding,
      },
      { headers }
    );

    alert("Face registered successfully");
    setFaceName("");
    loadFaces();
  };

  const deleteFace = async (id: string) => {
    if (!confirm("Delete this face?")) return;

    await axios.delete(`https://saraskansteel-in.onrender.com/api/auth/admin-face/${id}`, {
      headers,
    });

    alert("Face deleted");
    loadFaces();
  };

  useEffect(() => {
    loadModels();
    loadFaces();
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
          background: linear-gradient(135deg,#111827,#1f2937);
          color: white;
          border-radius: 22px;
          padding: 24px;
          margin-bottom: 20px;
        }

        .grid {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 20px;
        }

        .card {
          background: white;
          border-radius: 20px;
          padding: 18px;
          box-shadow: 0 6px 18px rgba(0,0,0,.08);
        }

        video {
          width: 100%;
          height: 360px;
          object-fit: cover;
          background: #111827;
          border-radius: 18px;
          margin-bottom: 14px;
        }

        .input {
          width: 100%;
          padding: 13px;
          border-radius: 12px;
          border: 1px solid #d1d5db;
          margin-bottom: 12px;
        }

        .btn {
          border: none;
          border-radius: 12px;
          padding: 12px 14px;
          background: #111827;
          color: white;
          font-weight: 900;
          cursor: pointer;
          width: 100%;
          margin-bottom: 10px;
        }

        .green { background: #16a34a; }
        .red { background: #dc2626; }
        .blue { background: #2563eb; }

        .face-item {
          border: 1px solid #e5e7eb;
          border-radius: 14px;
          padding: 14px;
          margin-bottom: 10px;
          background: #f9fafb;
        }

        .status {
          display: inline-block;
          padding: 6px 10px;
          border-radius: 999px;
          background: #dcfce7;
          color: #166534;
          font-weight: 900;
          font-size: 13px;
          margin-bottom: 12px;
        }

        @media(max-width: 900px) {
          .grid {
            grid-template-columns: 1fr;
          }

          .page {
            padding: 12px;
          }
        }
      `}</style>

      <div className="page">
        <div className="header">
          <h1 style={{ margin: 0 }}>🔐 Admin Face Management</h1>
          <p style={{ margin: "6px 0 0" }}>
            Register up to 3 trusted admin faces for secure login.
          </p>
        </div>

        <div className="grid">
          <div className="card">
            <h2>Register New Face</h2>

            <div className="status">
              {modelsLoaded ? "Face models loaded" : "Loading face models..."}
            </div>

            <video ref={videoRef} autoPlay playsInline />

            <input
              className="input"
              placeholder="Face name e.g. Owner, Partner, Backup"
              value={faceName}
              onChange={(e) => setFaceName(e.target.value)}
            />

            <button className="btn blue" onClick={startCamera}>
              {cameraOn ? "Camera On" : "Start Camera"}
            </button>

            <button className="btn green" onClick={registerFace}>
              Register Face
            </button>

            <p style={{ color: "#6b7280" }}>
              Current registered faces: <b>{faces.length}/3</b>
            </p>
          </div>

          <div className="card">
            <h2>Registered Faces</h2>

            {faces.map((f) => (
              <div className="face-item" key={f.id}>
                <h3 style={{ margin: "0 0 6px" }}>{f.faceName}</h3>
                <small>
                  Added: {new Date(f.createdAt).toLocaleDateString()}
                </small>

                <button
                  className="btn red"
                  style={{ marginTop: 12 }}
                  onClick={() => deleteFace(f.id)}
                >
                  Delete Face
                </button>
              </div>
            ))}

            {faces.length === 0 && <p>No admin faces registered yet.</p>}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminFaceManagement;