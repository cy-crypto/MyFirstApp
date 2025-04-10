import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Animated,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";
import { useAppContext } from './AppContext';
import useQuranData from './hooks/useQuranData';
import { homeStyles as styles } from './styles';

export default function Home() {
  const Navigation = useNavigation();
  const { showTafseer } = useAppContext();
  const flatListRef = useRef(null);
  const [showLastReadToast, setShowLastReadToast] = useState(false);
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const hasShownToast = useRef(false);
  
  const {
    visibleAyahs,
    refreshing,
    currentSurah,
    currentPage,
    totalPages,
    paginationText,
    loadNextPage,
    loadPreviousPage,
    loadNextSurah,
    loadPreviousSurah,
    handleRefresh,
    lastPosition
  } = useQuranData();
  
  // Show a toast when returning to the last read position only once per session
  useEffect(() => {
    // Only show toast if:
    // 1. We have a last position with timestamp
    // 2. We have content loaded (visible ayahs)
    // 3. We haven't shown the toast yet this session
    if (lastPosition?.timestamp && visibleAyahs.length > 0 && !hasShownToast.current) {
      hasShownToast.current = true;
      setShowLastReadToast(true);
      
      // Animate toast
      Animated.sequence([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true
        }),
        Animated.delay(3000),
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true
        })
      ]).start(() => {
        setShowLastReadToast(false);
      });
    }
  }, [lastPosition, visibleAyahs.length]);
  
  const goToHomeScreen = () => {
    try {
      Navigation.navigate('Main'); // Try Main first
    } catch (error) {
      try {
        Navigation.navigate('HomeScreen'); // Then try HomeScreen
      } catch (secondError) {
        // If both fail, just go back
        Navigation.goBack();
      }
    }
  };
  
  const onEndReached = () => {
    // When user reaches the end of the current page, load the next page
    loadNextPage();
  };
  
  const handleNextPage = () => {
    loadNextPage();
    // Scroll to top when loading new page
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  const handlePreviousPage = () => {
    loadPreviousPage();
    // Scroll to top when loading new page
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  const handleNextSurah = () => {
    loadNextSurah();
    // Scroll to top when loading new surah
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  const handlePreviousSurah = () => {
    loadPreviousSurah();
    // Scroll to top when loading new surah
    if (flatListRef.current) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
    }
  };
  
  // Simple render for each ayah
  const renderItem = ({ item }) => (
    <View style={styles.ayahContainer}>
      <View style={styles.headerRow}>
        <Text style={styles.headerText}>Taaruf</Text>
        <Text style={styles.surahName}>Surah {item.SurahNameEnglish}</Text>
      </View>
      
      <View style={styles.contentRow}>
        <View style={styles.ayahBox}>
          <Text style={styles.arabicText}>{item.AyahTextMuhammadi}</Text>
          <Text style={styles.ayahNumber}>Ayah {item.AyahNumber}</Text>
        </View>
        <View style={styles.translationBox}>
          <Text style={styles.translationText}>{item.Translation}</Text>
        </View>
      </View>

      {showTafseer && item.Tafseer && (
        <View style={styles.tafseerBox}>
          <Text style={styles.tafseerLabel}>Tafseer:</Text>
          <Text style={styles.tafseerText}>{item.Tafseer}</Text>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.mainContainer}>
      {showLastReadToast && (
        <Animated.View style={[styles.toastContainer, { opacity: toastOpacity }]}>
          <Icon name="bookmark" size={16} color="#FFFFFF" style={styles.toastIcon} />
          <Text style={styles.toastText}>Resuming from your last read position</Text>
        </Animated.View>
      )}
      
      <View style={styles.topBar}>
        <TouchableOpacity onPress={goToHomeScreen} style={styles.backButton}>
          <Icon name="arrow-left" size={20} color="#333" />
          <Text style={styles.backButtonText}>Home</Text>
        </TouchableOpacity>
        
        <View style={styles.pageIndicatorHeader}>
          <Text style={styles.paginationTextHeader}>{paginationText}</Text>
        </View>
      </View>
      
      <View style={styles.contentContainer}>
        <FlatList
          ref={flatListRef}
          data={visibleAyahs}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.SurahNumber}-${item.AyahNumber}-${index}`}
          contentContainerStyle={styles.flatListContent}
          showsVerticalScrollIndicator={true}
          onEndReached={onEndReached}
          onEndReachedThreshold={0.1}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={["#81b0ff"]}
              tintColor="#81b0ff"
              title="Loading previous surah..."
              titleColor="#81b0ff"
            />
          }
          ListEmptyComponent={
            <View style={styles.noDataContainer}>
              <Text style={styles.noDataText}>Loading Quran content...</Text>
            </View>
          }
        />
        
        <View style={styles.pageNavigation}>
          <TouchableOpacity 
            onPress={handlePreviousPage} 
            style={[
              styles.pageNavButton, 
              currentPage === 0 ? styles.pageNavButtonAlt : null
            ]}
          >
            <Icon 
              name="arrow-left" 
              size={16} 
              color="#333" 
            />
            <Text 
              style={styles.pageNavText}
            >
              {currentPage === 0 ? "Previous Surah" : "Previous Page"}
            </Text>
          </TouchableOpacity>
          
          <Text style={styles.pageIndicator}>
            {`${currentPage + 1}/${totalPages || 1}`}
          </Text>
          
          <TouchableOpacity 
            onPress={currentPage >= totalPages - 1 ? handleNextSurah : handleNextPage}
            style={styles.pageNavButton}
          >
            <Text style={styles.pageNavText}>
              {currentPage >= totalPages - 1 ? "Next Surah" : "Next Page"}
            </Text>
            <Icon name="arrow-right" size={16} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
