// components/admin/stats/OrderStats.jsx
import React from 'react';
import { Package, ShoppingCart, Truck, CheckCircle, DollarSign, TrendingUp, Clock } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const OrderStats = ({ stats = {} }) => {
  const {
    totalOrders = 0,
    todayOrders = 0,
    statusBreakdown = {},
    revenue = {}
  } = stats;

  const orderStatsData = [
    {
      title: "Total Orders",
      value: totalOrders,
      change: 12,
      icon: ShoppingCart,
      color: "blue",
      description: "All time orders",
      trend: "up"
    },
    {
      title: "Today's Orders",
      value: todayOrders,
      change: 8,
      icon: Package,
      color: "green",
      description: "Orders today",
      trend: "up"
    },
    {
      title: "Total Revenue",
      value: `₹${revenue.total || 0}`,
      change: 15,
      icon: DollarSign,
      color: "purple",
      description: "Total revenue",
      trend: "up"
    },
    {
      title: "Pending Orders",
      value: statusBreakdown.PENDING || 0,
      change: -5,
      icon: Clock,
      color: "orange",
      description: "Awaiting processing",
      trend: "down"
    }
  ];

  return (
    <StatsGrid columns={{ base: 1, sm: 2, lg: 4 }}>
      {orderStatsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          index={index}
        />
      ))}
    </StatsGrid>
  );
};

export default OrderStats;