/**
 * @description
 * TimeStamp component fetches and displays the "last scraped" timestamp from the backend.
 * It shows a relative time (e.g., "3 hours ago") and the formatted absolute date/time.
 * Handles error states when fetching fails or no database is connected.
 * @version 1.0
 */
import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";

/**
 * @function TimeStamp
 * @description
 * Fetches the last scraped timestamp from an API endpoint and displays it in relative and formatted form.
 * Shows loading and error messages appropriately.
 * 
 * @returns {JSX.Element} The TimeStamp component.
 */
const TimeStamp = () => {
  const [lastScraped, setLastScraped] = useState(null);
  const [error, setError] = useState(null);

  const fetchURL = useMemo(() => {
    return `${import.meta.env.VITE_FETCH_URL}/last-scraped`;
  }, []);

  useEffect(() => {
    const fetchLastScraped = async () => {
      try {
        const res = await axios.get(fetchURL);
        setLastScraped(res.data.lastScraped);
      } catch (err) {
        console.error("Failed to fetch last scraped timestamp:", err);
        if (err.response?.status === 404 || err.code === "ECONNREFUSED" || err.message.includes("Network")) {
          setError("No database connected.");
        } else {
          setError("Could not fetch timestamp.");
        }
      }
    };

    fetchLastScraped();
  }, [fetchURL]);

  dayjs.extend(relativeTime);

  return (
    <div className="timestamp-container">
      <h3 className="timestamp-header">Last Scraped</h3>
      <div className="timestamp-content">
        {error ? (
          <p className="timestamp-error">{error}</p>
        ) : lastScraped ? (
          <p>
            {dayjs(lastScraped).fromNow()} (
            {dayjs(lastScraped).format("MMM D, YYYY, h:mm A")}
            )
          </p>
        ) : (
          <p>Loading last scraped time...</p>
        )}
      </div>
    </div>
  );
};

export default TimeStamp;
