import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Session {
  id: string;
  subject: string;
  subjectName?: string;
  locationName: string;
  date: string;
  time: string;
  description?: string;
  createdBy: string;
  hostName?: string;
  attendeeCount?: number;
  attendeeLimit?: number;
}

interface LocationMeta {
  name: string;
  type: string;
  description: string;
  facilities: string[];
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

const CAMPUS_LOCATIONS: LocationMeta[] = [
  {
    name: 'Agora',
    type: 'Study Space',
    description: 'Central hub for students with food, study spaces, and social areas.',
    facilities: ['WiFi', 'Food', 'Lounges', 'Group Study Tables'],
  },
  {
    name: 'Borchardt Library',
    type: 'Library',
    description: 'The main library at La Trobe Bundoora with multiple study areas, computer labs, and quiet zones.',
    facilities: ['WiFi', 'Computers', 'Printing', 'Group Study Rooms', 'Silent Study Areas'],
  },
  {
    name: 'Donald Whitehead Building',
    type: 'Academic',
    description: 'Academic building with lecture theatres and tutorial rooms.',
    facilities: ['WiFi', 'Lecture Theatres', 'Tutorial Rooms'],
  },
  {
    name: 'Online Learning Zone',
    type: 'Online',
    description: 'Virtual space for remote and online study sessions.',
    facilities: ['WiFi', 'Virtual Collaboration'],
  },
  {
    name: 'The Learning Commons (TLC)',
    type: 'Study Space',
    description: 'Collaborative learning space with group and individual study areas.',
    facilities: ['WiFi', 'Group Study', 'Individual Study'],
  },
];

const LOCATION_COORDINATES: Record<string, Coordinates> = {
  'Agora': { latitude: -37.72064501987044, longitude: 145.0483574963817 },
  'Borchardt Library': { latitude: -37.719987719297116, longitude: 145.04841651555452 },
  'Donald Whitehead Building': { latitude: -37.7212, longitude: 145.0495 },
  'Online Learning Zone': { latitude: -37.7220, longitude: 145.0500 },
  'The Learning Commons (TLC)': { latitude: -37.7202, longitude: 145.0478 },
};

const PIN_COLORS = ['#FF3B30', '#007AFF', '#34C759', '#FF9500', '#AF52DE', '#FFCC00'];

const INITIAL_REGION = {
  latitude: -37.719987719297116,
  longitude: 145.04841651555452,
  latitudeDelta: 0.003,
  longitudeDelta: 0.003,
};

const CampusMap: React.FC = () => {
  const router = useRouter();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<LocationMeta | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const sessionsCol = collection(db, 'sessions');
        const sessionSnapshot = await getDocs(sessionsCol);
        const sessionList = sessionSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Session[];
        setSessions(sessionList);
      } catch (error) {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Group sessions by location
  const locationSessions: Record<string, Session[]> = sessions.reduce((acc, session) => {
    if (!acc[session.locationName]) acc[session.locationName] = [];
    acc[session.locationName].push(session);
    return acc;
  }, {} as Record<string, Session[]>);

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={28} color="#18181b" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Campus Map</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Interactive Map Area */}
        <View style={styles.mapArea}>
          {Platform.OS !== 'web' ? (
            <MapView
              style={styles.map}
              initialRegion={INITIAL_REGION}
              provider={PROVIDER_GOOGLE}
              showsUserLocation
              showsMyLocationButton
            >
              {CAMPUS_LOCATIONS.map((loc, idx) => {
                const count = locationSessions[loc.name]?.length || 0;
                const coordinates = LOCATION_COORDINATES[loc.name];
                if (!coordinates) return null;
                return (
                  <Marker
                    key={loc.name}
                    coordinate={coordinates}
                    pinColor={PIN_COLORS[idx % PIN_COLORS.length]}
                    onPress={() => setSelectedLocation(loc)}
                  >
                    <Callout tooltip>
                      <View style={styles.calloutContainer}>
                        <Text style={styles.calloutTitle}>{loc.name}</Text>
                        <Text style={styles.calloutText}>{count} session{count !== 1 ? 's' : ''}</Text>
                      </View>
                    </Callout>
                  </Marker>
                );
              })}
            </MapView>
          ) : (
            <>
              <Text style={styles.campusName}>La Trobe University Bundoora</Text>
              <Text style={styles.campusSubtitle}>Interactive map would go here</Text>
              {CAMPUS_LOCATIONS.map((loc, idx) => {
                const count = locationSessions[loc.name]?.length || 0;
                if (!count) return null;
                // Position markers in a circle for demo
                const angle = (idx / CAMPUS_LOCATIONS.length) * 2 * Math.PI;
                const radius = 90;
                const x = 120 + radius * Math.cos(angle);
                const y = 80 + radius * Math.sin(angle);
                return (
                  <TouchableOpacity
                    key={loc.name}
                    style={[styles.pin, { left: x, top: y, backgroundColor: PIN_COLORS[idx % PIN_COLORS.length] }]}
                    onPress={() => setSelectedLocation(loc)}
                    accessibilityLabel={`Show details for ${loc.name}`}
                  >
                    <Text style={styles.pinText}>{count}</Text>
                  </TouchableOpacity>
                );
              })}
            </>
          )}
        </View>

