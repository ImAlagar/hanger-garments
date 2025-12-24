import React from "react";
import { Helmet } from "react-helmet";
import Categories from "../../components/HomeComponents/Categories";
import BestSeller from "../../components/HomeComponents/BestSeller";
import NewArraivals from "../../components/HomeComponents/NewArraivals";
import FeaturedProducts from "../../components/HomeComponents/FeaturedProducts";
import Collections from "./Collections";
import HeroSlider from "../../components/HomeComponents/HeroSlider";
import useBanners from "../../hooks/useBanners";

export default function Home() {
  const { banners, currentBanner, isLoading, error, hasBanners } = useBanners();

  // Loading state
  if (isLoading) {
    return (
      <>
        <Helmet>
          <title>Loading... | Fashion Store</title>
          <meta name="description" content="Discover amazing fashion collections and latest trends" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-blue-600 rounded-full mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading amazing fashion...</p>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error && !hasBanners) {
    return (
      <>
        <Helmet>
          <title>Fashion Store | Online Shopping</title>
          <meta name="description" content="Discover fashion collections, best sellers and new arrivals" />
        </Helmet>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-red-600">
            <p>Failed to load banners. Showing limited content.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>{currentBanner.title ? `${currentBanner.title} | Fashion Store` : "Fashion Store | Premium Clothing"}</title>
        <meta 
          name="description" 
          content={currentBanner.description || "Discover premium quality fashion, latest trends, and exclusive collections. Shop now for the best prices!"} 
        />
        <meta name="keywords" content="fashion, clothing, style, trendy, premium, shopping, online store" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={typeof window !== 'undefined' ? window.location.href : ''} />
        <meta property="og:title" content={currentBanner.title || "Fashion Store | Premium Clothing"} />
        <meta property="og:description" content={currentBanner.description || "Discover premium quality fashion and latest trends"} />
        <meta property="og:image" content={currentBanner.image || currentBanner.bg} />
        
        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:title" content={currentBanner.title || "Fashion Store | Premium Clothing"} />
        <meta property="twitter:description" content={currentBanner.description || "Discover premium quality fashion and latest trends"} />
        <meta property="twitter:image" content={currentBanner.image || currentBanner.bg} />
      </Helmet>

      <div className="min-h-screen">
        {/* Hero Banner Section */}
        <HeroSlider 
          banners={banners} 
          currentBanner={currentBanner}
          isLoading={isLoading}
        />

        {/* Collections Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <Collections />
        </section>

        {/* Featured Products Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <FeaturedProducts />
        </section>

        {/* Best Seller Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <BestSeller />
        </section>

        {/* New Arrivals Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-8">
          <NewArraivals />
        </section>
      </div>
    </>
  );
}