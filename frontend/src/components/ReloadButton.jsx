import { useState } from "react";

export default function ReloadButton() {
  const [reloadMsg, setReloadMsg] = useState("");
  const [loading, setLoading] = useState(false);

  let fetchURL = import.meta.env.VITE_FETCH_URL;
  fetchURL = fetchURL + "/reload-data";

  const handleReload = async () => {
    setReloadMsg("Reloading data...");
    setLoading(true);
    try {
      const res = await fetch(fetchURL, {
        method: "POST",
      });
      const data = await res.json();
      setReloadMsg(data.message);
    } catch (err) {
        console.log(err)
      setReloadMsg("Reload failed.");
    }
    finally {
      setLoading(false);
    }
  };

  return (
    <div className="reload-container">
      <button onClick={handleReload} className="reload-button">
        Reload Data
      </button>

      {loading && (
        <div className="reload-bar">
          <div className="reload-bar-fill"></div>
        </div>
      )}

      <p>{reloadMsg}</p>
    </div>
  );
}
