// hooks/useBanners.js
import { useState, useEffect } from "react"
import { useGetActiveSlidersQuery } from "../redux/services/sliderService"

// Fallback banners in case API fails
const fallbackBanners = [
  {
    id: 1,
    bg: "/api/placeholder/1200/800",
    image: "/api/placeholder/600/400",
    subtitle: "Tiruppur Garments",
    title: "Fashion Style",
    description: "Inspired by classic silhouettes and refined detailing, each piece exudes sophistication and grace.",
    smallText: "Discover premium quality and timeless elegance with our latest collection.",
    offerText: "✨ Flat 30% Off on New Arrivals!",
    buttonText: "Buy Now",
    buttonLink: "",
    layout: "left",
  }
]

const useBanners = () => {
  const { data: apiResponse, isLoading, error } = useGetActiveSlidersQuery()
  const [banners, setBanners] = useState([])

  // Set banners from API or fallback
  useEffect(() => {
    if (apiResponse?.success && apiResponse.data?.length > 0) {
      const apiBanners = apiResponse.data.map(slider => ({
        id: slider.id,
        bg: slider.bgImage,
        image: slider.image,
        subtitle: slider.subtitle,
        title: slider.title,
        description: slider.description,
        smallText: slider.smallText,
        offerText: slider.offerText,
        buttonText: slider.buttonText,
        buttonLink: slider.buttonLink,
        layout: slider.layout || "left",
      }))
      setBanners(apiBanners)
    } else {
      setBanners(fallbackBanners)
    }
  }, [apiResponse])

  const currentBanner = banners[0] || fallbackBanners[0]

  return {
    banners,
    currentBanner,
    isLoading,
    error,
    hasBanners: banners.length > 0
  }
}

export default useBanners