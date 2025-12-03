import React from "react";
import { motion } from "framer-motion";
import { FaTshirt, FaHandshake, FaRegLightbulb } from "react-icons/fa";
import { MdFactory } from "react-icons/md";
import { useTheme } from "../../context/ThemeContext";


const About = () => {
  const { theme } = useTheme();

  const bgColor =
    theme === "dark"
      ? "bg-gray-900 text-gray-100"
      : "bg-white text-gray-800";

  const cardColor =
    theme === "dark" ? "bg-gray-800 text-gray-100" : "bg-gray-50 text-gray-800";

  return (
    <section
      className={`min-h-screen px-6 md:px-20 py-8 lg:py-8  pb-16 ${bgColor} transition-all duration-500`}
      id="about-us"
    >
      <motion.h2
        className="text-center text-4xl font-italiana tracking-widest md:text-5xl font-semibold mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        About Us –{" "}
        <span className="text-purple-600 font-bold">Tiruppur Garments</span>
      </motion.h2>

      <div className="grid lg:grid-cols-2 font-instrument tracking-wider gap-10 items-start">
        {/* Left Column - Story */}
        <motion.div
          className="space-y-10 leading-relaxed"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Beginning */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">
              🧵 Our Beginning
            </h3>
            <p>
              <strong>Tiruppur Garments</strong>, founded by{" "}
              <strong>Mrs. Kasthuri Dinesh, MBA</strong>, is a new-age apparel
              brand built on a proud <strong>50+ year family legacy</strong> in
              the garment industry established by{" "}
              <strong>Mr. E. Shanmugam</strong>.
            </p>
          </div>

          {/* Growth */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">
              🌱 Our Growth
            </h3>
            <p>
              What began with his dedication, skill, and craftsmanship has now
              evolved into a modern manufacturing unit known for{" "}
              <strong>quality, consistency, and innovation</strong>.
            </p>
          </div>

          {/* Expertise */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">
              👕 Our Expertise
            </h3>
            <p>
              Based in <strong>Tiruppur – The Knitwear Capital of India</strong>,
              we specialize in <strong>Round Neck T-shirts, Polo T-shirts,
              Sweatshirts, Hoodies</strong>, and custom-made apparel designed for
              comfort and durability.
            </p>
          </div>

          {/* Partnerships */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">
              🤝 Our Partnerships
            </h3>
            <p>
              We proudly manage <strong>white-label manufacturing</strong> for
              leading fashion brands and have partnered with{" "}
              <strong>150+ brands</strong> to bring their clothing lines to life.
              Alongside this, we’re developing our own in-house brands that
              reflect modern fashion trends and premium standards.
            </p>
          </div>

          {/* Promise */}
          <div>
            <h3 className="text-xl font-semibold mb-2 text-purple-600">
              ✨ Our Promise
            </h3>
            <p>
              At Tiruppur Garments, every piece is crafted with{" "}
              <strong>passion, precision, and purpose</strong> — ensuring superior
              fabric quality, fine stitching, and timely delivery.
            </p>
          </div>
        </motion.div>

        {/* Right Column - Why Choose / Vision / Promise */}
        <motion.div
          className={`rounded-2xl shadow-lg p-8 space-y-6 ${cardColor}`}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-2xl font-semibold text-center mb-6">
            Why Choose Us?
          </h3>

          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <MdFactory className="text-2xl text-purple-600 mt-1" />
              <div>
                <h4 className="font-bold">Modern Manufacturing</h4>
                <p>Advanced machinery ensuring precision and consistency.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaTshirt className="text-2xl text-indigo-600 mt-1" />
              <div>
                <h4 className="font-bold">Quality & Comfort</h4>
                <p>
                  Premium fabrics and stitching standards for long-lasting wear.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaHandshake className="text-2xl text-pink-500 mt-1" />
              <div>
                <h4 className="font-bold">Trusted by 150+ Brands</h4>
                <p>
                  Reliable partnerships with leading fashion labels across India.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <FaRegLightbulb className="text-2xl text-yellow-500 mt-1" />
              <div>
                <h4 className="font-bold">Innovation & Style</h4>
                <p>
                  Blending traditional craftsmanship with contemporary design.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-5 space-y-3 text-center">
            <p>
              ✨ <strong>Our Vision:</strong> To carry forward our family’s rich
              legacy while building a modern, trusted name in the garment
              industry.
            </p>
            <p>
              🤝 <strong>Our Promise:</strong> Quality, comfort, and creativity
              in every stitch.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default About