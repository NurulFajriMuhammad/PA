import React from 'react';

const Notification = ({ message, type, onDismiss }) => {
  if (!message) return null;

  const bgColor = type === 'error' ? 'bg-red-600' : 'bg-green-600';

  return (
    <div className={`fixed top-5 right-5 ${bgColor} text-white py-2 px-4 rounded-lg shadow-lg flex items-center z-50`}>
      <span>{message}</span>
      <button onClick={onDismiss} className="ml-2 text-white font-bold">&times;</button>
    </div>
  );
};

export default Notification;