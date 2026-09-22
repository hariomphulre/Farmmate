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
    top: "1px",
    right: "1px",
    zIndex: 70,
    height: "auto",
    weight: "300px",
    backgroundColor: "white",
    padding: "1px",
    borderRadius: "4px",
    boxShadow: "0 0px 0px rgba(0,0,0,0.2)",
  };

  return <div id="google_translate_element" style={style}></div>;
};

export default TranslateComponent;
