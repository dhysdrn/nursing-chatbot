import { useState } from "react";
import axios from "axios";

const DataForm = () => {
  const [category, setCategory] = useState("");
  const [text, setText] = useState("");
  const [responseMessage, setResponseMessage] = useState("");
  const [error, setError] = useState("");

  let fetchURL = import.meta.env.VITE_FETCH_URL + "/admin-data";

  const minLength = 50;
  const isFormValid = category.trim() && text.trim().length >= minLength;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isFormValid) {
      setError("Please fill out all fields with valid content.");
      setResponseMessage("");
      return;
    }

    setError("");
    try {
      const response = await axios.post(fetchURL, {
        heading: category,
        content: text,
      });

      setResponseMessage(response.data.message);
      setCategory("");
      setText("");
    } catch (error) {
      console.error("Error posting data:", error);

      if (error.response && error.response.data && error.response.data.message) {
        setResponseMessage(error.response.data.message);
      } else {
        setResponseMessage("Error adding data. Please try again.");
      }
    }
  };

  return (
    <div className="data-form-container">
      <h1>Add a New FAQ Entry</h1>
      <h3>Instructions:</h3>
      <p>
        Use this form to add a new entry to the nursing chatbot database.
        <br />
        <strong>Important:</strong> The search system relies on the content you provide in the detailed answer field.
        <br />
        Please make sure the content field contains a comprehensive and clear explanation or information that the AI can retrieve.
        <br />
        The category/topic field is for organizing entries and will <em>not</em> be searchable by the AI.
      </p>

      <form onSubmit={handleSubmit} noValidate>
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="category" className="data-form-label">
            Category / Topic
          </label>
          <input
            id="category"
            type="text"
            placeholder="E.g. Admission, Program Requirements, Financial Aid"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="data-form-input"
            required
          />
        </div>

        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="text" className="data-form-label">
            Detailed Answer / Content
          </label>
          <textarea
            id="text"
            placeholder="Provide a detailed explanation or information here. This will be used by the AI to find relevant answers."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="data-form-textarea"
            rows={8}
            required
          />
          <p className={`char-count ${text.length < minLength ? "invalid" : "valid"}`}>
            {text.length} / {minLength} characters
          </p>
        </div>

        <button
          type="submit"
          disabled={!isFormValid}
          className={`data-form-button ${isFormValid ? "enabled" : ""}`}
        >
          Submit
        </button>
      </form>

      {error && <p className="error-message">{error}</p>}
      {responseMessage && !error && <p className="success-message">{responseMessage}</p>}
    </div>
  );
};

export default DataForm;
