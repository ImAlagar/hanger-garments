import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { User, Store, Shield, ArrowLeft } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import Button from '../../../../components/Common/Button';

const AddUser = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [selectedRole, setSelectedRole] = useState(null);

  const themeClasses = {
    light: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    dark: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  const userTypes = [
    {
      role: 'CUSTOMER',
      title: 'Create Customer',
      description: 'Add a new customer user to the platform',
      icon: User,
      color: 'green',
      path: '/dashboard/users/create/customer'
    },
    {
      role: 'ADMIN',
      title: 'Create Admin',
      description: 'Add a new administrator user',
      icon: Shield,
      color: 'purple',
      path: '/dashboard/users/create/admin'
    }
  ];

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    navigate(role.path);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
        <div className="flex items-start gap-4">
            <button
            onClick={() => navigate('/dashboard/users')}
            className={`p-2 rounded-lg ${currentTheme.border} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mt-1`}
            >
            <ArrowLeft size={20} />
            </button>
            <div>
            <h1 className="text-3xl font-bold font-italiana mb-2">Create New User</h1>
            <p className={`text-lg ${currentTheme.text} opacity-70 font-instrument`}>
                Select the type of user you want to create
            </p>
            </div>
        </div>
        </div>

        {/* User Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {userTypes.map((userType) => {
            const Icon = userType.icon;
            return (
              <motion.div
                key={userType.role}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`border-2 rounded-xl p-6 cursor-pointer transition-all ${currentTheme.bg} ${currentTheme.border} hover:border-${userType.color}-500`}
                onClick={() => handleRoleSelect(userType)}
              >
                <div className="flex flex-col items-center text-center">
                  <div className={`p-3 rounded-full bg-${userType.color}-100 text-${userType.color}-600 mb-4`}>
                    <Icon size={32} />
                  </div>
                  <h3 className="text-xl font-semibold font-instrument mb-2">
                    {userType.title}
                  </h3>
                  <p className={`text-sm ${currentTheme.text} opacity-70 mb-4`}>
                    {userType.description}
                  </p>
                  <Button variant="primary" className="w-full">
                    Select
                  </Button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Quick Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mt-8 border rounded-xl p-6 ${currentTheme.bg} ${currentTheme.border}`}
        >
          <h3 className="text-lg font-semibold font-instrument mb-4">User Types Guide</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-green-600">Customers</span>
              <p className="opacity-70">Can browse products and place orders</p>
            </div>
            <div>
              <span className="font-semibold text-purple-600">Admins</span>
              <p className="opacity-70">Full platform access and management</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AddUser;