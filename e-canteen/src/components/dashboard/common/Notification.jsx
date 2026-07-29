import React from 'react';
import Toast from '../../ui/Toast';

export default function Notification({ notification }) {
  if (!notification) return null;
  return <Toast notification={notification} />;
}