import { useState, useRef } from "react";
import { RotateCcw } from 'lucide-react';

const steps = [
  "Starting reload...",
  "Fetching data from source...",
  "Processing and splitting text...",
  "Creating embeddings...",
  "Inserting data chunks...",
  "Finalizing reload...",
];

const TOTAL_TIME_SECONDS = 600; 
const STEP_DURATION = Math.floor(TOTAL_TIME_SECONDS / steps.length); 

export default function ReloadButton() {
  const [reloadMsg, setReloadMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const intervalRef = useRef(null);

  const fetchURL = import.meta.env.VITE_FETCH_URL + "/reload-data";

  const handleReload = async () => {
    if (loading) return; 
    setReloadMsg();
    setLoading(true);
    setSecondsElapsed(0);

    intervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => {
        if (prev >= TOTAL_TIME_SECONDS) {
          clearInterval(intervalRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    try {
      const res = await fetch(fetchURL, { method: "POST" });
      const data = await res.json();
      setReloadMsg(data.message);
    } catch (err) {
      console.log(err);
      setReloadMsg("Reload failed.");
    } finally {
      setLoading(false);
      clearInterval(intervalRef.current);
    }
  };

  const currentStepIndex = Math.min(
    Math.floor(secondsElapsed / STEP_DURATION),
    steps.length - 1
  );

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div
      className={`reload-container ${loading ? "loading" : ""}`}
      onClick={handleReload}
      style={{ cursor: loading ? "default" : "pointer" }}
    >
       
      <h1 className="reload-title">
         <RotateCcw color="#2c8a4d"/> {loading ? "Reloading..." : "Reload Data"}
      </h1>
      {!loading && <p>Click here to reload scraped data</p>}

      {loading && (
        <>
          <p><strong>Note:</strong> This process may take up to 10 minutes.</p>
          <p className="reload-message">{reloadMsg}</p>
          <p>{steps[currentStepIndex]}</p>
          <p>Elapsed time: {formatTime(secondsElapsed)}</p>
          <div className="reload-bar">
            <div className="reload-bar-fill"></div>
          </div>
        </>
      )}

      {!loading && <p className="reload-message">{reloadMsg}</p>}
    </div>
  );
}
