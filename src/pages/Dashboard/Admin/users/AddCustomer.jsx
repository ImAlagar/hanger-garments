import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, Mail, Phone, User, Lock } from 'lucide-react';
import { useTheme } from '../../../../context/ThemeContext';
import { useCreateUserMutation } from '../../../../redux/services/userService';
import Button from '../../../../components/Common/Button';
import InputField from '../../../../components/Common/InputField';

const AddCustomer = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [createUser, { isLoading }] = useCreateUserMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'CUSTOMER' // This should match your API's expected role values
  });

  const [errors, setErrors] = useState({});

  const themeClasses = {
    light: { bg: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
    dark: { bg: 'bg-gray-900', text: 'text-white', border: 'border-gray-700' }
  };

  const currentTheme = themeClasses[theme] || themeClasses.light;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Full name is required';
    else if (formData.name.trim().length < 2 || formData.name.trim().length > 100) {
      newErrors.name = 'Name must be between 2 and 100 characters';
    }
    
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    // Validate role based on your API requirements
    if (!formData.role) newErrors.role = 'User role is required';
    else if (!['ADMIN', 'CUSTOMER', 'WHOLESALER'].includes(formData.role)) {
      newErrors.role = 'Role must be one of: ADMIN, CUSTOMER, WHOLESALER';
    }

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
      // Send as JSON instead of FormData
      const userData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role // Make sure this matches your API's expected role values
      };

      // Add phone only if provided
      if (formData.phone.trim()) {
        userData.phone = formData.phone.trim();
      }

      await createUser(userData).unwrap();
      
      toast.success('Customer created successfully!');
      navigate('/dashboard/users');
    } catch (error) {
      console.error('Create customer error:', error);
      
      // Handle validation errors from API
      if (error.data?.errors) {
        const apiErrors = error.data.errors;
        const fieldErrors = {};
        
        apiErrors.forEach(err => {
          if (!fieldErrors[err.field]) {
            fieldErrors[err.field] = err.message;
          }
        });
        
        setErrors(fieldErrors);
        toast.error('Please fix the validation errors');
      } else {
        toast.error(error.data?.message || 'Failed to create customer');
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/dashboard/users')} // Fixed navigation path
            className={`p-2 rounded-lg ${currentTheme.border} hover:bg-gray-100 dark:hover:bg-gray-800`}
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold font-italiana">Create Customer</h1>
            <p className={`opacity-70 font-instrument`}>Add a new customer to the platform</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`border rounded-xl p-6 ${currentTheme.bg} ${currentTheme.border}`}
          >
            <div className="space-y-6">
              <InputField
                label="Full Name *"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer's full name"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InputField
                  label="Password *"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password"
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

              {/* Hidden role field since it's hardcoded to CUSTOMER */}
              <input type="hidden" name="role" value="CUSTOMER" />

              <div className="flex gap-4 pt-4">
                <Button
                  type="button"
                  onClick={() => navigate('/dashboard/users')} // Fixed navigation path
                  variant="ghost"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  variant="primary"
                  className="min-w-[200px]"
                >
                  Create Customer
                </Button>
              </div>
            </div>
          </motion.div>
        </form>
      </div>
    </div>
  );
};

export default AddCustomer;