import { useNavigation, useRoute } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, Alert,route } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5"; 

export default function HomeScreen() {
const Navigation=useNavigation();
//const route=useRoute();
//const {Value}=route.params;
const readQuran=()=>{
  Navigation.navigate('Home')
}

const goToSettings = () => {
  Navigation.navigate('Settings');
};

     const createTwoButtonAlert = () => {
    Alert.alert(  
      'Alert', 
      'Yes Pressed', 
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        { text: 'OK', onPress: () => console.log('OK Pressed') }
      ]
    );
  };

  return (

    <View style={{ flex: 1, backgroundColor: 'blue' }}>
           
      <View style={{ backgroundColor: 'blue', flex: 0.40, alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}>
        <Text style={{ marginBottom: 10, fontWeight: 'bold', fontSize: 30, color: 'white' }}>
          Quran
        </Text>
        <Image
          style={styles.tinyLogo}
          source={{ uri: 'https://freesvg.org/img/1617121917logo%20quran%20islamic.png' }}
        />
      </View>

      <View style={{ backgroundColor: 'white', flex: 0.60, borderRadius: 20 }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ marginTop: 10, color: 'black', fontWeight: '900', fontSize: 20 }}>
            FEATURES
          </Text>
        </View>

        <View style={styles.featuredBoxParent}>
          <TouchableOpacity onPress={readQuran} style={styles.featuredBoxChild}>
            <Icon name='book-open' size={50} />
            <Text style={styles.featuredBoxText}>
              Read Quran 
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={createTwoButtonAlert} style={styles.featuredBoxChild}>
            <Icon name='search' size={50} />
            <Text style={styles.featuredBoxText}>
              Search
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.featuredBoxParent}>
          <TouchableOpacity onPress={createTwoButtonAlert} style={styles.featuredBoxChild}>
            <Icon name='bookmark' size={50} color={'black'} />
            <Text style={styles.featuredBoxText}>
              Book Mark
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={goToSettings} style={styles.featuredBoxChild}>
            <Icon name='cog' size={50} />
            <Text style={styles.featuredBoxText}>
              Settings
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tinyLogo: {
    width: 100,
    height: 100,
  },
  featuredBoxChild: {
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    height: 100,
    width: 100,
  },
  featuredBoxParent: {
    flexDirection: 'row',
    gap: 80,
    margin: 20,
    justifyContent: 'center',
  },
  featuredBoxText: {
    margin: 5,
    fontSize: 15,
    fontWeight: 'bold',
  },
});
