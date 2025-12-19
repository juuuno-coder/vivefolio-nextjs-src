"use client";

import clsx from "clsx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInstagram, faFacebook, faTwitter, faYoutube } from "@fortawesome/free-brands-svg-icons";

export function Footer({ className }: { className?: string }) {
  return (
    <footer className={clsx("w-full py-8 border-t border-gray-100 bg-white mt-auto", className)}>
      <div className="max-w-[1800px] mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-sm text-gray-500 font-medium">
          © 2025 VIBEFOLIO. All rights reserved.
        </p>
        
        <div className="flex items-center gap-6">
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-pink-500 transition-colors"
          >
            <FontAwesomeIcon icon={faInstagram} className="w-5 h-5" />
          </a>
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-blue-600 transition-colors"
          >
            <FontAwesomeIcon icon={faFacebook} className="w-5 h-5" />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-sky-500 transition-colors"
          >
            <FontAwesomeIcon icon={faTwitter} className="w-5 h-5" />
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-gray-400 hover:text-red-500 transition-colors"
          >
            <FontAwesomeIcon icon={faYoutube} className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
