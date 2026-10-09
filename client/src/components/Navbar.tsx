import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiMoon, FiSun } from "react-icons/fi";
import "./Navbar.css";

interface SliderToggleProps {
  selected: "light" | "dark";
  setSelected: (val: "light" | "dark") => void;
}

const SliderToggle = ({ selected, setSelected }: SliderToggleProps) => {
  return (
    <div className="theme-toggle-wrapper" role="radiogroup" aria-label="Theme toggle">
      <button
        className={`theme-toggle-button ${selected === "light" ? "selected" : ""}`}
        onClick={() => setSelected("light")}
        aria-pressed={selected === "light"}
      >
        <FiSun className="icon" />
        Light
      </button>
      <button
        className={`theme-toggle-button ${selected === "dark" ? "selected" : ""}`}
        onClick={() => setSelected("dark")}
        aria-pressed={selected === "dark"}
      >
        <FiMoon className="icon" />
        Dark
      </button>
      <div className={`theme-slider ${selected === "dark" ? "right" : "left"}`} />
    </div>
  );
};

const Navbar = () => {
  const location = useLocation();
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    const saved = localStorage.getItem("theme");
    return saved === "dark" ? "dark" : "light";
  });

  useEffect(() => {
    document.body.className = theme === "dark" ? "dark" : "";
    localStorage.setItem("theme", theme);
  }, [theme]);

  const tabs = [
    { label: "Home", to: "/" },
    { label: "DailyByte", to: "/dailybyte" },
    { label: "Trending", to: "/trending" },
    { label: "Contact", to: "/contact" },
  ];

  return (
    <header className="navbar fade-in">
      <div className="navbar-inner">
        <h1 className="nav-title">THE DAILY BYTES</h1>

        <nav className="nav-tabs">
          {tabs.map((tab) => (
            <Link
              key={tab.label}
              to={tab.to}
              className={`nav-link ${location.pathname === tab.to ? "active" : ""}`}
            >
              {tab.label.toUpperCase()}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <SliderToggle selected={theme} setSelected={setTheme} />
        </div>
      </div>
    </header>
  );
};

export default Navbar;
