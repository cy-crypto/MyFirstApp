import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Create the context
const AppContext = createContext();

// Create a provider component
export const AppProvider = ({ children }) => {
  const [showTafseer, setShowTafseer] = useState(true);
  const [isUrduTranslation, setIsUrduTranslation] = useState(true);
  const [lastReadPosition, setLastReadPosition] = useState(null);

  // Load settings from storage when the app starts
  useEffect(() => {
    const loadSettings = async () => {
      try {
        console.log("Loading app settings...");
        const storedShowTafseer = await AsyncStorage.getItem('showTafseer');
        const storedIsUrduTranslation = await AsyncStorage.getItem('isUrduTranslation');
        const storedLastReadPosition = await AsyncStorage.getItem('lastReadPosition');
        
        if (storedShowTafseer !== null) {
          setShowTafseer(JSON.parse(storedShowTafseer));
        }
        
        if (storedIsUrduTranslation !== null) {
          setIsUrduTranslation(JSON.parse(storedIsUrduTranslation));
        }

        if (storedLastReadPosition !== null) {
          const position = JSON.parse(storedLastReadPosition);
          console.log("Context loaded position:", position);
          setLastReadPosition(position);
        }
      } catch (error) {
        console.log('Error loading settings:', error);
      }
    };
    
    loadSettings();
  }, []);

  // Save settings when they change
  useEffect(() => {
    const saveSettings = async () => {
      try {
        await AsyncStorage.setItem('showTafseer', JSON.stringify(showTafseer));
        await AsyncStorage.setItem('isUrduTranslation', JSON.stringify(isUrduTranslation));
      } catch (error) {
        console.log('Error saving settings:', error);
      }
    };
    
    saveSettings();
  }, [showTafseer, isUrduTranslation]);
  
  // Save lastReadPosition when it changes
  useEffect(() => {
    const saveLastReadPosition = async () => {
      if (lastReadPosition) {
        try {
          await AsyncStorage.setItem('lastReadPosition', JSON.stringify(lastReadPosition));
          console.log("Context saved position:", lastReadPosition);
        } catch (error) {
          console.log('Error saving last read position:', error);
        }
      }
    };
    
    saveLastReadPosition();
  }, [lastReadPosition]);

  // Functions to toggle settings
  const toggleTafseer = () => {
    setShowTafseer(prev => !prev);
  };

  const toggleLanguage = () => {
    setIsUrduTranslation(prev => !prev);
  };

  // Function to update last read position
  const updateLastReadPosition = (position) => {
    console.log("Updating last read position:", position);
    setLastReadPosition(position);
  };

  return (
    <AppContext.Provider 
      value={{ 
        showTafseer, 
        isUrduTranslation, 
        lastReadPosition,
        toggleTafseer, 
        toggleLanguage,
        updateLastReadPosition
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

// Custom hook to use the context
export const useAppContext = () => useContext(AppContext); 