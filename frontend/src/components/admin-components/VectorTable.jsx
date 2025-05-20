import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const VectorTable = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editHeading, setEditHeading] = useState("");
  const [editText, setEditText] = useState("");

  const fetchURL = useMemo(() => {
    return `${import.meta.env.VITE_FETCH_URL}`;
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${fetchURL}/documents`);
      setData(response.data || []);
      setError(null);
    } catch (err) {
      console.error("Error fetching from server:", err);
      setError(err.message || "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  }, [fetchURL]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    try {
      await axios.delete(`${fetchURL}/admin-data/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete entry.");
    }
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditHeading(item.heading);
    setEditText(item.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditHeading("");
    setEditText("");
  };

  const saveEdit = async () => {
    if (!editHeading.trim() || !editText.trim()) {
      alert("Heading and Text cannot be empty.");
      return;
    }

    try {
      await axios.put(`${fetchURL}/admin-data/${editingId}`, {
        heading: editHeading,
        content: editText,
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update entry.");
    }
  };

  return (
    <div className="vector-table">
      <h2>Vector Database Table</h2>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <table>
        <thead>
          <tr>
            <th>Category / Topic</th>
            <th>Content</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item) => (
              <tr key={item._id}>
                <td>
                  {editingId === item._id ? (
                    <input
                      type="text"
                      value={editHeading}
                      onChange={(e) => setEditHeading(e.target.value)}
                    />
                  ) : (
                    item.heading
                  )}
                </td>
                <td>
                  {editingId === item._id ? (
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows={4}
                    />
                  ) : (
                    item.text
                  )}
                </td>
                <td className="actions">
                  {editingId === item._id ? (
                    <>
                      <button onClick={saveEdit}>Save</button>
                      <button onClick={cancelEditing}>Cancel</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => startEditing(item)}>Edit</button>
                      <button onClick={() => handleDelete(item._id)}>Delete</button>
                    </>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" style={{ textAlign: "center", padding: "8px" }}>
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default VectorTable;
