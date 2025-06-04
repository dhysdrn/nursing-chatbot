import { useEffect, useState, useCallback, useMemo } from "react";
import axios from "axios";

const AdminTable = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editingId, setEditingId] = useState(null);
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");

  const fetchURL = useMemo(() => {
    return `${import.meta.env.VITE_FETCH_URL}`;
  }, []);


  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${fetchURL}/users`);
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

  //TODO: change this to use emails
  const handleDelete = async (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this entry?");
    if (!confirmed) return;

    try {
      await axios.delete(`${fetchURL}/users/${id}`);
      fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete entry.");
    }
  };

  const startEditing = (item) => {
    setEditingId(item._id);
    setEditUsername(item.username);
    setEditPassword(item.password);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditUsername("");
    setEditPassword("");
  };

  const saveEdit = async () => {
    if (!editUsername.trim() || !editPassword.trim()) {
      alert("Username and Password cannot be empty.");
      return;
    }

    try {
      await axios.put(`${fetchURL}/users/${editingId}`, {
        username: editUsername,
        password: editPassword,
      });
      setEditingId(null);
      fetchData();
    } catch (err) {
      console.error("Update error:", err);
      alert("Failed to update entry.");
    }
  };

  return (
    <div className="vector-table-container">
      <h2>Admin Database</h2>
      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}
      <div className="vector-table">
        <table>
          <thead>
            <tr>
              <th>Username</th>
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
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                      />
                    ) : (
                      item.username
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
    </div>
  );
};

export default AdminTable;
