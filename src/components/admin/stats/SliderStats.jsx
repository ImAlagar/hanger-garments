// components/admin/stats/SliderStats.jsx
import React from 'react';
import { 
  Image, 
  Play, 
  Pause, 
  Calendar, 
  Layout, 
  MousePointer, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';
import StatsGrid from '../../../shared/StatsGrid';
import StatCard from '../../../shared/StatCard';

const SliderStats = ({ stats = {} }) => {
  const {
    totalSliders = 0,
    activeSliders = 0,
    inactiveSliders = 0,
    expiredSliders = 0,
    scheduledSliders = 0,
    slidersWithButtons = 0,
    slidersWithOffers = 0,
    recentSliders = 0,
    slidersByLayout = {},
    slidersWithoutBgImage = 0,
    slidersWithoutImage = 0,
    summary = {},
    topOrderedSliders = []
  } = stats;

  const sliderStatsData = [
    {
      title: "Total Sliders",
      value: totalSliders,
      change: 8,
      icon: Image,
      color: "blue",
      description: "All sliders created",
      trend: "up"
    },
    {
      title: "Active Sliders",
      value: activeSliders,
      change: 12,
      icon: Play,
      color: "green",
      description: "Currently displaying",
      trend: "up"
    },
    {
      title: "With Buttons",
      value: slidersWithButtons,
      change: 15,
      icon: MousePointer,
      color: "purple",
      description: "Have call-to-action",
      trend: "up"
    },
    {
      title: "Recent Sliders",
      value: recentSliders,
      change: 25,
      icon: Zap,
      color: "orange",
      description: "Created last 7 days",
      trend: "up"
    },
    {
      title: "Inactive Sliders",
      value: inactiveSliders,
      change: -3,
      icon: Pause,
      color: "gray",
      description: "Manually disabled",
      trend: "down"
    },
    {
      title: "Scheduled Sliders",
      value: scheduledSliders,
      change: 5,
      icon: Clock,
      color: "yellow",
      description: "Future start date",
      trend: "up"
    }
  ];

  // Layout breakdown
  const layoutStats = [
    {
      title: "Left Layout",
      value: slidersByLayout.left || 0,
      icon: Layout,
      color: "blue",
      description: "Content on left side"
    },
    {
      title: "Right Layout",
      value: slidersByLayout.right || 0,
      icon: Layout,
      color: "green",
      description: "Content on right side"
    },
    {
      title: "Center Layout",
      value: slidersByLayout.center || 0,
      icon: Layout,
      color: "purple",
      description: "Content centered"
    }
  ];

  // Issues/warnings
  const issueStats = [
    {
      title: "Missing BG Images",
      value: slidersWithoutBgImage,
      icon: AlertTriangle,
      color: "red",
      description: "Need background images"
    },
    {
      title: "Missing Main Images",
      value: slidersWithoutImage,
      icon: AlertTriangle,
      color: "red",
      description: "Need main images"
    },
    {
      title: "Expired Sliders",
      value: expiredSliders,
      icon: Calendar,
      color: "orange",
      description: "Past end date but active"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Main Stats Grid */}
      <StatsGrid columns={{ base: 1, sm: 2, lg: 3 }}>
        {sliderStatsData.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
          />
        ))}
      </StatsGrid>

      {/* Summary Progress */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Rate
              </span>
              <span className="text-lg font-bold text-green-600">
                {summary.activePercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.activePercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {activeSliders} of {totalSliders} sliders are active
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                With CTA Buttons
              </span>
              <span className="text-lg font-bold text-purple-600">
                {summary.withButtonsPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.withButtonsPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {slidersWithButtons} sliders have call-to-action buttons
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Recently Added
              </span>
              <span className="text-lg font-bold text-orange-600">
                {summary.recentPercentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${summary.recentPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {recentSliders} sliders added in last 7 days
            </p>
          </div>
        </div>
      )}

      {/* Layout Breakdown and Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Layout Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Layout className="w-5 h-5 mr-2 text-blue-500" />
            Layout Distribution
          </h3>
          <div className="space-y-4">
            {layoutStats.map((stat, index) => (
              <div key={stat.title} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    stat.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900' :
                    stat.color === 'green' ? 'bg-green-100 dark:bg-green-900' :
                    'bg-purple-100 dark:bg-purple-900'
                  }`}>
                    <stat.icon className={`w-4 h-4 ${
                      stat.color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                      stat.color === 'green' ? 'text-green-600 dark:text-green-400' :
                      'text-purple-600 dark:text-purple-400'
                    }`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {stat.title}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Issues & Warnings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
            Issues & Warnings
          </h3>
          <div className="space-y-4">
            {issueStats.map((stat, index) => (
              <div key={stat.title} className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
                <div className="flex items-center space-x-3">
                  <stat.icon className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                  <div>
                    <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                      {stat.title}
                    </p>
                    <p className="text-xs text-orange-600 dark:text-orange-400">
                      {stat.description}
                    </p>
                  </div>
                </div>
                <span className="text-lg font-bold text-orange-800 dark:text-orange-200">
                  {stat.value}
                </span>
              </div>
            ))}
            
            {/* Success message if no issues */}
            {(slidersWithoutBgImage === 0 && slidersWithoutImage === 0 && expiredSliders === 0) && (
              <div className="flex items-center justify-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  No critical issues found
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Ordered Sliders */}
      {topOrderedSliders && topOrderedSliders.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-green-500" />
            Top Ordered Sliders
          </h3>
          <div className="space-y-3">
            {topOrderedSliders.map((slider, index) => (
              <div key={slider.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded">
                <div className="flex items-center space-x-3">
                  <span className="flex items-center justify-center w-6 h-6 text-xs font-bold bg-blue-100 text-blue-800 rounded-full">
                    {index + 1}
                  </span>
                  <div>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {slider.title}
                    </span>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        slider.isActive 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                      }`}>
                        {slider.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Order: {slider.order}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SliderStats;