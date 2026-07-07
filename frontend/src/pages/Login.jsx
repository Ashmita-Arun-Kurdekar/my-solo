import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function Login() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {

      const response = await API.post("/auth/login", formData);

      localStorage.setItem("token", response.data.token);

      localStorage.setItem(
        "employee",
        JSON.stringify(response.data.employee)
      );

      alert("Login Successful");

      navigate("/dashboard");

    } catch (error) {

      alert(error.response?.data?.message || "Login Failed");

    }
  };

  return (
    <div className="container mt-5">

      <div className="card p-4 shadow mx-auto" style={{ maxWidth: "500px" }}>

        <h2 className="text-center mb-4">Login</h2>

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            type="email"
            name="email"
            placeholder="Email"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
          />

          <button className="btn btn-primary w-100">
            Login
          </button>

        </form>

      </div>

    </div>
  );
}

export default Login;