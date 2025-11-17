// components/admin/stats/ContactStats.jsx
import React from 'react';
import { Mail, MailOpen, MessageSquare, Users, UserX, TrendingUp, Calendar } from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';
import { useTheme } from "../../../context/ThemeContext";


const ContactStats = ({ stats = {} }) => {
  const {
    totalContacts = 0,
    statusBreakdown = {
      PENDING: 0,
      IN_PROGRESS: 0,
      RESOLVED: 0,
      CLOSED: 0
    },
    contactsWithUsers = 0,
    contactsWithoutUsers = 0,
    monthlyStats = []
  } = stats;

  const { theme } = useTheme();

  // Calculate current month contacts from monthlyStats
  const currentMonthContacts = monthlyStats.reduce((total, stat) => {
    const statDate = new Date(stat.createdAt);
    const currentDate = new Date();
    if (statDate.getMonth() === currentDate.getMonth() && 
        statDate.getFullYear() === currentDate.getFullYear()) {
      return total + (stat._count?.id || 0);
    }
    return total;
  }, 0);

  const contactStatsData = [
    {
      title: "Total Contacts",
      value: totalContacts,
      change: 0, // You can calculate this based on previous data if available
      icon: MessageSquare,
      color: "blue",
      description: "All contact messages",
      trend: "up"
    },
    {
      title: "In Progress",
      value: statusBreakdown.IN_PROGRESS || 0,
      change: 0,
      icon: MailOpen,
      color: "orange",
      description: "Being handled",
      trend: "up"
    },
    {
      title: "With User Accounts",
      value: contactsWithUsers,
      change: 0,
      icon: Users,
      color: "green",
      description: "From registered users",
      trend: "up"
    },
    {
      title: "This Month",
      value: currentMonthContacts,
      change: 0,
      icon: Calendar,
      color: "purple",
      description: "Current month contacts",
      trend: "up"
    }
  ];

  // Additional status breakdown for detailed view
  const statusDetails = [
    {
      status: 'PENDING',
      count: statusBreakdown.PENDING || 0,
      color: 'yellow',
      description: 'Awaiting response'
    },
    {
      status: 'IN_PROGRESS',
      count: statusBreakdown.IN_PROGRESS || 0,
      color: 'blue',
      description: 'Being handled'
    },
    {
      status: 'RESOLVED',
      count: statusBreakdown.RESOLVED || 0,
      color: 'green',
      description: 'Successfully resolved'
    },
    {
      status: 'CLOSED',
      count: statusBreakdown.CLOSED || 0,
      color: 'gray',
      description: 'Closed without resolution'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <StatsGrid columns={{ base: 1, sm: 2, lg: 4 }}>
        {contactStatsData.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </StatsGrid>

      {/* Status Breakdown */}
      <div className={`rounded-xl border p-6 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <h3 className={`text-lg font-semibold mb-4 flex items-center ${
          theme === 'dark' ? 'text-white' : 'text-gray-900'
        }`}>
          <TrendingUp className="w-5 h-5 mr-2" />
          Status Breakdown
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statusDetails.map((status) => (
            <div
              key={status.status}
              className={`p-4 rounded-lg border ${
                theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  {status.status.replace('_', ' ')}
                </span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  status.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                  status.color === 'blue' ? 'bg-blue-100 text-blue-800' :
                  status.color === 'green' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {status.count}
                </span>
              </div>
              <p className={`text-xs ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}>
                {status.description}
              </p>
            </div>
          ))}
        </div>

        {/* User Account Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-green-800 bg-green-900/20' : 'border-green-200 bg-green-50'
            }`}>
              <div className="flex items-center">
                <Users className={`w-5 h-5 mr-2 ${
                  theme === 'dark' ? 'text-green-400' : 'text-green-600'
                }`} />
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-green-300' : 'text-green-800'
                }`}>
                  With User Accounts
                </span>
              </div>
              <p className={`text-2xl font-bold mt-2 ${
                theme === 'dark' ? 'text-green-200' : 'text-green-700'
              }`}>
                {contactsWithUsers}
              </p>
            </div>

            <div className={`p-4 rounded-lg border ${
              theme === 'dark' ? 'border-blue-800 bg-blue-900/20' : 'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center">
                <UserX className={`w-5 h-5 mr-2 ${
                  theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                }`} />
                <span className={`font-medium ${
                  theme === 'dark' ? 'text-blue-300' : 'text-blue-800'
                }`}>
                  Without User Accounts
                </span>
              </div>
              <p className={`text-2xl font-bold mt-2 ${
                theme === 'dark' ? 'text-blue-200' : 'text-blue-700'
              }`}>
                {contactsWithoutUsers}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactStats;