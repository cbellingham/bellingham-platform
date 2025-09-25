import React, { cloneElement, forwardRef, isValidElement } from 'react';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:ring-blue-500',
  success: 'bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
  ghost: 'bg-gray-600 text-white hover:bg-gray-700 focus-visible:ring-gray-500',
  link: 'bg-transparent px-0 py-0 text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500 focus-visible:ring-offset-0 rounded-none',
};

const renderIcon = (icon, className) => {
  if (!icon) {
    return null;
  }

  if (isValidElement(icon)) {
    return cloneElement(icon, {
      className: classNames(icon.props.className, className),
      'aria-hidden': true,
      focusable: false,
    });
  }

  if (typeof icon === 'function') {
    const IconComponent = icon;
    return <IconComponent className={className} aria-hidden="true" focusable="false" />;
  }

  return icon;
};

const DefaultSpinner = ({ className }) => (
  <svg
    className={classNames('h-4 w-4 animate-spin', className)}
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    focusable="false"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
);

const Button = forwardRef(
  (
    {
      variant = 'primary',
      className = '',
      leadingIcon,
      loadingIcon,
      isLoading = false,
      disabled = false,
      type = 'button',
      children,
      ...props
    },
    ref,
  ) => {
    const variantClass = variantClasses[variant] || variantClasses.primary;
    const resolvedDisabled = disabled || isLoading;
    const leadingIconNode = !isLoading ? renderIcon(leadingIcon, 'h-4 w-4') : null;
    const loadingIconNode = isLoading
      ? renderIcon(loadingIcon, 'h-4 w-4 animate-spin') || <DefaultSpinner />
      : null;

    const childContent = isLoading ? <span className="opacity-90">{children}</span> : children;

    return (
      <button
        ref={ref}
        type={type}
        className={classNames(baseClasses, variantClass, className)}
        disabled={resolvedDisabled}
        aria-busy={isLoading}
        data-variant={variant}
        {...props}
      >
        {loadingIconNode && <span className="flex items-center" aria-hidden="true">{loadingIconNode}</span>}
        {leadingIconNode && <span className="flex items-center" aria-hidden="true">{leadingIconNode}</span>}
        {childContent}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;

