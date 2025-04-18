import { Facebook, Instagram, Twitter } from "lucide-react";

const Footer = () => {
  return (
    <footer className="w-full bg-gray-100 py-6 mt-10">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
        <p className="text-gray-600 text-sm">© 2025 Tugon. All rights reserved.</p>
        <div className="flex space-x-4">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-indigo-600 transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-pink-500 transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-600 hover:text-blue-400 transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
