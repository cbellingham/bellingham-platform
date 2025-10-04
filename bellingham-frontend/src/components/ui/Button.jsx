import React, { cloneElement, forwardRef, isValidElement } from 'react';

const classNames = (...classes) => classes.filter(Boolean).join(' ');

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold uppercase tracking-[0.22em] transition-transform transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60';

const variantClasses = {
  primary:
    'border border-transparent bg-[linear-gradient(140deg,rgba(38,78,130,0.95),rgba(27,52,92,0.88))] text-[#9BD8FF] shadow-[0_22px_55px_rgba(22,42,78,0.55)] hover:shadow-[0_26px_70px_rgba(22,42,78,0.6)] hover:border-[#4DD1FF]/60 focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-[#050912] hover:-translate-y-0.5',
  success: 'bg-green-600 text-white hover:bg-green-500 focus-visible:ring-green-500',
  danger: 'bg-red-600 text-white hover:bg-red-500 focus-visible:ring-red-500',
  ghost:
    'border border-transparent bg-[rgba(14,24,44,0.75)] text-slate-200 shadow-[0_14px_32px_rgba(5,10,25,0.55)] hover:border-[#4DD1FF]/60 hover:bg-[rgba(20,36,70,0.65)] focus-visible:ring-[#4DD1FF] focus-visible:ring-offset-[#050912]',
  link:
    'bg-transparent px-0 py-0 text-[#00D1FF] underline-offset-4 hover:text-[#3BAEAB] hover:underline focus-visible:ring-[#00D1FF] focus-visible:ring-offset-0 rounded-none',
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

