"use client";
import React from "react";

const Emails: React.FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Email Notifications</h2>
      <p>This section will display all outgoing emails, templates, and logs.</p>
      {/* You can later add table of sent emails, search, filters, resend buttons, etc. */}
    </div>
  );
};

export default Emails;
