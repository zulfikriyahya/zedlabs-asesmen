import { useState, useEffect } from 'react'; // Assuming React/Preact usage in islands, or just pure JS logic below

// Pure JS implementation for Astro scripts
export class OnlineStatusTracker {
  private listeners: ((isOnline: boolean) => void)[] = [];
  public isOnline: boolean;

  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    
    if (typeof window !== 'undefined') {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
    }
  }

  private handleOnline = () => {
    this.isOnline = true;
    this.notify();
  };

  private handleOffline = () => {
    this.isOnline = false;
    this.notify();
  };

  public subscribe(listener: (isOnline: boolean) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.isOnline));
  }

  public cleanup() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }
}

export const onlineStatus = new OnlineStatusTracker();