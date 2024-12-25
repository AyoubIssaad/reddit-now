import React from "react";
import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import ThemeToggle from "../features/ThemeToggle";

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-14 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-foreground">Reddit-Now</h1>
              <span className="text-sm text-muted-foreground">
                Live Reddit Experience
              </span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <a
              href="https://github.com/ayoubissaad/reddit-now"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
