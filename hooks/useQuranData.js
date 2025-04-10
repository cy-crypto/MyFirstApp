import { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Last 10 surahs IDs (from 105 to 114)
const LAST_TEN_SURAHS = [
  { id: "105", name: "Al-Fil" },
  { id: "106", name: "Quraysh" },
  { id: "107", name: "Al-Ma'un" },
  { id: "108", name: "Al-Kawthar" },
  { id: "109", name: "Al-Kafirun" },
  { id: "110", name: "An-Nasr" },
  { id: "111", name: "Al-Masad" },
  { id: "112", name: "Al-Ikhlas" },
  { id: "113", name: "Al-Falaq" },
  { id: "114", name: "An-Nas" }
];

// Number of ayahs to load at a time
export const AYAHS_PER_PAGE = 10;

// Cache for consolidated data
let consolidatedDataCache = {
  english: null,
  urdu: null
};

export default function useQuranData() {
  const { isUrduTranslation, updateLastReadPosition } = useAppContext();
  const [allAyahData, setAllAyahData] = useState([]);
  const [currentSurahIndex, setCurrentSurahIndex] = useState(0);
  const [visibleAyahs, setVisibleAyahs] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastPosition, setLastPosition] = useState(null);
  const [positionLoaded, setPositionLoaded] = useState(false);
  const initialLoadComplete = useRef(false);
  const positionUpdatePending = useRef(false);
  
  // Load last position on mount - this must happen first
  useEffect(() => {
    const loadLastPosition = async () => {
      try {
        console.log("Loading last position...");
        const storedPosition = await AsyncStorage.getItem('lastReadPosition');
        if (storedPosition) {
          const position = JSON.parse(storedPosition);
          console.log("Found stored position:", position);
          setLastPosition(position);
          setCurrentSurahIndex(position.surahIndex || 0);
          setCurrentPage(position.page || 0);
        } else {
          console.log("No stored position found");
        }
        // Mark position loading as complete whether we found a position or not
        setPositionLoaded(true);
      } catch (error) {
        console.error('Error loading last position:', error);
        setPositionLoaded(true); // Still mark as complete so the app can proceed
      }
    };
    
    loadLastPosition();
  }, []);
  
  // Save position when it changes
  useEffect(() => {
    if (positionUpdatePending.current) return;
    
    const savePosition = async () => {
      if (initialLoadComplete.current && allAyahData.length > 0) {
        const position = {
          surahIndex: currentSurahIndex,
          page: currentPage,
          timestamp: new Date().toISOString()
        };
        
        // Only update if position has changed from last saved position
        if (!lastPosition || 
            lastPosition.surahIndex !== position.surahIndex || 
            lastPosition.page !== position.page) {
          
          try {
            await AsyncStorage.setItem('lastReadPosition', JSON.stringify(position));
            console.log("Saved position:", position);
            
            // Use this flag to prevent further updates while this one is in progress
            positionUpdatePending.current = true;
            
            // Only call context update if the component is still mounted
            updateLastReadPosition(position);
            
            // Update local state
            setLastPosition(position);
            
            // Reset the flag after a short delay
            setTimeout(() => {
              positionUpdatePending.current = false;
            }, 100);
          } catch (error) {
            console.error('Error saving position:', error);
            positionUpdatePending.current = false;
          }
        }
      }
    };
    
    savePosition();
  }, [currentSurahIndex, currentPage, allAyahData.length]);
  
  // Consolidate and optimize JSON data - runs only once on component mount
  useEffect(() => {
    const consolidateData = () => {
      try {
        // Load both JSON files
        const urduData = require('../urdu.json');
        const englishData = require('../english.json');
        
        // Process and optimize both datasets
        consolidatedDataCache = {
          urdu: processAndOptimizeData(urduData),
          english: processAndOptimizeData(englishData)
        };
        
        console.log("Data consolidated successfully");
        setDataLoaded(true);
      } catch (error) {
        console.error('Error consolidating data:', error);
        // Fallback to original loading method
        setDataLoaded(true);
      }
    };
    
    consolidateData();
  }, []);
  
  // Process and optimize the data, keeping only essential fields
  const processAndOptimizeData = (jsonData) => {
    // Keep only the last 10 surahs (105-114)
    const filteredData = jsonData.filter(item => {
      return LAST_TEN_SURAHS.some(surah => 
        item.SurahNumber === parseInt(surah.id) || 
        item.SurahName === surah.name
      );
    });
    
    // Keep only essential fields and organize by surah
    const optimizedData = [];
    
    for (const surah of LAST_TEN_SURAHS) {
      const surahId = parseInt(surah.id);
      const surahAyahs = filteredData.filter(item => 
        item.SurahNumber === surahId || 
        item.SurahName === surah.name
      );
      
      if (surahAyahs.length > 0) {
        // Create optimized objects with only the fields we need
        const optimizedAyahs = surahAyahs.map(ayah => ({
          AyahNumber: ayah.AyahNumber,
          AyahTextMuhammadi: ayah.AyahTextMuhammadi,
          SurahNumber: ayah.SurahNumber,
          SurahName: ayah.SurahName,
          SurahNameEnglish: ayah.SurahNameEnglish,
          Translation: ayah.Translation,
          Tafseer: ayah.Tafseer
        }));
        
        optimizedData.push({
          surahId: surah.id,
          surahName: surah.name,
          ayahs: optimizedAyahs
        });
      }
    }
    
    return optimizedData;
  };
  
  // Load data based on selected language - only after position is loaded
  useEffect(() => {
    // Wait for both data and position to be loaded
    if (!dataLoaded || !positionLoaded) return;
    console.log("Loading data with position:", lastPosition);
    
    try {
      // Use consolidated data if available
      if (consolidatedDataCache && 
          (isUrduTranslation ? consolidatedDataCache.urdu : consolidatedDataCache.english)) {
        
        const groupedBySurah = isUrduTranslation 
          ? consolidatedDataCache.urdu 
          : consolidatedDataCache.english;
        
        setAllAyahData(groupedBySurah);
        
        // Set initial ayahs based on last position or default
        if (groupedBySurah.length > 0) {
          // If we have a last position, use that
          if (lastPosition && lastPosition.surahIndex !== undefined && lastPosition.page !== undefined) {
            console.log("Using saved position:", lastPosition);
            const safeIndex = Math.min(lastPosition.surahIndex, groupedBySurah.length - 1);
            const surah = groupedBySurah[safeIndex];
            
            if (surah && surah.ayahs) {
              const maxPages = Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
              const safePage = Math.min(lastPosition.page, maxPages - 1);
              
              const start = safePage * AYAHS_PER_PAGE;
              const end = Math.min(start + AYAHS_PER_PAGE, surah.ayahs.length);
              
              console.log(`Loading surah ${safeIndex}, page ${safePage}, ayahs ${start}-${end}`);
              setVisibleAyahs(surah.ayahs.slice(start, end));
              setCurrentSurahIndex(safeIndex);
              setCurrentPage(safePage);
            } else {
              // Fallback to default
              setVisibleAyahs(groupedBySurah[0].ayahs.slice(0, AYAHS_PER_PAGE));
            }
          } else {
            // No last position, use default
            console.log("No position found, using default");
            setVisibleAyahs(groupedBySurah[0].ayahs.slice(0, AYAHS_PER_PAGE));
          }
          
          initialLoadComplete.current = true;
        }
        
        return;
      }
      
      // Fallback loading method
      const jsonData = isUrduTranslation 
        ? require('../urdu.json') 
        : require('../english.json');
      
      // Filter and process data
      const filteredData = jsonData.filter(item => {
        return LAST_TEN_SURAHS.some(surah => 
          item.SurahNumber === parseInt(surah.id) || 
          item.SurahName === surah.name
        );
      });
      
      // Group by Surah
      const groupedBySurah = [];
      for (const surah of LAST_TEN_SURAHS) {
        const surahId = parseInt(surah.id);
        const surahAyahs = filteredData.filter(item => 
          item.SurahNumber === surahId || 
          item.SurahName === surah.name
        );
        
        if (surahAyahs.length > 0) {
          groupedBySurah.push({
            surahId: surah.id,
            surahName: surah.name,
            ayahs: surahAyahs
          });
        }
      }
      
      setAllAyahData(groupedBySurah);
      
      // Load initial ayahs (last position or default)
      if (groupedBySurah.length > 0) {
        if (lastPosition && lastPosition.surahIndex !== undefined && lastPosition.page !== undefined) {
          console.log("Using saved position (fallback):", lastPosition);
          const safeIndex = Math.min(lastPosition.surahIndex, groupedBySurah.length - 1);
          const surah = groupedBySurah[safeIndex];
          
          if (surah && surah.ayahs) {
            const maxPages = Math.ceil(surah.ayahs.length / AYAHS_PER_PAGE);
            const safePage = Math.min(lastPosition.page, maxPages - 1);
            
            const start = safePage * AYAHS_PER_PAGE;
            const end = Math.min(start + AYAHS_PER_PAGE, surah.ayahs.length);
            
            console.log(`Loading surah ${safeIndex}, page ${safePage}, ayahs ${start}-${end} (fallback)`);
            setVisibleAyahs(surah.ayahs.slice(start, end));
            setCurrentSurahIndex(safeIndex);
            setCurrentPage(safePage);
          } else {
            setVisibleAyahs(groupedBySurah[0].ayahs.slice(0, AYAHS_PER_PAGE));
          }
        } else {
          // No last position, use default
          console.log("No position found, using default (fallback)");
          setVisibleAyahs(groupedBySurah[0].ayahs.slice(0, AYAHS_PER_PAGE));
        }
        
        initialLoadComplete.current = true;
      }
    } catch (error) {
      console.error('Error loading data:', error);
    }
  }, [isUrduTranslation, dataLoaded, positionLoaded, lastPosition]);
  
  const loadAyahPage = (surahIndex, page) => {
    if (!allAyahData[surahIndex]) return;
    
    const surahAyahs = allAyahData[surahIndex].ayahs;
    const start = page * AYAHS_PER_PAGE;
    
    // If we're past the end of this surah, move to next surah first page
    if (start >= surahAyahs.length) {
      // Use positionUpdatePending to prevent multiple position updates
      positionUpdatePending.current = true;
      
      const nextSurahIndex = (surahIndex + 1) % allAyahData.length;
      setCurrentSurahIndex(nextSurahIndex);
      setCurrentPage(0);
      
      // Always load the first page of the next surah
      const nextSurahAyahs = allAyahData[nextSurahIndex].ayahs;
      const pageAyahs = nextSurahAyahs.slice(0, Math.min(AYAHS_PER_PAGE, nextSurahAyahs.length));
      setVisibleAyahs(pageAyahs);
      
      // Reset the flag after a short delay to allow state to settle
      setTimeout(() => {
        positionUpdatePending.current = false;
      }, 100);
      
      return;
    }
    
    // Get the next batch of ayahs
    const end = Math.min(start + AYAHS_PER_PAGE, surahAyahs.length);
    const pageAyahs = surahAyahs.slice(start, end);
    
    setVisibleAyahs(pageAyahs);
    setCurrentSurahIndex(surahIndex);
    setCurrentPage(page);
  };
  
  const loadNextPage = () => {
    loadAyahPage(currentSurahIndex, currentPage + 1);
  };
  
  const loadPreviousPage = () => {
    if (currentPage > 0) {
      loadAyahPage(currentSurahIndex, currentPage - 1);
    } else {
      // If we're at the first page, go to the last page of the previous surah
      positionUpdatePending.current = true;
      
      const prevSurahIndex = (currentSurahIndex - 1 + allAyahData.length) % allAyahData.length;
      const prevSurahAyahs = allAyahData[prevSurahIndex]?.ayahs || [];
      const lastPage = Math.max(0, Math.ceil(prevSurahAyahs.length / AYAHS_PER_PAGE) - 1);
      
      setCurrentSurahIndex(prevSurahIndex);
      setCurrentPage(lastPage);
      
      // Get ayahs for the last page
      const start = lastPage * AYAHS_PER_PAGE;
      const end = Math.min(start + AYAHS_PER_PAGE, prevSurahAyahs.length);
      setVisibleAyahs(prevSurahAyahs.slice(start, end));
      
      // Reset the flag after a short delay
      setTimeout(() => {
        positionUpdatePending.current = false;
      }, 100);
    }
  };
  
  const loadNextSurah = () => {
    if (allAyahData.length === 0) return;
    
    const nextIndex = (currentSurahIndex + 1) % allAyahData.length;
    setCurrentSurahIndex(nextIndex);
    setCurrentPage(0);
    loadAyahPage(nextIndex, 0);
  };
  
  const loadPreviousSurah = () => {
    if (allAyahData.length === 0) return;
    
    const prevIndex = (currentSurahIndex - 1 + allAyahData.length) % allAyahData.length;
    setCurrentSurahIndex(prevIndex);
    setCurrentPage(0);
    loadAyahPage(prevIndex, 0);
  };
  
  // Handle pull-to-refresh to load previous surah
  const handleRefresh = () => {
    setRefreshing(true);
    loadPreviousSurah();
    
    // End refreshing after a delay
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };
  
  // Get the current surah info for display
  const currentSurah = allAyahData[currentSurahIndex];
  const totalPages = currentSurah ? Math.ceil(currentSurah.ayahs.length / AYAHS_PER_PAGE) : 0;
  const paginationText = totalPages > 0 ? `Page ${currentPage + 1} of ${totalPages}` : '';
  
  return {
    // State
    visibleAyahs,
    refreshing,
    currentSurah,
    currentPage,
    totalPages,
    paginationText,
    lastPosition,
    
    // Actions
    loadNextPage,
    loadPreviousPage,
    loadNextSurah,
    loadPreviousSurah,
    handleRefresh
  };
} 