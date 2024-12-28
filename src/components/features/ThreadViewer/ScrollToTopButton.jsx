import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { ChevronUp } from "lucide-react";

const ScrollToTopButton = () => {
  const [isVisible, setIsVisible] = useState(false);

  // Add scroll event listener with throttling
  useEffect(() => {
    const checkScroll = () => {
      // Show button when user scrolls down 400px
      const shouldShow = window.scrollY > 400;
      setIsVisible(shouldShow);
    };

    // Throttle scroll event to improve performance
    let timeoutId;
    const throttledCheck = () => {
      if (timeoutId) return;

      timeoutId = setTimeout(() => {
        checkScroll();
        timeoutId = null;
      }, 100);
    };

    window.addEventListener("scroll", throttledCheck);
    return () => {
      window.removeEventListener("scroll", throttledCheck);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (!isVisible) return null;

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-4 right-4 shadow-lg transition-opacity duration-200 z-50 bg-primary/90 hover:bg-primary backdrop-blur-sm"
      title="Scroll to top"
    >
      <ChevronUp className="h-4 w-4" />
    </Button>
  );
};

export default ScrollToTopButton;
