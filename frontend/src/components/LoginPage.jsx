import { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";

const LoginPage = () => {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [message, setMessage] = useState(null);
  const [firstTime, setFirstTime] = useState(null);

  let fetchURL = import.meta.env.VITE_FETCH_URL;
  const dbFetchURL = fetchURL + "/db-check";
  const loginFetchURL = fetchURL + "/user-login";

  // Remove the state given from /signup route
  localStorage.removeItem("signedup")

  const checkDB = async () => {
    try {
      const dbResponse = await axios.post(dbFetchURL);
      if (dbResponse.status == 202) {
        setFirstTime(true);
      }
    } catch (error) {
      console.log(`There was an error: ${error}`);
      setMessage(`Connection to backend failed. Please try again.`);
    }
  }
  
  checkDB();

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Checks if user and password is provided
    if (!username || !password) {
        setMessage("Please provide both username and password.");
      return;
    }

    try {
      
      // Attempts to ask backend for validation
      const dbResponse = await axios.post(loginFetchURL, {
        username,
        password
      });


      // Displays what the backend has to say
      setMessage(dbResponse.data.message);

      if (dbResponse.status == 201) {
        // Successfully logs in and saves token
        localStorage.setItem("token", dbResponse.data.token)
      }

    } catch (error) {
      console.error("Error logging in:", error);
      setMessage(`Error logging in. Please try again.`);
    }
  };

  // If the user logged in, redirect them do /admin route
  if (localStorage.token) {
    return <Navigate to="/admin" />
  }

  return (
   <div className="create-user-container">
      <h2>Login</h2>

      {message && (
        <div className="alert">
          <p>{message}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="create-user-form">
        <div className="form-group">
          <input
            id="username"
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <input
            id="password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">
          Submit
        </button>
      </form>

      {firstTime && (
        <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
          Database is empty. Want to create the first user?{" "}
          <Link to="/signup">
            <button className="submit-button" style={{ padding: "0.4rem 1rem", fontSize: "0.9rem" }}>
              Signup Page
            </button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default LoginPage;