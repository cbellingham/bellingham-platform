import React from 'react';

const baseClasses = 'px-4 py-2 rounded';

const variantClasses = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white',
  success: 'bg-green-600 hover:bg-green-700 text-white',
  danger: 'bg-red-600 hover:bg-red-700 text-white',
  ghost: 'bg-gray-600 hover:bg-gray-700 text-white',
  link: 'bg-transparent text-blue-600 hover:underline px-0 py-0 rounded-none',
};

const Button = ({ variant = 'primary', className = '', ...props }) => {
  const variantClass = variantClasses[variant] || '';
  return (
    <button className={`${baseClasses} ${variantClass} ${className}`} {...props} />
  );
};

export default Button;

