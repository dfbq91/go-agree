import React, { useState, useEffect, useId } from 'react';

export interface TooltipProps {
  content: string;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'right' | 'left';
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position: _position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isVisible) {
        setIsVisible(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  const child = children as React.ReactElement<any>;
  const trigger = React.cloneElement(child, {
    'aria-describedby': isVisible ? tooltipId : undefined,
    onMouseEnter: (e: React.MouseEvent) => {
      setIsVisible(true);
      child.props.onMouseEnter?.(e);
    },
    onMouseLeave: (e: React.MouseEvent) => {
      setIsVisible(false);
      child.props.onMouseLeave?.(e);
    },
    onFocus: (e: React.FocusEvent) => {
      setIsVisible(true);
      child.props.onFocus?.(e);
    },
    onBlur: (e: React.FocusEvent) => {
      setIsVisible(false);
      child.props.onBlur?.(e);
    },
  });

  return (
    <div className="relative inline-block">
      {trigger}
      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          className="absolute z-30 w-64 p-3 text-xs text-white bg-gray-900 rounded-lg shadow-xl -translate-x-1/2 left-1/2 bottom-full mb-2 pointer-events-none leading-normal animate-fade-in"
        >
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 left-1/2 -translate-x-1/2 top-full -mt-1" />
        </div>
      )}
    </div>
  );
};
