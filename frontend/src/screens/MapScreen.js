import React from "react";
import { View, Text, SafeAreaView, ScrollView, StyleSheet, Dimensions, FlatList, TouchableOpacity } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import Feather from 'react-native-vector-icons/Feather';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'

const { width: screenWidth } = Dimensions.get("window");



const MapScreen = ({ route }) => {
  const { latestRoute, totalDistance, totalDuration } = route.params;

  const formatDuration = (minutes) => {

    if (!minutes) {
      return '';
    } else {
      return `${minutes} min`
    }


  }

  const renderItem = ({ item, index }) => {
    let borderColor = 'rgb(63,89,233)';
    let fontColor = 'blue';
    let iconName = 'arrow-forward-circle'
    if (index === 0) {
      borderColor = '#22c55e'
      fontColor = 'green'
      iconName = 'location-sharp'
    }
    if (index === latestRoute.length - 1) {
      borderColor = 'rgb(235,80,72)'
      fontColor = 'red'
      iconName = 'flag-sharp'
    }

    return (
      <View style={{ backgroundColor: borderColor, borderRadius: 15, padding: 10, margin: 5 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Ionicons name={iconName} size={20} color='white' />
          <Text style={{ color: 'white', fontSize: 16 }}>{item.woonplaats}</Text>

        </View>

      </View>
    )
  }

  if (!latestRoute || latestRoute.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={{ color: "#191970" }}>route not found</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "rgb(230,236,254)" }}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={true}
        bounces={true}
      >
        <View style={styles.inContainer}>

          <View style={styles.header}>
            <Feather name="map" size={18} color="white" />
            <Text style={styles.headerText}>Route Map</Text>
          </View>


          <View style={styles.innerContent}>

            <View style={{ width: '90%', height: 150, backgroundColor: 'rgba(55,90,242,0.2)', borderRadius: 30, justifyContent: 'center' }}>
              <View style={{ flexDirection: 'row', gap: 10, marginBottom: 15 }}>
                <View style={{ backgroundColor: "rgb(55,90,242)", padding: 5, borderRadius: 20, marginLeft: '6%' }}>
                  <MaterialIcons name="route" size={16} color='white' style={{ transform: [{ rotate: "90deg" }], padding: 5, alignItems: 'center' }} />
                </View>

                <View>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>Your route</Text>
                  <Text>{latestRoute.length} stops</Text>
                </View>

              </View>
              <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 15 }}>
                <View style={{ backgroundColor: "rgb(55,90,242)", borderRadius: 15, padding: 15, width: '40%', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Entypo name="ruler" size={12} color='white' style={{ transform: [{ rotate: "90deg" }] }} />
                    <Text style={{ color: 'white' }}>Distance</Text>

                  </View>

                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{totalDistance} km</Text>

                </View>
                <View style={{ backgroundColor: "#22c55e", borderRadius: 15, padding: 15, width: '40%', justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ flexDirection: 'row', gap: 5 }}>
                    <Entypo name="clock" size={12} color='white' style={{ transform: [{ rotate: "90deg" }] }} />
                    <Text style={{ color: 'white' }}>Time</Text>

                  </View>

                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>{formatDuration(totalDuration)}</Text>

                </View>
              </View>


            </View>


            <View style={{ width: "90%", height: 350 }}>

              <MapView
                style={{ flex: 1, borderRadius: 30, overflow: "hidden" }}
                initialRegion={{
                  latitude: latestRoute[0]?.latitude || 0,
                  longitude: latestRoute[0]?.longitude || 0,
                  latitudeDelta: 1,
                  longitudeDelta: 1,
                }}
              >
                {/* Çizilen rota */}
                <Polyline
                  coordinates={latestRoute.map((loc) => ({
                    latitude: loc.latitude,
                    longitude: loc.longitude,
                  }))}
                  strokeWidth={4}
                  strokeColor="blue"
                />

                {/* İşaretler */}
                {latestRoute.map((loc, index) => {
                  let pinColor = "blue";
                  if (index === 0) pinColor = "green";
                  else if (index === latestRoute.length - 1) pinColor = "red";

                  return (
                    <Marker
                      key={index}
                      coordinate={{
                        latitude: loc.latitude,
                        longitude: loc.longitude,
                      }}
                    >
                      <View style={{ alignItems: "center" }}>
                        <View
                          style={{
                            backgroundColor: "white",
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                            borderRadius: 6,
                            borderWidth: 1,
                            borderColor: pinColor,
                            marginBottom: 4,
                          }}
                        >
                          <Text style={{ color: pinColor, fontWeight: "bold", fontSize: 12 }}>
                            {index + 1}. {loc.woonplaats}
                          </Text>
                        </View>

                        <View
                          style={{
                            width: 14,
                            height: 14,
                            backgroundColor: pinColor,
                            borderRadius: 7,
                            borderWidth: 2,
                            borderColor: "white",
                          }}
                        />
                      </View>
                    </Marker>
                  );
                })}
              </MapView>

            </View>




            <View style={{ backgroundColor: 'rgba(55,90,242,0.2)', width: '90%', borderRadius: 30 }}>
              <View style={{ flexDirection: 'row', marginLeft: '6%', padding: 10, gap: 10 }}>
                <Feather name="arrow-right" size={18} color="green" />
                <Text style={{ fontSize: 16, fontWeight: 'bold' }}>Route Details</Text>
              </View>
              <View style={{ alignItems: 'center', width: '100%', marginBottom: 10 }}>
                {latestRoute && (

                  <FlatList
                    data={latestRoute}
                    keyExtractor={(item, index) => index.toString()}
                    style={styles.routeList}
                    renderItem={renderItem}


                  />



                )}

              </View>

            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default MapScreen;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    paddingVertical: 20,
    alignItems: "center",
  },
  inContainer: {
    backgroundColor: "rgb(244,248,253)",
    borderRadius: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    width: screenWidth * 0.9,
    alignSelf: "center",
    overflow: "hidden",
    height: 'auto'
  },
  header: {
    backgroundColor: "rgb(55,90,242)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    flexDirection: "row",
    padding: 20,
    gap: 10,
    alignItems: "center",
  },
  headerText: {
    color: "white",
    fontSize: 16,
  },
  innerContent: {
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 20,
    gap: 20

  },
  box: {
    width: "90%",
    borderRadius: 12,
    marginBottom: 20,
  },
  routeList: {
    width: '95%',

  }
});
