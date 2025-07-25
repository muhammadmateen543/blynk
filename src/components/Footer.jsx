import { Instagram, Facebook, Mail } from "lucide-react";

function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 text-center text-sm text-gray-600">
      <div className="flex flex-col items-center gap-3">
        <div className="flex gap-5 text-gray-500">
          {/* Instagram */}
          <a
            href="https://www.instagram.com/blynk_cases/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-pink-600 transition"
          >
            <Instagram size={20} />
          </a>

          {/* Facebook */}
          <a
            href="https://www.facebook.com/profile.php?id=61578359201977"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600 transition"
          >
            <Facebook size={20} />
          </a>

          {/* Gmail */}
          <a
            href="mailto:blynkshop.pk@gmail.com"
            className="hover:text-red-500 transition"
          >
            <Mail size={20} />
          </a>
        </div>

        <div className="text-xs text-gray-500">
          &copy; 2025 Blynk. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;
