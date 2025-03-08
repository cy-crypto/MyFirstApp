import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View,Image } from 'react-native';
import Icon from "react-native-vector-icons/FontAwesome5"; // Using FontAwesome icons
export default function App() {
  return (
   <View style={{flex:1,backgroundColor:'blue'}}>
<View style={{ backgroundColor: 'blue', flex: 0.40 ,alignItems:'center',justifyContent:'center',borderRadius:10}}>
  <Text style={{marginBottom:10,fontWeight:'bold'}}>
    Quran    
  </Text>
  <Image
    style={styles.tinyLogo }
    source={{
      uri: 'https://freesvg.org/img/1617121917logo%20quran%20islamic.png',
    }}
  />
</View>


      <View style={{backgroundColor:'white',flex:0.60,borderRadius:20}} >
        <View style={{alignItems:'center'}}>
        <Text style={{marginTop:10 ,color:'black',fontWeight:'900',fontSize:20}}>
          FEATURES
        </Text>
        </View>

        <View style={styles.featuredBoxParent}>
          <View style={styles.featuredBoxChild}>
            <Icon name='book-open' size={50} />
            <Text style={styles.featuredBoxText}>
              Read Quran
            </Text>
          </View>
        <View style={styles.featuredBoxChild}>
      <Icon name='search' size={50}/>
      <Text style={styles.featuredBoxText}>
       Search
      </Text>
      </View>
        </View>

        <View style={styles.featuredBoxParent}>
          <View style={styles.featuredBoxChild}>
         <Icon name='bookmark' size={50} color={'black'}/>
      <Text style={styles.featuredBoxText}>
       Book Mark
      </Text>
      </View>
        <View style={styles.featuredBoxChild}>
      <Icon name='cog' size={50}/>
      <Text style={styles.featuredBoxText}>
        Settings
      </Text>
      </View>
        </View>

      </View>
    
   </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
    tinyLogo: {
      width: 100,  // Adjust as needed
      height: 100, // Adjust as needed
    },
    featuredBoxChild:{
      alignItems:'center',
      borderWidth:1,
      borderRadius:10,
      height:100,
      width:100
    },
    featuredBoxParent:{
      display:'flex',
      flexDirection:'row',
      gap:80,
      margin:20,
      justifyContent:'center'
    },
    featuredBoxText:{
      margin:5,
      fontSize:15,
      fontWeight:'bold'
    }

});
