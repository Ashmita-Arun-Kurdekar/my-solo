import { useState } from "react";
import API from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    phone: "",
    designation: "",
    role_id: 3,
    department_id: 1,
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
      const response = await API.post("/auth/register", formData);

      alert(response.data.message);

      console.log(response.data);

    } catch (error) {
      alert(error.response?.data?.message || "Registration Failed");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow mx-auto" style={{ maxWidth: "500px" }}>
        <h2 className="text-center mb-4">Register</h2>

        <form onSubmit={handleSubmit}>

          <input
            className="form-control mb-3"
            type="text"
            name="full_name"
            placeholder="Full Name"
            onChange={handleChange}
          />

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

          <input
            className="form-control mb-3"
            type="text"
            name="phone"
            placeholder="Phone"
            onChange={handleChange}
          />

          <input
            className="form-control mb-3"
            type="text"
            name="designation"
            placeholder="Designation"
            onChange={handleChange}
          />

          <button className="btn btn-success w-100">
            Register
          </button>

        </form>
      </div>
    </div>
  );
}

export default Register;