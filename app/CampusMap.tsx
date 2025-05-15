import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// import { SafeAreaView } from 'react-native-safe-area-context';
// import { useRouter } from 'expo-router';
// import { Ionicons } from '@expo/vector-icons';
// const INITIAL_REGION = {
//   latitude: -37.72028340781326,
//   longitude: 145.0475279254138,
//   latitudeDelta: 0.01,
//   longitudeDelta: 0.01,
// };
// const CampusMap: React.FC = () => {
//   const router = useRouter();
//   let MapView = null;
//   if (Platform.OS === 'ios' || Platform.OS === 'android') {
//     MapView = require('react-native-maps').default;
//   }
//   return (
//     <SafeAreaView style={styles.safeArea}>
//       <View style={styles.container}>
//         <View style={styles.header}>
//           <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
//             <Ionicons name="arrow-back" size={28} color="#18181b" />
//           </TouchableOpacity>
//           <Text style={styles.headerTitle}>Campus Map</Text>
//         </View>
//         <View style={styles.mapBox}>
//           {MapView ? (
//             <MapView style={styles.map} initialRegion={INITIAL_REGION} />
//           ) : (
//             <Text style={styles.fallbackText}>Map is only available on iOS and Android.</Text>
//           )}
//         </View>
//       </View>
//     </SafeAreaView>
//   );
// };

const CampusMap: React.FC = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.placeholder}>Map commented out due to issues with web view.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  placeholder: { fontSize: 20, color: '#18181b', textAlign: 'center' },
});

export default CampusMap; 
