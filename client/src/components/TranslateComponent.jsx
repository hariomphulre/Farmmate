import React, { useEffect } from "react";

const TranslateComponent = () => {
  useEffect(() => {
    const loadTranslateScript = () => {
      if (!document.querySelector('script[src*="translate.google.com"]')) {
        // Add the Google Translate initialization function
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement(
            {
              pageLanguage: "en",
              includedLanguages: "en,hi,mr,gu,ta,te,kn,ml", // Common Indian languages
              layout:
                window.google.translate.TranslateElement.InlineLayout.HORIZONTAL,
              autoDisplay: true,
            },
            "google_translate_element"
          );
        };

        // Create and append the Google Translate script
        const addScript = document.createElement("script");
        addScript.setAttribute("async", "");
        addScript.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        document.body.appendChild(addScript);
      }
    };

    loadTranslateScript();
  }, []);

  const style = {
    position: "fixed",
    bottom: "24px",
    left: "24px",
    zIndex: 9999,
    height: "auto",
    minWidth: "150px",
    backgroundColor: "white",
    padding: "6px 8px",
    borderRadius: "8px",
    boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
    border: "1px solid #e2e8f0",
  };

  return <div id="google_translate_element" style={style}></div>;
};

export default TranslateComponent;
