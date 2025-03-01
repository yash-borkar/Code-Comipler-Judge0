// ui/tabs.jsx
import { createContext, useContext, useState } from 'react';

const TabsContext = createContext({
  value: '',
  onValueChange: () => {},
});

export function Tabs({ children, value, onValueChange, className = "" }) {
  const contextValue = { value, onValueChange };
  
  return (
    <TabsContext.Provider value={contextValue}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div className={`flex ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ children, value, className = "" }) {
  const context = useContext(TabsContext);
  const isActive = context.value === value;
  
  return (
    <button
      className={`px-4 py-2 font-medium transition-colors ${isActive ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200'} ${className}`}
      onClick={() => context.onValueChange(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className = "" }) {
  const context = useContext(TabsContext);
  
  if (context.value !== value) {
    return null;
  }
  
  return (
    <div className={className}>
      {children}
    </div>
  );
}