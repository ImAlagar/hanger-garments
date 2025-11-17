// components/admin/stats/ProductStats.jsx
import React from 'react';
import { Package, AlertTriangle, TrendingUp, DollarSign, Users, Zap, ShoppingCart, Star } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const ProductStats = ({ stats = {} }) => {
  const {
    totalProducts = 0,
    activeProducts = 0,
    inactiveProducts = 0,
    outOfStock = 0,
    lowStock = 0,
    totalInventoryValue = 0,
    bestSellers = 0,
    featuredProducts = 0,
    newArrivals = 0
  } = stats;

  const productStatsData = [
    {
      title: "Total Products",
      value: totalProducts,
      change: 12,
      icon: Package,
      color: "blue",
      description: "In catalog",
      trend: "up"
    },
    {
      title: "Active Products",
      value: activeProducts,
      change: 8,
      icon: Zap,
      color: "green",
      description: "Currently available",
      trend: "up"
    },
    {
      title: "Out of Stock",
      value: outOfStock,
      change: -3,
      icon: AlertTriangle,
      color: "red",
      description: "Need restocking",
      alert: outOfStock > 0 ? "Items need attention" : null,
      trend: "down"
    },
    {
      title: "Low Stock",
      value: lowStock,
      change: 5,
      icon: TrendingUp,
      color: "orange",
      description: "Below 10 units",
      alert: lowStock > 3 ? "Monitor inventory" : null,
      trend: "up"
    },
    {
      title: "Best Sellers",
      value: bestSellers || 0,
      change: 15,
      icon: ShoppingCart,
      color: "yellow",
      description: "Top performing",
      trend: "up"
    },
    {
      title: "Featured Products",
      value: featuredProducts || 0,
      change: 10,
      icon: Star,
      color: "purple",
      description: "Promoted items",
      trend: "up"
    },
    {
      title: "New Arrivals",
      value: newArrivals || 0,
      change: 25,
      icon: Users,
      color: "pink",
      description: "Recently added",
      trend: "up"
    },
    {
      title: "Inventory Value",
      value: `₹${(totalInventoryValue || 0).toLocaleString()}`,
      change: 18,
      icon: DollarSign,
      color: "emerald",
      description: "Total stock value",
      trend: "up"
    }
  ];

  return (
    <StatsGrid columns={{ base: 1, sm: 2, lg: 4 }}>
      {productStatsData.slice(0, 4).map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          index={index}
        />
      ))}
    </StatsGrid>
  );
};

export default ProductStats;