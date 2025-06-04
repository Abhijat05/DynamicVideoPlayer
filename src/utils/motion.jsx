import React from 'react'

export const fadeIn = (direction) => {
  return {
    hidden: {
      opacity: 0,
      y: direction === 'up' ? 20 : direction === 'down' ? -20 : 0,
      x: direction === 'left' ? 20 : direction === 'right' ? -20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      transition: {
        duration: 0.3,
        ease: 'easeOut',
      },
    },
  }
}

// Adding mock framer-motion functionality
export const motion = {
  div: ({ children, ...props }) => <div {...props}>{children}</div>,
  ul: ({ children, ...props }) => <ul {...props}>{children}</ul>,
  li: ({ children, ...props }) => <li {...props}>{children}</li>,
  button: ({ children, ...props }) => <button {...props}>{children}</button>,
}