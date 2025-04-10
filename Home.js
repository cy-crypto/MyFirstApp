import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Alert,
  FlatList
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome5";

export default function Home() {
  const [myFlag ,setmyFlag]=useState(100);
  const Navigation=useNavigation(); 
const ayah=require('./ayah.json')
  const Pressed=() => {
    Navigation.navigate('HomeScreen') 
  }
  const myFlagpressed=()=>{
    console.log(myFlag)
    setmyFlag(myFlag+20);
  }
  const SurahName=ayah.length>0?ayah[0].SurahName:""
  return (
    <View style={styles.mainContainer}>
      <View style={styles.top}>
      <Text style={{fontSize:25,fontWeight:'bold'}}>{SurahName}</Text>
             </View>
      <View style={styles.Center}>
        <FlatList
          data={ayah}
          renderItem={({item})=>(
            <View style={styles.ayahprint}>
              <Text>{item.Id}</Text>
              <Text>{item.AyahTextMuhammadi}</Text>
            </View>
          )}
/>
      </View>

    </View>
  );
}
const styles = StyleSheet.create({
  mainContainer: {
    flex:1,
    backgroundColor: "white",
    
  },
  top: {
    flex: 0.15,
    backgroundColor: '#B0E0E6',
    flexDirection:'column',
    alignItems:"center",
    justifyContent:"center",
    fontSize: 50,
    fontWeight: 'bold',
    color: 'black',
  },
  Center: {
    flex: 0.85,
    flexDirection:'column',
    alignItems:"center",
    justifyContent:"center",
    
  },
  Bottom: {
    flex: 0.25,
    backgroundColor: 'grey',
    flexDirection:'column',
    alignItems:"center",
    justifyContent:"center"
  },
  ayahprint:{
    flexDirection:'column',
    alignItems:'center',
    justifyContent:'center',
    marginBottom:10,
    backgroundColor:'#F0F8FF',
    borderColor:'black',
    borderWidth:0.2,
  }
});
