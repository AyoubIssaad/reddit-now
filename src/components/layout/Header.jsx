import React, { useEffect, useState } from "react";
import { Github, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/utils/classNames";

const Header = () => {
  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light")
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((current) => (current === "light" ? "dark" : "light"));
  };

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.location.href = "/";
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full border-b",
        "bg-background/95 backdrop-blur",
        "supports-[backdrop-filter]:bg-background/60",
      )}
    >
      <div className="container max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Title */}
          <button
            onClick={handleLogoClick}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/live-black-256.png"
              alt="Reddit-Now"
              className="h-8 w-8 dark:invert"
            />
            <div>
              <h1 className="text-lg font-bold text-left">Reddit-Now</h1>
              <span className="text-xs text-muted-foreground">
                Live Reddit Experience
              </span>
            </div>
          </button>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="w-9 h-9 rounded-md"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4" />
              )}
            </Button>

            <a
              href="https://github.com/ayoubissaad/reddit-now"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "text-muted-foreground hover:text-foreground",
                "transition-colors p-2 rounded-lg hover:bg-accent",
              )}
            >
              <Github className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
