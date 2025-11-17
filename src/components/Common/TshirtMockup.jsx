import mockup from "../../assets/mockups/tshirt_blank.jpg"

const TshirtMockup = ({ designUrl }) => {
  return (
    <div className="relative w-full max-w-md mx-auto">
      {/* T-shirt Base Mockup */}
      <img
        src={mockup}
        alt="Tshirt mockup"
        className="w-full object-contain"
      />

      {/* User / Variant Image (Your product image) */}
      <img
        src={designUrl}
        alt="Design"
        className="absolute top-[22%] left-1/2 -translate-x-1/2 w-[45%] opacity-100 object-contain"
      />
    </div>
  );
};

export default TshirtMockup;
