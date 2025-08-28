import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

import HomeScreen from './src/screens/HomeScreen';
import MapScreen from './src/screens/MapScreen';

const Stack = createNativeStackNavigator();

const App = () => {

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: 'rgb(55,90,242)',

          },

          headerTitle: () => (
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ transform: [{ rotate: '90deg' }] }}>
                <MaterialIcons name="route" size={22} color="white" />
              </View>

              <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold', }}>Route Planner</Text>

            </View>
          ),
          headerTintColor: 'white',
          headerTitleAlign: 'center',

        }}

        initialRouteName='HomeScreen'>

        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="MapScreen" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App

const styles = StyleSheet.create({


})
