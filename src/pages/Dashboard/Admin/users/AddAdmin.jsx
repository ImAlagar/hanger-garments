import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Mail, Phone, User, Lock, Shield } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateUserMutation } from '../../../../redux/services/userService';
import InputField from '../../../../components/Common/InputField';
import Button from '../../../../components/Common/Button';

const AddAdmin = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'ADMIN',
  });

  const [errors, setErrors] = useState({});

  const themeClasses = {
    light: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    dark: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' },
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6)
      newErrors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) {
    const firstError = Object.values(errors)[0];
    toast.error(firstError);
    return;
  }

  try {
    // Send as plain object (not FormData)
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim(),
      password: formData.password,
      role: 'ADMIN'
    };
    
    if (formData.phone.trim()) {
      userData.phone = formData.phone.trim();
    }

    await createUser(userData).unwrap();
    
    toast.success('Admin created successfully!');
    navigate('/dashboard/users');
  } catch (error) {
    console.error('Create admin error:', error);
    // Error handling...
  }
};

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-10">
      <div className="max-w-2xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
          <button
            onClick={() => navigate('/dashboard/users/add')}
            className={`p-2 rounded-lg ${currentTheme.border} hover:bg-gray-100 dark:hover:bg-gray-800 self-start sm:self-center`}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold font-italiana">
              Create Admin
            </h1>
            <p className={`opacity-70 font-instrument text-sm sm:text-base`}>
              Add a new administrator to the platform
            </p>
          </div>
        </div>

        {/* Warning Alert */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-5 mb-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-3">
            <Shield className="text-yellow-600 shrink-0" size={20} />
            <div>
              <p className="text-yellow-800 font-semibold text-sm sm:text-base">
                Admin Privileges
              </p>
              <p className="text-yellow-700 text-xs sm:text-sm">
                This user will have full access to the platform including user
                management, orders, and system settings.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-xl p-4 sm:p-6 ${currentTheme.bg} ${currentTheme.border}`}
          >
            <div className="space-y-5 sm:space-y-6">
              <InputField
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter admin's full name"
                icon={<User size={18} />}
                error={errors.name}
              />

              <InputField
                label="Email Address *"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                icon={<Mail size={18} />}
                error={errors.email}
              />

              <InputField
                label="Phone Number"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                icon={<Phone size={18} />}
                error={errors.phone}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                <InputField
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter secure password"
                  icon={<Lock size={18} />}
                  error={errors.password}
                />

                <InputField
                  label="Confirm Password *"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                  icon={<Lock size={18} />}
                  error={errors.confirmPassword}
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard/users/create')}
                  variant="ghost"
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  variant="primary"
                  className="w-full sm:w-auto min-w-[200px] bg-purple-600 hover:bg-purple-700"
                >
                  Create Admin
                </Button>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddAdmin;
