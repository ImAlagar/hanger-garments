// components/admin/stats/UserStats.jsx
import React from 'react';
import { Users, UserCheck, UserX, Store, Shield, TrendingUp } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const UserStats = ({ stats = {} }) => {
  const {
    totalUsers = 0,
    totalCustomers = 0,
    totalWholesalers = 0,
    totalAdmins = 0,
    activeUsers = 0,
    inactiveUsers = 0,
    pendingWholesalers = 0,
    newUsersThisMonth = 0
  } = stats;

  const userStatsData = [
    {
      title: "Total Users",
      value: totalUsers,
      change: newUsersThisMonth,
      icon: Users,
      color: "blue",
      description: "All registered users",
      trend: "up"
    },
    {
      title: "Active Users",
      value: activeUsers,
      change: 12,
      icon: UserCheck,
      color: "green",
      description: "Currently active",
      trend: "up"
    },
    {
      title: "Wholesalers",
      value: totalWholesalers,
      change: pendingWholesalers,
      icon: Store,
      color: "purple",
      description: `${pendingWholesalers} pending approval`,
      trend: "up"
    },
    {
      title: "Customers",
      value: totalCustomers,
      change: 8,
      icon: Users,
      color: "orange",
      description: "Regular customers",
      trend: "up"
    },
    {
      title: "Admins",
      value: totalAdmins,
      change: 0,
      icon: Shield,
      color: "red",
      description: "Administrative users",
      trend: "stable"
    },
    {
      title: "Inactive Users",
      value: inactiveUsers,
      change: -2,
      icon: UserX,
      color: "gray",
      description: "Suspended/Inactive",
      trend: "down"
    }
  ];

  return (
    <StatsGrid columns={{ base: 1, sm: 2, lg: 3, xl: 6 }}>
      {userStatsData.map((stat, index) => (
        <StatCard
          key={stat.title}
          {...stat}
          index={index}
        />
      ))}
    </StatsGrid>
  );
};

export default UserStats;