import { useState, useEffect } from "react";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie_consent");
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookie_consent", "accepted");
    setShowBanner(false);
  };

  if (!showBanner) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-800 text-white p-4 flex flex-col md:flex-row items-center justify-between shadow-lg z-50">
      <p className="text-sm text-center md:text-left mb-2 md:mb-0">
        Usamos cookies para melhorar sua experiência. Ao continuar, você concorda com o uso de cookies.
        <a href="/privacy" className="text-blue-400 hover:underline ml-1">
          Saiba mais
        </a>
        .
      </p>
      <button
        onClick={handleAccept}
        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-4 rounded transition duration-300 ease-in-out"
      >
        Aceitar Cookies
      </button>
    </div>
  );
}