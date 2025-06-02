import { useEffect, useState } from 'react';
import axios from 'axios';

const fetchURL = import.meta.env.VITE_FETCH_URL + "/api/links";

const isValidURL = (string) => {
  const pattern = new RegExp(
    '^https?:\\/\\/' +                  // protocol http or https
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' +   // OR ip (v4) address
    '(\\:\\d+)?' +                     // optional port
    '(\\/[-a-z\\d%@_.~+&:]*)*' +       // path
    '(\\?[;&a-z\\d%@_.,~+&:=-]*)?' +   // query string
    '(\\#[-a-z\\d_]*)?$','i'           // fragment locator
  );
  return !!pattern.test(string);
};

const LinkManager = () => {
  const [links, setLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');

  const fetchLinks = async () => {
    try {
      const res = await axios.get(fetchURL);
      if (res.data && Array.isArray(res.data.links)) {
        setLinks(res.data.links);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Failed to fetch links:', err);
      setStatus('Failed to load links.');
      setLinks([]);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const addLink = async () => {
  const trimmedLink = newLink.trim();
  if (!trimmedLink) return;

  if (!isValidURL(trimmedLink)) {
    setStatus('Invalid URL format.');
    return;
  }

  try {
    await axios.post(fetchURL, { link: trimmedLink });
    setNewLink('');
    fetchLinks();
    setStatus('Link added.');
  } catch (err) {
    console.error('Add link failed:', err);
    setStatus(err.response?.data?.message || 'Failed to add.');
  }
 };


  const deleteLink = async (link) => {
    try {
      await axios.delete(fetchURL, { data: { link } });
      fetchLinks();
      setStatus('Link removed.');
    } catch (err) {
      console.error('Delete link failed:', err);
      setStatus('Failed to remove.');
    }
  };

  const filteredLinks = links.filter(link =>
    link.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="link-manager-container">
      <div className="input-row">
        <input
          type="text"
          value={newLink}
          onChange={(e) => setNewLink(e.target.value)}
          className="input"
        />
        <button onClick={addLink} className="add-button">Add</button>
      </div>

      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar"
        placeholder="Search links..."
      />

      <ul className="link-list">
        {filteredLinks.map((link, idx) => (
          <li key={idx} className="link-item">
            <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="link-text"
            >
            {link}
            </a>
            <button
            onClick={() => {
                if (window.confirm('Are you sure you want to remove this link?')) {
                deleteLink(link);
                }
            }}
            className="remove-button"
            >
                Remove
            </button>

          </li>
        ))}
      </ul>

      {status && <p className="status-message">{status}</p>}
    </div>
  );
};

export default LinkManager;
