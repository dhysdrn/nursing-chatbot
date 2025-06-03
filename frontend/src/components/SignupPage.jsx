import { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";


const SignupPage = () => {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [password2, setPass2] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [firstTime, setFirstTime] = useState(null);
  
  let fetchURL = import.meta.env.VITE_FETCH_URL;
  const dbFetchURL = fetchURL + "/db-check";
  fetchURL = fetchURL + "/create-user";

  const checkDB = async () => {
    try {
      const dbResponse = await axios.post(dbFetchURL);
      if (dbResponse.status == 202) {
        setFirstTime(true);
      } else {
        setFirstTime(false);
      }
    } catch (error) {
      console.log(`There was an error: ${error}`);
      setResponseMessage(`Connection to backend failed. Please try again.`);
    }
  }

  // Checks if the user is logged in
  if (!localStorage.token) {
    checkDB();
    // Checks if it's the user's first time to the signup page
    if (firstTime == false) {
      return <Navigate to="/admin" />
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Checks if user and passwords are provided
    if (!username || !password || !password2) {
      setResponseMessage("Please provide the username and passwords.");
      return;
    }

    try {

      // Attempts to ask backend for validation
      const response = await axios.post(fetchURL, {
        username,
        password, 
        password2
      });
    
      // Display the message returned from the backend
      setResponseMessage(response.data.message); 

      if (response.status == 201) {
        // Successfully signs up
        localStorage.setItem("signedup", true)
      }

    } catch (error) {
      console.error("Error creating user:", error);
      setResponseMessage(`Error creating user. Please try again. ${error}`);
    }
  };

  // If the user logged in, redirect them do /login route
  if (localStorage.signedup) {
    return <Navigate to="/login" />
  }

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Create Admin</h2>
      {responseMessage &&
          <div className="alert">
            <p>{responseMessage}</p>
          </div>
        }
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="username">Username:</label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUser(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPass(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="password2">Type Password Again:</label>
          <input
            id="password2"
            type="password"
            value={password2}
            onChange={(e) => setPass2(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {firstTime &&
        <div>Already have a user? <Link to="/login"><button>Login Page</button></Link></div>
      }
    </div>
  );
};

export default SignupPage;
