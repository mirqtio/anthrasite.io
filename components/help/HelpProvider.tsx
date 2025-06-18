'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { HelpWidgetConfig, DEFAULT_HELP_CONFIG, HelpWidgetState, HelpTab } from '@/lib/help/types';

/**
 * Help Widget Context
 */
interface HelpWidgetContextValue {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isMinimized: boolean;
  setIsMinimized: (minimized: boolean) => void;
  config: HelpWidgetConfig;
  updateConfig: (config: Partial<HelpWidgetConfig>) => void;
  state: HelpWidgetState;
  updateState: (state: Partial<HelpWidgetState>) => void;
}

const HelpWidgetContext = createContext<HelpWidgetContextValue | undefined>(undefined);

/**
 * Help Widget Provider Props
 */
interface HelpWidgetProviderProps {
  children: React.ReactNode;
  config?: Partial<HelpWidgetConfig>;
  enabled?: boolean;
}

/**
 * Help Widget Provider Component
 */
export const HelpWidgetProvider: React.FC<HelpWidgetProviderProps> = ({ 
  children, 
  config: initialConfig,
  enabled = true,
}) => {
  // Merge initial config with defaults
  const [config, setConfig] = useState<HelpWidgetConfig>({
    ...DEFAULT_HELP_CONFIG,
    ...initialConfig,
  });

  // Widget state
  const [state, setState] = useState<HelpWidgetState>({
    isOpen: false,
    isMinimized: false,
    activeTab: HelpTab.FAQ,
    searchQuery: '',
    searchResults: [],
    isSearching: false,
    selectedFAQ: undefined,
    hasUnreadNotifications: false,
  });

  // Convenience state accessors
  const isOpen = state.isOpen;
  const isMinimized = state.isMinimized;

  // State setters
  const setIsOpen = useCallback((open: boolean) => {
    setState(prev => ({ ...prev, isOpen: open }));
    
    // Analytics tracking
    if (typeof window !== 'undefined' && window.dataLayer) {
      window.dataLayer.push({
        event: 'help_widget_toggle',
        help_widget_open: open,
      });
    }
  }, []);

  const setIsMinimized = useCallback((minimized: boolean) => {
    setState(prev => ({ ...prev, isMinimized: minimized }));
  }, []);

  const updateConfig = useCallback((newConfig: Partial<HelpWidgetConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const updateState = useCallback((newState: Partial<HelpWidgetState>) => {
    setState(prev => ({ ...prev, ...newState }));
  }, []);

  // Persist state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const savedState = localStorage.getItem('help-widget-state');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setState(prev => ({
          ...prev,
          isMinimized: parsed.isMinimized || false,
          hasUnreadNotifications: parsed.hasUnreadNotifications || false,
        }));
      } catch (error) {
        console.error('Failed to parse saved help widget state:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const stateToSave = {
      isMinimized: state.isMinimized,
      hasUnreadNotifications: state.hasUnreadNotifications,
    };
    localStorage.setItem('help-widget-state', JSON.stringify(stateToSave));
  }, [state.isMinimized, state.hasUnreadNotifications]);

  // Prevent multiple instances
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if another instance exists
    const existingInstance = (window as any).__helpWidgetInstance;
    if (existingInstance && existingInstance !== true) {
      console.warn('Multiple HelpWidgetProvider instances detected. Only one instance should be used.');
    }
    (window as any).__helpWidgetInstance = true;

    return () => {
      (window as any).__helpWidgetInstance = false;
    };
  }, []);

  const value: HelpWidgetContextValue = {
    isOpen,
    setIsOpen,
    isMinimized,
    setIsMinimized,
    config,
    updateConfig,
    state,
    updateState,
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <HelpWidgetContext.Provider value={value}>
      {children}
    </HelpWidgetContext.Provider>
  );
};

/**
 * Hook to use Help Widget context
 */
export const useHelpWidget = () => {
  const context = useContext(HelpWidgetContext);
  if (!context) {
    throw new Error('useHelpWidget must be used within a HelpWidgetProvider');
  }
  return context;
};

/**
 * Hook to check if help widget is available
 */
export const useHelpWidgetAvailable = () => {
  const context = useContext(HelpWidgetContext);
  return context !== undefined;
};