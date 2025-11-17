import React from 'react'

const Input = ({ 
  label, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  error, 
  required, 
  icon, 
  rightIcon 
}) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-gray-300">
      {label}
      {required && <span className="text-red-400 ml-1">*</span>}
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 ${
          error ? 'border-red-500' : 'border-white/20'
        }`}
      />
      {rightIcon && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {rightIcon}
        </div>
      )}
    </div>
    {error && (
      <p className="text-red-400 text-sm mt-1">{error}</p>
    )}
  </div>
);


export default Input