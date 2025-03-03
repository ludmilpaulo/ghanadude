import { useState } from "react";
import AboutUs from "./AboutUs";
import WhyChooseUs from "./WhyChooseUs";
import Teams from "./Teams";
import Contacts from "./Contacts";

const SiteInfo = () => {
  const [activeSection, setActiveSection] = useState("aboutus");

  const renderSection = () => {
    switch (activeSection) {
      case "aboutus":
        return <AboutUs />;
      case "whychooseus":
        return <WhyChooseUs />;
      case "teams":
        return <Teams />;
      case "contacts":
        return <Contacts />;
      default:
        return <AboutUs />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div className="w-full max-w-4xl mb-8">
        <nav className="flex justify-around bg-white p-4 rounded shadow-md">
          <button
            onClick={() => setActiveSection("aboutus")}
            className="font-bold text-lg"
          >
            About Us
          </button>
          <button
            onClick={() => setActiveSection("whychooseus")}
            className="font-bold text-lg"
          >
            Why Choose Us
          </button>
          <button
            onClick={() => setActiveSection("teams")}
            className="font-bold text-lg"
          >
            Teams
          </button>
          <button
            onClick={() => setActiveSection("contacts")}
            className="font-bold text-lg"
          >
            Contacts
          </button>
        </nav>
      </div>
      <div className="w-full max-w-4xl p-4 bg-white rounded shadow-md">
        {renderSection()}
      </div>
    </div>
  );
};

export default SiteInfo;
