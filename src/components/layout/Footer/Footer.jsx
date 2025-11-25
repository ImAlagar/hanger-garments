import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTheme } from "../../../context/ThemeContext";
import { useGetAllCategoriesQuery } from "../../../redux/services/categoryService";
import { useGetAllSubcategoriesQuery } from "../../../redux/services/subcategoryService";
import { motion } from "framer-motion";
import {
  Mail, Phone, MapPin, Clock, Crown, Award,
  Home, User, ShoppingBag, Heart, HelpCircle,
  Instagram, Facebook
} from "lucide-react";


// =====================
// Animation Variants
// =====================
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, duration: 0.6 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  }
};


// =====================
// Footer Component
// =====================
export default function Footer() {

  const { theme } = useTheme();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { data: categoriesData, isLoading, error } = useGetAllCategoriesQuery();
  const { data: subcategoriesData } = useGetAllSubcategoriesQuery();


  // =====================
  // API Response Normalization
  // =====================

  const categories =
    categoriesData?.data?.length ? categoriesData.data :
      categoriesData?.categories?.length ? categoriesData.categories :
        categoriesData?.data?.categories?.length ? categoriesData.data.categories :
          [];

  const subcategories =
    subcategoriesData?.data?.length ? subcategoriesData.data :
      subcategoriesData?.subcategories?.length ? subcategoriesData.subcategories :
        subcategoriesData?.data?.subcategories?.length ? subcategoriesData.data.subcategories :
          [];


  // =====================
  // Theme Colors
  // =====================
  const bgColor = theme === "dark" ? "bg-gray-900" : "bg-gray-50";
  const headingColor = theme === "dark" ? "text-white" : "text-gray-900";
  const textColor = theme === "dark" ? "text-gray-200" : "text-gray-800";
  const borderColor = theme === "dark" ? "border-gray-700" : "border-gray-200";
  const accentColor = theme === "dark" ? "text-amber-400" : "text-amber-600";


  // =====================
  // Contact Info
  // =====================
  const contactData = [
    { id: 1, icon: Mail, title: "Email", content: "contact@hangergarments.com" },
    { id: 2, icon: Phone, title: "Phone", content: "+91 88833 85888" },
    { id: 3, icon: MapPin, title: "Location", content: "8/2514 . Thiyagi Kumaran St, Pandian Nagar , Tiruppur , Tamilnadu  - 641602" },
    { id: 4, icon: Clock, title: "Business Hours", content: "Mon–Sun: 9AM – 8PM" }
  ];


  // =====================
  // Social Media
  // =====================
  const socialMedia = [
    {
      id: 1,
      icon: Instagram,
      name: "Instagram",
      url: "https://www.instagram.com/hanger_garments/",
      color: "hover:bg-pink-500"
    },
    {
      id: 2,
      icon: Facebook,
      name: "Facebook",
      url: "https://www.facebook.com/share/19yyr4QjpU/?mibextid=wwXIfr",
      color: "hover:bg-blue-600"
    },
  ];


  // =====================
  // Components
  // =====================
  const ContactItem = React.memo(({ icon: Icon, title, content }) => (
    <motion.li
      className="flex items-start space-x-3 mb-4"
      variants={itemVariants}
      initial="hidden"
      animate="visible"
    >
      <div className={`mt-1 p-2 rounded-lg flex-shrink-0 ${theme === "dark" ? "bg-amber-400/20" : "bg-amber-500/20"}`}>
        <Icon size={18} className={accentColor} />
      </div>

      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-sm ${headingColor} mb-1`}>{title}</p>
        <p className={`text-sm ${textColor}`}>{content}</p>
      </div>
    </motion.li>
  ));

  const SocialIcon = ({ icon: Icon, name, url, color }) => (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className={`
        p-3 rounded-xl transition-all duration-300
        ${theme === "dark" ? "bg-gray-800 text-gray-300" : "bg-gray-200 text-gray-600"}
        ${color} hover:text-white border ${borderColor}
      `}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      aria-label={name}
    >
      <Icon size={20} />
    </motion.a>
  );

  const SimpleLink = ({ children, onClick, icon: Icon }) => (
    <motion.button
      whileHover={{ x: 3 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center space-x-2 text-sm ${textColor} hover:text-amber-500 transition py-2 w-full text-left`}
    >
      {Icon && <Icon size={14} className={accentColor} />}
      <span>{children}</span>
    </motion.button>
  );


  const LoadingSkeleton = () => (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className={`h-4 w-32 rounded ${theme === "dark" ? "bg-gray-700" : "bg-gray-300"}`} />
      ))}
    </div>
  );


  // =====================
  // Render
  // =====================
  return (
    <motion.footer
      className={`${bgColor} ${textColor} font-instrument transition-colors duration-500 relative overflow-hidden`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      variants={containerVariants}
    >

      {/* MAIN FOOTER */}
      <div className="px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-8 lg:gap-10">

          {/* BRAND */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-6">
              <motion.div whileHover={{ rotate: 360 }} transition={{ duration: 0.6 }}>
                <Crown className={accentColor} size={28} />
              </motion.div>

              <div>
                <h3 className={`text-xl font-bold ${headingColor}`}>HANGER GARMENTS</h3>
                <p className={`text-xs ${textColor}`}>Premium Fashion</p>
              </div>
            </div>

            <p className="text-sm leading-relaxed mb-6">
              Crafting exceptional apparel experiences with quality & style.
            </p>

            <div className="flex space-x-3">
              {socialMedia.map((social) => (
                <SocialIcon key={social.id} {...social} />
              ))}
            </div>
          </motion.div>


          {/* QUICK LINKS */}
          <motion.div variants={itemVariants}>
            <h4 className={`text-sm font-semibold mb-6 ${headingColor} uppercase`}>Quick Links</h4>

            <div className="space-y-3">
              <SimpleLink onClick={() => navigate("/")} icon={Home}>Home</SimpleLink>
              <SimpleLink onClick={() => navigate("/shop")} icon={ShoppingBag}>Shop</SimpleLink>
              <SimpleLink onClick={() => navigate("/wishlist")} icon={Heart}>Wishlist</SimpleLink>
              <SimpleLink onClick={() => navigate("/about-us")} icon={User}>About Us</SimpleLink>
              <SimpleLink onClick={() => navigate("/contact")} icon={HelpCircle}>Contact</SimpleLink>
            </div>
          </motion.div>


          {/* CATEGORIES */}
          <motion.div variants={itemVariants}>
            <h4 className={`text-sm font-semibold mb-6 ${headingColor} uppercase`}>Categories</h4>

            {isLoading && <LoadingSkeleton />}

            {!isLoading && !error && categories.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide font-instrument">
                {categories.map((cat) => (
                  <SimpleLink
                    key={cat.id || cat._id}
                    onClick={() =>
                      navigate(`/shop/${cat.name.toLowerCase().replace(/\s+/g, '-')}`)
                    }
                  >
                    {cat.name}
                  </SimpleLink>
                ))}
              </div>
            )}
          </motion.div>


          {/* SUBCATEGORIES */}
          <motion.div variants={itemVariants}>
            <h4 className={`text-sm font-semibold mb-6 ${headingColor} uppercase`}>Subcategories</h4>

            {subcategories.length > 0 ? (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-hide font-instrument">
                {subcategories.map((subcat) => (
                  <SimpleLink
                    key={subcat.id || subcat._id}
                    onClick={() =>
                      navigate(`/shop?subcategories=${encodeURIComponent(
                        subcat.name.toLowerCase().replace(/\s+/g, "-")
                      )}`)
                    }
                  >
                    {subcat.name}
                  </SimpleLink>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No subcategories available</p>
            )}
          </motion.div>

          {/* CONTACT */}
          <motion.div variants={itemVariants} className="md:col-span-2 lg:col-span-1">
            <h4 className={`text-sm font-semibold mb-6 ${headingColor} uppercase`}>Contact Info</h4>

            <ul className="space-y-0">
              {contactData.map((item) => (
                <ContactItem key={item.id} {...item} />
              ))}
            </ul>
          </motion.div>

        </div>
      </div>


      {/* BOTTOM FOOTER */}
      <div className={`border-t ${borderColor}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-6 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y=0">
          <div className={`text-sm ${textColor}`}>
            © {new Date().getFullYear()} Hanger Garments. All rights reserved.
          </div>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6 text-sm">
            <Link to={'/privacy-policy'} className={`${textColor} hover:text-amber-500`}>
              Privacy Policy
            </Link>
            <Link to={'/terms'} className={`${textColor} hover:text-amber-500`}>
              Terms and Policy
            </Link>
            <Link to={'/shipping'} className={`${textColor} hover:text-amber-500`}>
              Shipping Policy
            </Link>
            <Link to={'/cancellation'} className={`${textColor} hover:text-amber-500`}>
              Returns & Refunds
            </Link>
          </div>
        </div>
      </div>

    </motion.footer>
  );
}
