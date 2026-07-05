import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

type ScreenMode = "LOGIN" | "REGISTER" | "FORGOT" | "FACE";
type LoginRole = "ADMIN" | "STAFF" | "CUSTOMER";

function Login() {
  const navigate = useNavigate();
  const API = "http://localhost:5000";

  const [screen, setScreen] = useState<ScreenMode>("LOGIN");

  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");

  const [adminHasFace, setAdminHasFace] = useState(false);
  const [pendingAdminToken, setPendingAdminToken] = useState("");
  const [pendingAdminUser, setPendingAdminUser] = useState<any>(null);

  const [registerForm, setRegisterForm] = useState({
    name: "",
    mobile: "",
    email: "",
    dateOfBirth: "",
    password: "",
    confirmPassword: "",
  });

  const [forgotForm, setForgotForm] = useState({
    loginId: "",
    dateOfBirth: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [cameraError, setCameraError] = useState("");

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const detectLoginRole = (value: string): LoginRole => {
    const v = value.trim();

    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
      return "ADMIN";
    }

    if (/^ST[0-9A-Z]+$/i.test(v)) {
      return "STAFF";
    }

    return "CUSTOMER";
  };

  const saveLogin = (data: any, fallbackRole: LoginRole) => {
    const token =
      data?.token ||
      data?.accessToken ||
      data?.data?.token ||
      data?.data?.accessToken ||
      "";

    const user =
      data?.user ||
      data?.data?.user ||
      data?.admin ||
      data?.staff ||
      data?.customer ||
      data?.data?.admin ||
      data?.data?.staff ||
      data?.data?.customer ||
      {};

    if (!token) {
      alert("Login failed. Token not received from backend.");
      return false;
    }

    localStorage.setItem("token", token);
    localStorage.setItem(
      "user",
      JSON.stringify({
        ...user,
        role: user?.role || fallbackRole,
      })
    );

    return true;
  };

  const goDashboard = (role: LoginRole) => {
    if (role === "ADMIN") {
      navigate("/dashboard");
      return;
    }

    if (role === "STAFF") {
      navigate("/staff-dashboard");
      return;
    }

    navigate("/customer-dashboard");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!loginId.trim()) {
      alert("Please enter Login ID");
      return;
    }

    if (!password.trim()) {
      alert("Please enter password");
      return;
    }

    const role = detectLoginRole(loginId);

    try {
      setLoading(true);

      if (role === "ADMIN") {
        const res = await axios.post(`${API}/api/auth/admin-login`, {
          email: loginId.trim(),
          loginId: loginId.trim(),
          password,
        });

        const token =
          res.data?.token ||
          res.data?.accessToken ||
          res.data?.data?.token ||
          "";

        const user =
          res.data?.user ||
          res.data?.data?.user ||
          res.data?.admin || {
            email: loginId.trim(),
            role: "ADMIN",
          };

        if (!token) {
          alert("Admin login token not received");
          return;
        }

        setPendingAdminToken(token);
        setPendingAdminUser(user);
        setAdminHasFace(Boolean(res.data?.requiresFace || res.data?.faceCount > 0));
        setScreen("FACE");
        return;
      }

      if (role === "STAFF") {
        const staffLoginId = loginId.trim();

        const res = await axios.post(`${API}/api/auth/staff-login`, {
          staffId: staffLoginId,
          staffCode: staffLoginId,
          employeeId: staffLoginId,
          loginId: staffLoginId,
          email: staffLoginId,
          password,
        });

        const ok = saveLogin(res.data, "STAFF");

        if (ok) {
          goDashboard("STAFF");
        }

        return;
      }

      const res = await axios.post(`${API}/api/customer-auth/login`, {
        loginId: loginId.trim(),
        customerId: loginId.trim(),
        mobile: loginId.trim(),
        password,
      });

      const ok = saveLogin(res.data, "CUSTOMER");

      if (ok) {
        goDashboard("CUSTOMER");
      }
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!registerForm.name.trim()) {
      alert("Please enter full name");
      return;
    }

    if (!registerForm.mobile.trim()) {
      alert("Please enter mobile number");
      return;
    }

    if (!/^[0-9]{10}$/.test(registerForm.mobile.trim())) {
      alert("Please enter valid 10 digit mobile number");
      return;
    }

    if (!registerForm.dateOfBirth.trim()) {
      alert("Please enter date of birth");
      return;
    }

    if (!registerForm.password.trim()) {
      alert("Please enter password");
      return;
    }

    if (registerForm.password !== registerForm.confirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/api/customer-auth/register`, {
        name: registerForm.name.trim(),
        mobile: registerForm.mobile.trim(),
        phone: registerForm.mobile.trim(),
        email: registerForm.email.trim() || undefined,
        dateOfBirth: registerForm.dateOfBirth,
        password: registerForm.password,
      });

      alert("Registration successful. Please login now.");

      setLoginId(registerForm.mobile);
      setPassword("");
      setRegisterForm({
        name: "",
        mobile: "",
        email: "",
        dateOfBirth: "",
        password: "",
        confirmPassword: "",
      });
      setScreen("LOGIN");
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!forgotForm.loginId.trim()) {
      alert("Please enter Customer ID or Mobile Number");
      return;
    }

    if (!forgotForm.dateOfBirth.trim()) {
      alert("Please enter date of birth");
      return;
    }

    if (!forgotForm.newPassword.trim()) {
      alert("Please enter new password");
      return;
    }

    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    try {
      setLoading(true);

      await axios.post(`${API}/api/customer-auth/forgot-password/verify`, {
        loginId: forgotForm.loginId.trim(),
        customerId: forgotForm.loginId.trim(),
        mobile: forgotForm.loginId.trim(),
        dateOfBirth: forgotForm.dateOfBirth,
      });

      await axios.post(`${API}/api/customer-auth/reset-password`, {
        loginId: forgotForm.loginId.trim(),
        customerId: forgotForm.loginId.trim(),
        mobile: forgotForm.loginId.trim(),
        dateOfBirth: forgotForm.dateOfBirth,
        newPassword: forgotForm.newPassword,
        password: forgotForm.newPassword,
      });

      alert("Password reset successful. Please login now.");

      setLoginId(forgotForm.loginId);
      setPassword("");
      setForgotForm({
        loginId: "",
        dateOfBirth: "",
        newPassword: "",
        confirmPassword: "",
      });
      setScreen("LOGIN");
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      setCameraError("");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch {
      setCameraError("Camera permission denied or camera not found.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  useEffect(() => {
    if (screen === "FACE") {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [screen]);

  const captureFaceImage = () => {
    if (!videoRef.current) return "";

    const video = videoRef.current;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");

    if (!ctx) return "";

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    return canvas.toDataURL("image/jpeg", 0.8);
  };

  const createFaceEncodingFromCamera = () => {
    const image = captureFaceImage();

    if (!image) return null;

    const cleanImage = image.replace(/^data:image\/[a-zA-Z]+;base64,/, "");

    const encoding: number[] = [];

    for (let i = 0; i < 64; i++) {
      const start = Math.floor((cleanImage.length / 64) * i);
      const chunk = cleanImage.slice(start, start + 300);

      let sum = 0;

      for (let j = 0; j < chunk.length; j++) {
        sum += chunk.charCodeAt(j);
      }

      encoding.push(sum % 1000);
    }

    return {
      image,
      faceEncoding: encoding,
    };
  };

  const registerAdminFace = async () => {
    const scan = createFaceEncodingFromCamera();

    if (!scan) {
      alert("Face scan failed. Please wait 2 seconds and try again.");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        `${API}/api/auth/admin-face-register`,
        {
          email: loginId.trim(),
          loginId: loginId.trim(),
          faceName: "Admin Face",
          image: scan.image,
          faceImage: scan.image,
          faceEncoding: scan.faceEncoding,
        },
        {
          headers: {
            Authorization: `Bearer ${pendingAdminToken}`,
          },
        }
      );

      localStorage.setItem("token", pendingAdminToken);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...pendingAdminUser,
          role: "ADMIN",
        })
      );

      stopCamera();
      alert("Face registered successfully");
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Face register failed");
    } finally {
      setLoading(false);
    }
  };

  const verifyAdminFace = async () => {
    const scan = createFaceEncodingFromCamera();

    if (!scan) {
      alert("Face scan failed. Please wait 2 seconds and try again.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`${API}/api/auth/admin-face-login`, {
        email: loginId.trim(),
        loginId: loginId.trim(),
        image: scan.image,
        faceImage: scan.image,
        faceEncoding: scan.faceEncoding,
      });

      const token = res.data?.token || pendingAdminToken;

      const user =
        res.data?.user ||
        pendingAdminUser || {
          email: loginId.trim(),
          role: "ADMIN",
        };

      localStorage.setItem("token", token);
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          role: "ADMIN",
        })
      );

      stopCamera();
      navigate("/dashboard");
    } catch (error: any) {
      console.log(error);
      alert(error?.response?.data?.message || "Face verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
        }

        .auth-page {
          min-height: 100vh;
          background:
            radial-gradient(circle at top left, rgba(245, 158, 11, 0.30), transparent 34%),
            radial-gradient(circle at bottom right, rgba(20, 184, 166, 0.22), transparent 36%),
            linear-gradient(135deg, #111827, #292524);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 28px;
          color: #111827;
          position: relative;
          overflow: hidden;
        }

        .auth-page::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            linear-gradient(rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
            url("https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1600&q=80");
          background-size: cover;
          background-position: center;
          opacity: 0.18;
        }

        .auth-shell {
          width: 100%;
          max-width: 1180px;
          min-height: 660px;
          display: grid;
          grid-template-columns: 1fr 440px;
          position: relative;
          z-index: 2;
          border-radius: 36px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.28);
          background: rgba(255,255,255,0.12);
          backdrop-filter: blur(24px);
          box-shadow: 0 35px 95px rgba(0,0,0,0.38);
        }

        .brand-panel {
          padding: 54px;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          background: rgba(15, 23, 42, 0.38);
          border-right: 1px solid rgba(255,255,255,0.16);
        }

        .brand-logo {
          font-size: 38px;
          font-weight: 1000;
          letter-spacing: 1px;
        }

        .brand-logo span {
          color: #f59e0b;
        }

        .brand-panel h1 {
          font-size: 54px;
          line-height: 1.05;
          margin: 70px 0 18px;
          font-weight: 1000;
          max-width: 650px;
        }

        .brand-panel p {
          color: #e5e7eb;
          line-height: 1.8;
          font-size: 18px;
          max-width: 650px;
        }

        .feature-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
          margin-top: 30px;
        }

        .feature {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.20);
          border-radius: 20px;
          padding: 16px;
          color: white;
          font-weight: 900;
          backdrop-filter: blur(10px);
        }

        .form-panel {
          background: rgba(255,255,255,0.82);
          backdrop-filter: blur(20px);
          padding: 44px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .form-panel h2 {
          margin: 0;
          font-size: 36px;
          font-weight: 1000;
          color: #111827;
        }

        .subtitle {
          margin: 10px 0 26px;
          color: #64748b;
          line-height: 1.7;
          font-size: 15px;
        }

        .form-row {
          margin-bottom: 16px;
        }

        .form-row label {
          display: block;
          font-weight: 900;
          color: #374151;
          margin-bottom: 8px;
          font-size: 14px;
        }

        .input {
          width: 100%;
          border: 1px solid rgba(148, 163, 184, 0.70);
          background: rgba(255,255,255,0.78);
          border-radius: 18px;
          padding: 15px 16px;
          font-size: 15px;
          outline: none;
          transition: 0.2s;
        }

        .input:focus {
          border-color: #f59e0b;
          background: white;
          box-shadow: 0 0 0 4px rgba(245, 158, 11, 0.16);
        }

        .submit-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 16px 20px;
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #111827;
          font-size: 17px;
          font-weight: 1000;
          cursor: pointer;
          box-shadow: 0 14px 30px rgba(217,119,6,0.28);
          margin-top: 8px;
        }

        .submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
        }

        .link-row {
          margin-top: 18px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .text-btn {
          border: none;
          background: none;
          color: #92400e;
          font-weight: 1000;
          cursor: pointer;
          padding: 0;
        }

        .home-link {
          color: #111827;
          text-decoration: none;
          font-weight: 1000;
        }

        .note-box {
          margin-top: 22px;
          background: rgba(255,255,255,0.70);
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 20px;
          padding: 16px;
          color: #475569;
          line-height: 1.7;
          font-size: 14px;
        }

        .note-box b {
          color: #111827;
        }

        .two-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .back-btn {
          width: 100%;
          border: none;
          border-radius: 18px;
          padding: 15px 18px;
          background: #e5e7eb;
          color: #111827;
          font-weight: 1000;
          cursor: pointer;
          margin-top: 12px;
        }

        .camera {
          width: 100%;
          height: 290px;
          background: #020617;
          border-radius: 24px;
          object-fit: cover;
          margin: 18px 0;
          box-shadow: 0 14px 34px rgba(15,23,42,.24);
        }

        .face-actions {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }

        .face-btn {
          border: none;
          border-radius: 16px;
          padding: 14px 16px;
          font-weight: 1000;
          cursor: pointer;
        }

        .verify {
          background: #16a34a;
          color: white;
        }

        .register-face {
          background: #f59e0b;
          color: #111827;
        }

        .camera-error {
          background: #fee2e2;
          color: #991b1b;
          padding: 12px;
          border-radius: 14px;
          font-weight: 800;
          margin-bottom: 12px;
        }

        @media(max-width: 950px) {
          .auth-shell {
            grid-template-columns: 1fr;
            min-height: auto;
          }

          .brand-panel {
            padding: 34px;
          }

          .brand-panel h1 {
            margin-top: 34px;
            font-size: 38px;
          }

          .form-panel {
            padding: 32px;
          }
        }

        @media(max-width: 560px) {
          .auth-page {
            padding: 14px;
          }

          .auth-shell {
            border-radius: 26px;
          }

          .brand-logo {
            font-size: 28px;
          }

          .brand-panel h1 {
            font-size: 32px;
          }

          .feature-grid,
          .two-grid {
            grid-template-columns: 1fr;
          }

          .form-panel h2 {
            font-size: 30px;
          }
        }
      `}</style>

      <div className="auth-page">
        <div className="auth-shell">
          <div className="brand-panel">
            <div>
              <div className="brand-logo">
                SARASKANA <span>STEEL</span>
              </div>

              <h1>Build Faster with STRIDE</h1>

              <p>
                Order cement, steel, pipes and construction materials with
                transparent billing, delivery tracking and digital invoices.
              </p>

              <div className="feature-grid">
                <div className="feature">🏗 Quality Materials</div>
                <div className="feature">🚚 Delivery Support</div>
                <div className="feature">🧾 Digital Bills</div>
                <div className="feature">🎁 Customer Rewards</div>
              </div>
            </div>
          </div>

          <div className="form-panel">
            {screen === "LOGIN" && (
              <>
                <h2>Login</h2>

                <p className="subtitle">
                  Customers can login using Customer ID or Mobile Number.
                </p>

                <form onSubmit={handleLogin}>
                  <div className="form-row">
                    <label>Login ID</label>
                    <input
                      className="input"
                      value={loginId}
                      onChange={(e) => setLoginId(e.target.value)}
                      placeholder="Customer ID / Mobile Number"
                    />
                  </div>

                  <div className="form-row">
                    <label>Password</label>
                    <input
                      className="input"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter password"
                    />
                  </div>

                  <button className="submit-btn" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="link-row">
                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setScreen("FORGOT")}
                  >
                    Forgot Password?
                  </button>

                  <button
                    type="button"
                    className="text-btn"
                    onClick={() => setScreen("REGISTER")}
                  >
                    Register Customer
                  </button>
                </div>

                <div className="note-box">
                  <b>Any difficulty with login or registration?</b>
                  <br />
                  Contact the management team of Saraskana Steel.
                </div>

                <div className="link-row">
                  <Link className="home-link" to="/home">
                    ← Back to Website
                  </Link>
                </div>
              </>
            )}

            {screen === "REGISTER" && (
              <>
                <h2>Customer Registration</h2>

                <p className="subtitle">
                  Create a customer account to start ordering materials online.
                </p>

                <form onSubmit={handleRegister}>
                  <div className="form-row">
                    <label>Full Name</label>
                    <input
                      className="input"
                      value={registerForm.name}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter full name"
                    />
                  </div>

                  <div className="two-grid">
                    <div className="form-row">
                      <label>Mobile Number</label>
                      <input
                        className="input"
                        value={registerForm.mobile}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            mobile: e.target.value,
                          })
                        }
                        placeholder="10 digit mobile"
                      />
                    </div>

                    <div className="form-row">
                      <label>Date of Birth</label>
                      <input
                        className="input"
                        type="date"
                        value={registerForm.dateOfBirth}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            dateOfBirth: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <label>Email Optional</label>
                    <input
                      className="input"
                      value={registerForm.email}
                      onChange={(e) =>
                        setRegisterForm({
                          ...registerForm,
                          email: e.target.value,
                        })
                      }
                      placeholder="Enter email if available"
                    />
                  </div>

                  <div className="two-grid">
                    <div className="form-row">
                      <label>Password</label>
                      <input
                        className="input"
                        type="password"
                        value={registerForm.password}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            password: e.target.value,
                          })
                        }
                        placeholder="Create password"
                      />
                    </div>

                    <div className="form-row">
                      <label>Confirm Password</label>
                      <input
                        className="input"
                        type="password"
                        value={registerForm.confirmPassword}
                        onChange={(e) =>
                          setRegisterForm({
                            ...registerForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <button className="submit-btn" disabled={loading}>
                    {loading ? "Registering..." : "Create Account"}
                  </button>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setScreen("LOGIN")}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {screen === "FORGOT" && (
              <>
                <h2>Reset Password</h2>

                <p className="subtitle">
                  Reset password using Customer ID or Mobile Number and Date of
                  Birth.
                </p>

                <form onSubmit={handleForgotPassword}>
                  <div className="form-row">
                    <label>Customer ID or Mobile Number</label>
                    <input
                      className="input"
                      value={forgotForm.loginId}
                      onChange={(e) =>
                        setForgotForm({
                          ...forgotForm,
                          loginId: e.target.value,
                        })
                      }
                      placeholder="Enter Customer ID or Mobile Number"
                    />
                  </div>

                  <div className="form-row">
                    <label>Date of Birth</label>
                    <input
                      className="input"
                      type="date"
                      value={forgotForm.dateOfBirth}
                      onChange={(e) =>
                        setForgotForm({
                          ...forgotForm,
                          dateOfBirth: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="two-grid">
                    <div className="form-row">
                      <label>New Password</label>
                      <input
                        className="input"
                        type="password"
                        value={forgotForm.newPassword}
                        onChange={(e) =>
                          setForgotForm({
                            ...forgotForm,
                            newPassword: e.target.value,
                          })
                        }
                        placeholder="New password"
                      />
                    </div>

                    <div className="form-row">
                      <label>Confirm Password</label>
                      <input
                        className="input"
                        type="password"
                        value={forgotForm.confirmPassword}
                        onChange={(e) =>
                          setForgotForm({
                            ...forgotForm,
                            confirmPassword: e.target.value,
                          })
                        }
                        placeholder="Confirm password"
                      />
                    </div>
                  </div>

                  <button className="submit-btn" disabled={loading}>
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>

                  <button
                    type="button"
                    className="back-btn"
                    onClick={() => setScreen("LOGIN")}
                  >
                    Back to Login
                  </button>
                </form>
              </>
            )}

            {screen === "FACE" && (
              <>
                <h2>Face Verification</h2>

                <p className="subtitle">
                  Admin password verified. Please complete face verification.
                </p>

                {cameraError && (
                  <div className="camera-error">{cameraError}</div>
                )}

                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="camera"
                />

                <div className="face-actions">
                  {adminHasFace ? (
                    <button
                      type="button"
                      className="face-btn verify"
                      onClick={verifyAdminFace}
                      disabled={loading}
                    >
                      {loading ? "Verifying..." : "Verify Face"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="face-btn register-face"
                      onClick={registerAdminFace}
                      disabled={loading}
                    >
                      {loading ? "Registering..." : "Register Face"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  className="back-btn"
                  onClick={() => {
                    stopCamera();
                    setScreen("LOGIN");
                    setPendingAdminToken("");
                    setPendingAdminUser(null);
                  }}
                >
                  Back to Login
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;