// components/admin/customization/CustomizationForm.jsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiSave, FiX, FiPlus, FiTrash2 } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../../../../context/ThemeContext';

// Redux imports
import {
  useCreateCustomizationMutation,
  useUpdateCustomizationMutation,
  useGetCustomizationByProductIdQuery
} from '../../../../redux/services/customizationService';

const CustomizationForm = () => {
  const { productId, customizationId } = useParams();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const isEdit = Boolean(customizationId);

  // Fetch existing customization data for editing
  const { data: existingData } = useGetCustomizationByProductIdQuery(productId, {
    skip: !isEdit
  });

  const [createCustomization] = useCreateCustomizationMutation();
  const [updateCustomization] = useUpdateCustomizationMutation();

  const [formData, setFormData] = useState({
    title: existingData?.data?.title || '',
    description: existingData?.data?.description || '',
    isActive: existingData?.data?.isActive ?? true,
    options: existingData?.data?.options || []
  });

  const [newOption, setNewOption] = useState({
    type: 'text',
    label: '',
    placeholder: '',
    required: false,
    choices: []
  });

  const themeStyles = {
    background: theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50',
    card: theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
    text: {
      primary: theme === 'dark' ? 'text-white' : 'text-gray-900',
      secondary: theme === 'dark' ? 'text-gray-300' : 'text-gray-600',
      muted: theme === 'dark' ? 'text-gray-400' : 'text-gray-500',
    },
    input: theme === 'dark' ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500',
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const customizationData = {
        productId,
        title: formData.title,
        description: formData.description,
        isActive: formData.isActive,
        options: formData.options
      };

      if (isEdit) {
        await updateCustomization({
          customizationId,
          customizationData
        }).unwrap();
      } else {
        await createCustomization(customizationData).unwrap();
      }

      navigate(`/dashboard/products/customization/${productId}`);
    } catch (error) {
      console.error('Failed to save customization:', error);
    }
  };

  const addOption = () => {
    if (newOption.label.trim()) {
      setFormData(prev => ({
        ...prev,
        options: [...prev.options, { ...newOption, id: Date.now().toString() }]
      }));
      setNewOption({
        type: 'text',
        label: '',
        placeholder: '',
        required: false,
        choices: []
      });
    }
  };

  const removeOption = (index) => {
    setFormData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className={`min-h-screen p-6 ${themeStyles.background}`}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${themeStyles.text.primary}`}>
            {isEdit ? 'Edit Customization' : 'Create Customization'}
          </h1>
          <p className={`mt-2 ${themeStyles.text.secondary}`}>
            {isEdit ? 'Update product customization options' : 'Add new customization options for your product'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`rounded-xl border p-6 ${themeStyles.card}`}>
            {/* Basic Information */}
            <div className="mb-8">
              <h2 className={`text-xl font-semibold mb-4 ${themeStyles.text.primary}`}>
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeStyles.text.secondary}`}>
                    Customization Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className={`w-full px-3 py-2 border rounded-lg ${themeStyles.input}`}
                    placeholder="e.g., Personalize Your Product"
                    required
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${themeStyles.text.secondary}`}>
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg ${themeStyles.input}`}
                    placeholder="Describe the customization options available..."
                  />
                </div>
              </div>
            </div>

            {/* Customization Options */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${themeStyles.text.primary}`}>
                  Customization Options
                </h2>
              </div>

              {/* Add New Option */}
              <div className={`mb-6 p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <h3 className={`text-lg font-medium mb-3 ${themeStyles.text.primary}`}>
                  Add New Option
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeStyles.text.secondary}`}>
                      Field Type
                    </label>
                    <select
                      value={newOption.type}
                      onChange={(e) => setNewOption(prev => ({ ...prev, type: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg ${themeStyles.input}`}
                    >
                      <option value="text">Text Input</option>
                      <option value="textarea">Text Area</option>
                      <option value="select">Dropdown</option>
                      <option value="radio">Radio Buttons</option>
                      <option value="checkbox">Checkbox</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeStyles.text.secondary}`}>
                      Label *
                    </label>
                    <input
                      type="text"
                      value={newOption.label}
                      onChange={(e) => setNewOption(prev => ({ ...prev, label: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg ${themeStyles.input}`}
                      placeholder="e.g., Engraving Text"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${themeStyles.text.secondary}`}>
                      Placeholder
                    </label>
                    <input
                      type="text"
                      value={newOption.placeholder}
                      onChange={(e) => setNewOption(prev => ({ ...prev, placeholder: e.target.value }))}
                      className={`w-full px-3 py-2 border rounded-lg ${themeStyles.input}`}
                      placeholder="e.g., Enter your text here"
                    />
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newOption.required}
                      onChange={(e) => setNewOption(prev => ({ ...prev, required: e.target.checked }))}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <label className={`ml-2 text-sm font-medium ${themeStyles.text.secondary}`}>
                      Required Field
                    </label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addOption}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <FiPlus className="w-4 h-4" />
                  <span>Add Option</span>
                </button>
              </div>

              {/* Existing Options */}
              <div className="space-y-4">
                {formData.options.map((option, index) => (
                  <div key={option.id || index} className={`p-4 rounded-lg border ${themeStyles.card}`}>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className={`font-medium ${themeStyles.text.primary}`}>
                          {option.label}
                        </h4>
                        <p className={`text-sm ${themeStyles.text.muted}`}>
                          Type: {option.type} • {option.required ? 'Required' : 'Optional'}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                    {option.placeholder && (
                      <p className={`text-sm ${themeStyles.text.muted}`}>
                        Placeholder: {option.placeholder}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className={`flex items-center space-x-2 px-6 py-2 rounded-lg border ${
                  theme === 'dark' 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-700' 
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FiX className="w-4 h-4" />
                <span>Cancel</span>
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                <FiSave className="w-4 h-4" />
                <span>{isEdit ? 'Update' : 'Create'} Customization</span>
              </button>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default CustomizationForm;