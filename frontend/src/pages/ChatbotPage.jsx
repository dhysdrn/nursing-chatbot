import { useState } from "react";
import axios from "axios";

const DataForm = () => {
  const [heading, setHeading] = useState("");
  const [text, setText] = useState("");
  const [responseMessage, setResponseMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!heading || !text) {
      setResponseMessage("Please provide both heading and text.");
      return;
    }

    try {
      // Update the URL to '/admin-data'
      const response = await axios.post("http://localhost:5002/admin-data", {
        heading,
        content: text,
      });

      setResponseMessage(response.data.message); // Display the message returned from the backend
    } catch (error) {
      console.error("Error posting data:", error);
      setResponseMessage("Error adding data. Please try again.");
    }
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "600px", margin: "0 auto" }}>
      <h2>Add Data</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="heading">Heading:</label>
          <input
            id="heading"
            type="text"
            value={heading}
            onChange={(e) => setHeading(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            required
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="text">Text:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            style={{ width: "100%", padding: "0.5rem", marginTop: "0.5rem" }}
            rows={6}
            required
          />
        </div>
        <button type="submit">Submit</button>
      </form>

      {responseMessage && <p style={{ marginTop: "1rem" }}>{responseMessage}</p>}
    </div>
  );
};

export default DataForm;
