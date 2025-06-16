/**
 * @description
 * ThemeToggle component allows users to switch between light and dark modes.
 * It respects the user's saved preference from localStorage or system settings
 * on initial load, and toggles the 'dark' class on the document root accordingly.
 * @version 1.0
 */
import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

/**
 * @function ThemeToggle
 * @description
 * Renders a button that toggles the application theme between light and dark modes.
 * Persists the user's preference in localStorage and updates the document class.
 *
 * @returns {JSX.Element} A button component that toggles theme and displays an icon.
 */
const ThemeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user has a preference already saved
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  /**
   * @function toggleTheme
   * @description
   * Toggles the theme state between dark and light modes,
   * updates the document's classList, and saves preference in localStorage.
   */
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <button 
      onClick={toggleTheme}
      className="theme-toggle nav-button"
      aria-label="Toggle theme"
    >
      {isDarkMode ? (
        <Sun className="h-5 w-5" />
      ) : (
        <Moon className="h-5 w-5" />
      )}
    </button>
  );
};

export default ThemeToggle;
