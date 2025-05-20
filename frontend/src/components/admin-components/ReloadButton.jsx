import { useState } from "react";

export default function ReloadButton() {
  const [reloadMsg, setReloadMsg] = useState("");

  let fetchURL = import.meta.env.VITE_FETCH_URL + "/reload-data";

  const handleReload = async () => {
    setReloadMsg("Reloading data...");
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
  };

  return (
    <div>
      <button onClick={handleReload} style={{ padding: 8 }}>
        Reload Scraped Data
      </button>
      <p>{reloadMsg}</p>
    </div>
  );
}
