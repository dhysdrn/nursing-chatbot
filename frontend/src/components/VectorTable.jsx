import { useEffect, useState } from "react";
import axios from "axios";

const VectorTable = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  let fetchURL = import.meta.env.VITE_FETCH_URL;
  fetchURL = fetchURL + "/documents";

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axios.get(fetchURL);
        setData(response.data);
      } catch (err) {
        console.error("Error fetching from server:", err);
        setError(err.message || "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="vector-table" style={{ padding: "1rem" }}>
      <h2>Vector Database Table</h2>

      {loading && <p>Loading data...</p>}
      {error && <p style={{ color: "red" }}>Error: {error}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Heading</th>
            <th style={{ border: "1px solid #ccc", padding: "8px" }}>Text</th>
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((item, index) => (
              <tr key={index}>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {item.heading}
                </td>
                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                  {item.text}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="2" style={{ padding: "8px", textAlign: "center" }}>
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
