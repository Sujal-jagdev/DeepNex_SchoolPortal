import { Link } from 'react-router-dom';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaTwitter, FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-primary text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center">
              <img src="/src/assets/logo2.png" alt="EduNex Logo" className="h-10 w-auto mr-2" />
              <span className="text-2xl font-bold text-white font-display">Edu<span className="text-bright-green">Nex</span></span>
            </Link>
            <p className="mt-4 text-gray-300 font-body">
              Transforming education through innovative technology and personalized learning experiences.
            </p>
            <div className="mt-6 flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-bright-green transition-colors">
                <FaTwitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-bright-green transition-colors">
                <FaFacebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-bright-green transition-colors">
                <FaInstagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-bright-green transition-colors">
                <FaLinkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-display">Quick Links</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Link to="/" className="text-gray-300 hover:text-bright-green transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-bright-green transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-gray-300 hover:text-bright-green transition-colors">
                  Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-display">Resources</h3>
            <ul className="space-y-2 font-body">
              <li>
                <Link to="/blog" className="text-gray-300 hover:text-bright-green transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-300 hover:text-bright-green transition-colors">
                  Support Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-bright-green transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-bright-green transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4 font-display">Contact</h3>
            <ul className="space-y-3 font-body">
              <li className="flex items-start">
                <FaEnvelope className="w-5 h-5 mr-3 mt-0.5 text-bright-green" />
                <span className="text-gray-300">info@deepnex.in</span>
              </li>
              <li className="flex items-start">
                <FaPhone className="w-5 h-5 mr-3 mt-0.5 text-bright-green" />
                <span className="text-gray-300">+91 6355338791</span>
              </li>
              <li className="flex items-start">
                <FaMapMarkerAlt className="w-5 h-5 mr-3 mt-0.5 text-bright-green" />
                <span className="text-gray-300">31 M2, Madhuram Circle, Dindoli, Surat, Gujarat</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-700 mt-10 pt-8 text-center text-gray-400 font-body">
          <p>&copy; {currentYear} EduNex. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;