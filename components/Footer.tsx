import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-300 py-6 mt-8 border-t border-gray-800">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-lg">Nexus Help Desk</span>
          <span className="hidden md:inline-block text-xs text-gray-500">
            © {new Date().getFullYear()}
          </span>
        </div>
        <div className="flex space-x-4 mt-2 md:mt-0">
          <a href="/legal" className="hover:underline text-sm">
            Mentions légales
          </a>
          <a href="/contact" className="hover:underline text-sm">
            Contact
          </a>
          <a href="/user-manual" className="hover:underline text-sm">
            Manuel utilisateur
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