        {/* Locations List */}
        <Text style={styles.sectionTitle}>Campus Locations</Text>
        <View style={styles.locationsList}>
          {CAMPUS_LOCATIONS.map((loc, idx) => (
            <TouchableOpacity
              key={loc.name}
              style={styles.locationCard}
              onPress={() => setSelectedLocation(loc)}
              accessibilityLabel={`Show details for ${loc.name}`}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.locationName}>{loc.name}</Text>
                <Text style={styles.locationType}>{loc.type}</Text>
              </View>
              <View style={[styles.sessionCountPill, { backgroundColor: (locationSessions[loc.name]?.length || 0) > 0 ? '#18181b' : '#ececec' }] }>
                <Text style={[styles.sessionCountText, { color: (locationSessions[loc.name]?.length || 0) > 0 ? '#fff' : '#888' }]}>
                  {locationSessions[loc.name]?.length || 0} sessions
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Location Details Card */}
        {selectedLocation && (
          <View style={styles.detailsCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailsTitle}>{selectedLocation.name}</Text>
                <View style={styles.detailsTypePill}><Text style={styles.detailsTypeText}>{selectedLocation.type}</Text></View>
                <Text style={styles.detailsDesc}>{selectedLocation.description}</Text>
              </View>
              <Text style={styles.detailsSessionCount}>{locationSessions[selectedLocation.name]?.length || 0} Active Sessions</Text>
            </View>
            <View style={styles.facilitiesRow}>
              {selectedLocation.facilities.map(fac => (
                <View key={fac} style={styles.facilityTag}><Text style={styles.facilityText}>{fac}</Text></View>
              ))}
            </View>
            <Text style={styles.activeSessionsTitle}>Active Sessions ({locationSessions[selectedLocation.name]?.length || 0})</Text>
            {(locationSessions[selectedLocation.name] || []).map(session => (
              <TouchableOpacity
                key={session.id}
                style={styles.sessionCard}
                onPress={() => router.push({ pathname: '/(tabs)/SessionDetails', params: { session: JSON.stringify(session) } })}
              >
                <Text style={styles.sessionCardTitle}>{session.subject}{session.subjectName ? ` ${session.subjectName}` : ''}</Text>
                <Text style={styles.sessionCardMeta}>🕒 {session.date} at {session.time}</Text>
                <Text style={styles.sessionCardMeta}>👤 Hosted by {session.hostName || 'Anonymous'}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.createButton} onPress={() => router.push('/(tabs)/CreateSession')}>
              <Text style={styles.createButtonText}>Create Session Here</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.findButton} onPress={() => router.push('/(tabs)/FindSessions')}>
              <Text style={styles.findButtonText}>Find Other Sessions</Text>
            </TouchableOpacity>
        </View>
      )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8fa' },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#ececec',
  },
  backButton: { marginRight: 18, borderRadius: 20, padding: 4 },
  headerTitle: { fontSize: 30, fontWeight: '700', color: '#18181b', letterSpacing: -0.5 },
  mapArea: {
    margin: 18,
    marginBottom: 0,
    height: 200,
    borderRadius: 18,
    backgroundColor: '#e0f7fa',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
  },
  campusName: { fontSize: 18, fontWeight: '700', color: '#18181b', marginBottom: 2 },
  campusSubtitle: { fontSize: 15, color: '#888', marginBottom: 0 },
  pin: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  pinText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  calloutContainer: {
    padding: 10,
    minWidth: 120,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3.84,
    elevation: 5,
  },
  calloutTitle: { fontSize: 15, fontWeight: '700', color: '#18181b', marginBottom: 2 },
  calloutText: { fontSize: 13, color: '#666' },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#18181b', marginTop: 28, marginLeft: 18, marginBottom: 12 },
  locationsList: { marginHorizontal: 8 },
  locationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    marginBottom: 10,
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  locationName: { fontSize: 17, fontWeight: '700', color: '#18181b' },
  locationType: { fontSize: 15, color: '#888', marginTop: 2 },
  sessionCountPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionCountText: { fontSize: 15, fontWeight: '700' },
  detailsCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    margin: 16,
    marginTop: 24,
    padding: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  detailsTitle: { fontSize: 20, fontWeight: '700', color: '#18181b', marginBottom: 2 },
  detailsTypePill: { backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start', marginBottom: 8, marginTop: 2 },
  detailsTypeText: { fontSize: 14, color: '#18181b', fontWeight: '600' },
  detailsDesc: { fontSize: 15, color: '#444', marginBottom: 10, marginTop: 2 },
  detailsSessionCount: { fontSize: 16, color: '#007AFF', fontWeight: '700', marginLeft: 8 },
  facilitiesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  facilityTag: { backgroundColor: '#f1f1f1', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginRight: 8, marginBottom: 6 },
  facilityText: { fontSize: 13, color: '#18181b', fontWeight: '500' },
  activeSessionsTitle: { fontSize: 16, fontWeight: '700', color: '#18181b', marginTop: 18, marginBottom: 8 },
  sessionCard: {
    backgroundColor: '#f8f8fa',
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  sessionCardTitle: { fontSize: 16, fontWeight: '700', color: '#18181b', marginBottom: 4 },
  sessionCardMeta: { fontSize: 14, color: '#666', marginBottom: 2 },
  createButton: {
    backgroundColor: '#18181b',
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 18,
  },
  createButtonText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  findButton: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#ececec',
  },
  findButtonText: { color: '#18181b', fontSize: 16, fontWeight: '600' },
});

export default CampusMap; 
