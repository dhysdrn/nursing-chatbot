import { useEffect, useState, useMemo } from "react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import axios from "axios";

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
        setError("Could not fetch timestamp.");
      }
    };

    fetchLastScraped();
  }, [fetchURL]);

  dayjs.extend(relativeTime);
  return (
    <div style={{ marginBottom: "1rem" }}>
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : lastScraped ? (
        <p>
            <strong>Last Scraped:</strong>{" "}
            {dayjs(lastScraped).fromNow()} (
            {dayjs(lastScraped).format("MMM D, YYYY, h:mm A")}
            )
        </p>
      ) : (
        <p>Loading last scraped time...</p>
      )}
    </div>
  );
};

export default TimeStamp;
