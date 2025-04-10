import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from "react-native-vector-icons/FontAwesome5";
import { useAppContext } from './AppContext';

export default function Settings() {
  const navigation = useNavigation();
  const { showTafseer, isUrduTranslation, toggleTafseer, toggleLanguage } = useAppContext();

  return (
    <View style={styles.mainContainer}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>Settings</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.settingsContainer}>
        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Show Tafseer</Text>
            <Text style={styles.settingDescription}>Toggle Tafseer visibility</Text>
          </View>
          <Switch
            value={showTafseer}
            onValueChange={toggleTafseer}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={showTafseer ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>Translation Language</Text>
            <Text style={styles.settingDescription}>
              {isUrduTranslation ? 'Currently: Urdu' : 'Currently: English'}
            </Text>
          </View>
          <Switch
            value={isUrduTranslation}
            onValueChange={toggleLanguage}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isUrduTranslation ? '#f5dd4b' : '#f4f3f4'}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F8FF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    padding: 8,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  settingsContainer: {
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F0F8FF',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
}); 