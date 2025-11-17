// components/admin/stats/CategoryStats.jsx
import React from 'react';
import { Folder, FolderOpen, FolderPlus, Users, Package, TrendingUp } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const CategoryStats = ({ stats = {} }) => {
  const {
    totalCategories = 0,
    activeCategories = 0,
    inactiveCategories = 0,
    categoriesWithProducts = 0,
    totalSubcategories = 0,
    categoriesByType = []
  } = stats;

  const categoryStatsData = [
    {
      title: "Total Categories",
      value: totalCategories,
      change: 8,
      icon: Folder,
      color: "blue",
      description: "In system",
      trend: "up"
    },
    {
      title: "Active Categories",
      value: activeCategories,
      change: 12,
      icon: FolderOpen,
      color: "green",
      description: "Currently visible",
      trend: "up"
    },
    {
      title: "Categories with Products",
      value: categoriesWithProducts,
      change: 15,
      icon: Package,
      color: "purple",
      description: "Has products",
      trend: "up"
    },
    {
      title: "Total Subcategories",
      value: totalSubcategories,
      change: 20,
      icon: FolderPlus,
      color: "orange",
      description: "All subcategories",
      trend: "up"
    }
  ];

  return (
    <StatsGrid columns={{ base: 1, sm: 2, lg: 4 }}>
      {categoryStatsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          index={index}
        />
      ))}
    </StatsGrid>
  );
};

export default CategoryStats;