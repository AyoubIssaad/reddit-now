import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import ThemeToggle from "../features/ThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container max-w-7xl mx-auto">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/live-black-256.png"
                alt="Reddit-Now Logo"
                className="h-8 w-8 dark:invert"
              />
              <div className="flex flex-col">
                <h1 className="text-lg font-display font-bold text-foreground">
                  Reddit-Now
                </h1>
                <span className="text-xs text-muted-foreground">
                  Live Reddit Experience
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <a
              href="https://github.com/ayoubissaad/reddit-now"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-lg hover:bg-accent"
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
