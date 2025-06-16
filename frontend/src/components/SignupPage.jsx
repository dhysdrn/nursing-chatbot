/**
 * @description
 * SignupPage component handles the user registration process for admin creation.
 * It verifies backend DB status to redirect existing users,
 * collects user credentials, and submits them to create a new admin account.
 * Includes feedback messaging and redirects upon success.
 * @version 1.0
 */
import { useState } from "react";
import axios from "axios";
import { Link, Navigate } from "react-router-dom";

/**
 * @function SignupPage
 * @description
 * Renders the signup form allowing creation of a new admin user.
 * Checks if a user exists in the backend database and redirects accordingly.
 * Handles form submission with validation and communicates with backend endpoints.
 *
 * @returns {JSX.Element} The SignupPage component with form and messaging.
 */
const SignupPage = () => {
  const [username, setUser] = useState("");
  const [password, setPass] = useState("");
  const [password2, setPass2] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [firstTime, setFirstTime] = useState(null);
  
  let fetchURL = import.meta.env.VITE_FETCH_URL;
  const dbFetchURL = fetchURL + "/db-check";
  fetchURL = fetchURL + "/create-user";

  /**
   * @function checkDB
   * @description
   * Checks with the backend if the user database exists or not.
   * Sets firstTime state to true if no users exist (new setup),
   * false otherwise.
   */
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

  // If no token, check if this is the first time signup page visit
  if (!localStorage.token) {
    checkDB();
    if (firstTime == false) {
      return <Navigate to="/admin" />
    }
  }

  
 /**
   * @function handleSubmit
   * @param {React.FormEvent} e - Form submission event
   * @description
   * Handles the submission of the signup form.
   * Validates input, sends user credentials to the backend,
   * and sets response messages or localStorage flag on success.
   */
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
    <div className="create-user-container">
      <h2>Create Admin</h2>

      {responseMessage && (
        <div className="alert">
          <p>{responseMessage}</p>
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

        <div className="form-group">
          <input
            id="password2"
            type="password"
            placeholder="Type Password Again"
            value={password2}
            onChange={(e) => setPass2(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-button">Submit</button>
      </form>

      {firstTime && (
        <div className="login-redirect">
          Already have a user? <Link to="/login"><button className="login-button">Login Page</button></Link>
        </div>
      )}
    </div>
  );
};

export default SignupPage;
