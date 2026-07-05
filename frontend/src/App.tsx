import { useState } from "react";
import axios from "axios";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
 
  const login = async () => {
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      localStorage.setItem("token", res.data.data.token);

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.data.user)
      );

      alert("Login Successful!");
      window.location.href = "/dashboard";
    
    } catch (error) {
      alert("Login Failed");
      console.error(error);
    }
  };
 

  return (
    <div
      style={{
        maxWidth: "400px",
        margin: "50px auto",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
      }}
    >
      <h1>STRIDE Login</h1>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) =>
          setEmail(e.target.value)
        }
      />

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={login}>
        Login
      </button>
    </div>
  );
}

export default App;