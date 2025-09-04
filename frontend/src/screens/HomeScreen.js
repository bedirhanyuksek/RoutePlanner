import { StyleSheet, Text, View, SafeAreaView, TextInput, FlatList, TouchableOpacity, ScrollView, Dimensions, Platform, Alert } from 'react-native'
import React, { useState, useEffect } from 'react'
import { useNavigation } from '@react-navigation/native';

import DocumentPicker from 'react-native-document-picker'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import RNFS from 'react-native-fs'

import Feather from 'react-native-vector-icons/Feather'
import AntDesign from 'react-native-vector-icons/AntDesign'
import FontAwesome from 'react-native-vector-icons/FontAwesome'
import Ionicons from 'react-native-vector-icons/Ionicons'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'

const { width: screenWidth } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {

    const [fileName, setFileName] = useState('')

    const [locations, setLocations] = useState([]);
    const [selectedLocations, setSelectedLocations] = useState([]);
    const [latestRoute, setLatestRoute] = useState([]);
    const [totalDistance, setTotalDistance] = useState(null);
    const [fileLocations, setFileLocations] = useState([]); // <-- yeni state

    const HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost'
    const backend_url = `http://${HOST}:3000/user-locations`
    const backend_upload_url = `http://${HOST}:3000/upload-locations`

    useEffect(() => {
        console.log("selectedLocations güncellendi:", selectedLocations);
    }, [selectedLocations]);


    const fetchLocations = async () => {
        try {
            const res = await fetch(backend_url);
            const data = await res.json();
            console.log("gelen data:", data)
            setLocations(data)
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(()=>{
        fetchLocations();
    },[])


    const [startShowList, setStartShowList] = useState(false);
    const [endShowList, setEndShowList] = useState(false);
    const [selectedStart, setSelectedStart] = useState(null);
    const [selectedEnd, setSelectedEnd] = useState([]);

    const [startSearch, setStartSearch] = useState('');
    const [endSearch, setEndSearch] = useState('');

    const startSelection = (item) => {
        setStartShowList(false);
        setStartSearch(item.name);
    }

    const endSelection = (item) => {
        setEndShowList(false);
        setEndSearch(item.name);
    }

    const backend_algoritma_url = `http://${HOST}:3000/route`
    const send_locations = async () => {
        try {
            const response = await fetch(backend_algoritma_url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    locations: selectedLocations,
                })
            })
            const data = await response.json();
            const route = data.route || [];
            const totalDistance = data.totalDistance || null;
            const totalDuration = data.totalDuration || null;
            setTotalDistance(totalDistance);
            setLatestRoute(route);
            return { route, totalDistance, totalDuration };
        } catch (error) {
            console.error(error);
            return [];
        }
    }

    const rotaOlustur = async () => {
        if (!selectedLocations || selectedLocations.length === 0) {
            return;
        }
        const { route, totalDistance, totalDuration } = await send_locations();
        if (route && route.length > 0) {
            navigation.navigate('MapScreen', { latestRoute: route, totalDistance: totalDistance, totalDuration: totalDuration })
        }
    }

    const resetAction = () => {
        setStartSearch('')
        setEndSearch('')
        setSelectedStart(null)
        setSelectedEnd([])

        setSelectedLocations([])
        setLatestRoute([])
    }

    const handleFileUpload = async () => {
        try {
            const res = await DocumentPicker.pick({ type: [DocumentPicker.types.allFiles] })
            if (!res || res.length === 0) return;

            const file = res[0];
            setFileName(file.name);

            let parsedLocations = [];

            if (file.name.endsWith('.csv')) {
                const text = await RNFS.readFile(file.uri, 'utf8');
                Papa.parse(text, {
                    header: true,
                    complete: (results) => {
                        parsedLocations = results.data.map(loc => ({
                            name: loc.name,
                            latitude: parseFloat(loc.latitude),
                            longitude: parseFloat(loc.longitude)
                        }))
                        setFileLocations(parsedLocations); // sadece fileLocations'a ata
                    }
                })
            } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                const fileString = await RNFS.readFile(file.uri, 'base64');
                const workbook = XLSX.read(fileString, { type: 'base64' })
                const sheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[sheetName]
                const data = XLSX.utils.sheet_to_json(sheet)
                parsedLocations = data.map(loc => ({
                    name: loc.name,
                    latitude: parseFloat(loc.latitude),
                    longitude: parseFloat(loc.longitude)
                }))
                setFileLocations(parsedLocations) // sadece fileLocations'a ata
            } else {
                alert('Only CSV, XLS and XLSX files are supported!')
                return;
            }

            const response = await fetch(backend_upload_url,{
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({locations: parsedLocations})
            })

            const resData = await response.json()
            console.log(resData)

            fetchLocations()

        } catch (err) {
            if (DocumentPicker.isCancel && DocumentPicker.isCancel(err)) {
                // kullanıcı iptal ettiyse sessizce çık
                return;
            }
            console.error(err)
        }
    }


    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={true}
                showsHorizontalScrollIndicator={false}
                horizontal={false}
                bounces={true}
            >
                <View style={styles.inContainer}>
                    <View style={styles.headerBox}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Feather name="settings" size={16} color='white' />
                            <Text style={styles.headerTitle}>Plan Your Route</Text>
                        </View>

                        <Text style={styles.headerSubtitle}>Choose your starting point and destination</Text>
                    </View>

                    <View style={styles.inputBox}>
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="location-outline" size={18} color='black' />
                            <Text style={styles.inputLabel}>Starting City</Text>

                        </View>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.textInput}
                                placeholder='Select starting city...'
                                onPressIn={() => { setStartShowList(true), setEndShowList(false) }}
                                value={startSearch}
                                onChangeText={setStartSearch}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    if (startSearch) {
                                        const foundStartItem = locations.find((loc) => loc.name === startSearch)
                                        if (foundStartItem) {
                                            setSelectedStart(foundStartItem)
                                            setStartSearch('');
                                            setSelectedLocations(prev => [...prev, foundStartItem]);
                                        }
                                    }
                                }}
                                style={styles.plusButton}
                            >
                                <Text style={styles.plusButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {startShowList && (
                            <FlatList
                                data={locations}
                                keyExtractor={item => item.id.toString()}
                                style={styles.list}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => startSelection(item)}>
                                        <Text style={styles.listItem}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {selectedStart && (
                            <Text style={styles.selectedStart}>{selectedStart.name}</Text>
                        )}
                        <View style={{ flexDirection: 'row' }}>
                            <Ionicons name="location-outline" size={18} color='black' />
                            <Text style={styles.inputLabel}>Places to Visit</Text>

                        </View>

                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.textInput}
                                placeholder='Search for places...'
                                onPressIn={() => { setEndShowList(true), setStartShowList(false) }}
                                value={endSearch}
                                onChangeText={setEndSearch}
                            />
                            <TouchableOpacity
                                onPress={() => {
                                    if (endSearch) {
                                        const foundEndItem = locations.find((loc) => loc.name === endSearch)
                                        if (foundEndItem) {
                                            setSelectedEnd(prev => [...prev, foundEndItem]);
                                            setEndSearch('');
                                            setSelectedLocations(prev => [...prev, foundEndItem]);
                                        }
                                    }
                                }}
                                style={styles.plusButton}
                            >
                                <Text style={styles.plusButtonText}>+</Text>
                            </TouchableOpacity>
                        </View>

                        {endShowList && (
                            <FlatList
                                data={locations}
                                keyExtractor={item => item.id.toString()}
                                style={styles.list}
                                renderItem={({ item }) => (
                                    <TouchableOpacity onPress={() => endSelection(item)}>
                                        <Text style={styles.listItem}>{item.name}</Text>
                                    </TouchableOpacity>
                                )}
                            />
                        )}

                        {selectedEnd.length === 0 && (
                            <View style={styles.noDestinationBox}>
                                <Ionicons name="location-outline" size={30} color='black' />
                                <Text style={styles.noDestinationText}>No destinations selected</Text>
                                <Text style={styles.noDestinationText}>Search and add places you want to visit</Text>
                            </View>
                        )}

                        {selectedEnd && (
                            selectedEnd.map((select, index) => (
                                <Text key={index} style={styles.selectedEnd}>{select.name}</Text>
                            ))
                        )}
                    </View>

                    <TouchableOpacity style={styles.resetButton} onPress={() => resetAction()}>
                        <MaterialIcons name="restart-alt" size={20} color='rgb(229,110,40)' />
                        <Text style={styles.resetButtonText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.fileImportContainer}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: '5%' }}>
                        <Feather name="upload" size={18} color="black" />
                        <Text style={styles.fileImportTitle}>Import from File</Text>

                    </View>

                    <View style={styles.fileDropZone}>
                        <View style={{ backgroundColor: 'rgba(55,90,242,0.1)', borderRadius: 30, padding: 8 }}>
                            <Feather name="upload" size={30} color='rgb(55,90,242)' />

                        </View>

                        <Text style={styles.fileDropText}>Supports .csv, .xls and xlsx files</Text>
                        <TouchableOpacity style={styles.chooseFileButton} onPress={handleFileUpload}>
                            <Text style={styles.chooseFileButtonText}>Choose File</Text>
                        </TouchableOpacity>
                        {fileName && (
                            <Text style={{ margin: 10, fontWeight: 'bold' }}>{fileName}</Text>
                        )}
                    </View>
                </View>


                <View style={{ height: 100 }} />
            </ScrollView>


            <TouchableOpacity
                style={styles.createRouteButton}
                onPress={() => rotaOlustur()}
            >
                <Text style={styles.createRouteButtonText}>Create Route</Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default HomeScreen

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'rgb(230,236,254)',
    },
    scrollContainer: {
        flexGrow: 1,
        alignItems: 'center',
        paddingBottom: 20,
    },
    inContainer: {
        backgroundColor: 'rgb(244,248,253)',
        padding: 15,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        marginTop: 20,
        width: screenWidth * 0.9,
        alignSelf: 'center',
    },
    headerBox: {
        backgroundColor: 'rgb(55,90,242)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',

    },
    headerTitle: {
        color: 'white',
        fontWeight: 'bold',
        margin: 5,
    },
    headerSubtitle: {
        color: 'white',
    },
    inputBox: {
        margin: 10,
    },
    inputLabel: {
        color: 'rgb(63,67,82)',
        marginBottom: 10,
        fontWeight: 'bold',
        marginLeft: 5
    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 5,
    },
    textInput: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 5,
        fontWeight: 'bold',
        borderColor: 'rgb(230,237,250)',
        marginBottom: 10,
        backgroundColor: 'rgb(243,243,245)',
        color: 'rgb(63,67,82)',
        flex: 1,
    },
    addButton: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 10,
        marginLeft: 10,
        paddingHorizontal: 15,

    },
    plusButton: {
        borderRadius: 10,
        padding: 8,
        marginBottom: 10,
        marginLeft: 10,
        alignItems: 'center',
        backgroundColor: 'rgb(72,188,164)',
        paddingHorizontal: 15,
    },
    plusButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    list: {
        maxHeight: 150,
        borderWidth: 1,
        borderTopWidth: 0,
        borderRadius: 10,
        backgroundColor: 'rgb(230,236,254)',
    },
    listItem: {
        color: 'rgb(63,67,82)',
        fontWeight: 'bold',
        padding: 10,
    },
    selectedStart: {
        borderRadius: 8,
        padding: 10,
        backgroundColor: 'rgb(77,193,93)',
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 20,
    },
    selectedEnd: {
        borderRadius: 8,
        padding: 10,
        backgroundColor: 'rgba(68, 125,252,1)',
        color: 'white',
        fontWeight: 'bold',
        marginBottom: 10,
    },
    noDestinationBox: {
        backgroundColor: 'rgb(243,243,245)',
        borderWidth: 1,
        borderColor: 'rgb(230,237,250)',
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        margin: 5,
    },
    noDestinationText: {
        color: 'rgb(63,67,82)',
        margin: 5,
        fontSize: 13
    },
    resetButton: {
        borderWidth: 1,
        padding: 6,
        borderRadius: 20,
        borderColor: 'rgb(249,211,167)',
        backgroundColor: 'rgb(243,243,245)',
        alignSelf: 'flex-start',
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: '5%'

    },
    resetButtonText: {
        color: 'rgb(229,110,40)',
        fontWeight: 'bold',
    },
    fileImportContainer: {
        backgroundColor: 'rgb(244,248,253)',
        padding: 15,
        borderRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        marginTop: 20,
        width: screenWidth * 0.9,
        alignSelf: 'center',
    },
    fileImportTitle: {
        margin: 5,
        fontWeight: '600',
    },
    fileDropZone: {
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: 'rgb(166,172,183)',
        borderRadius: 10,
        backgroundColor: 'rgb(243,243,245)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
        margin: 10,
    },
    fileDropText: {
        margin: 20,
        color: 'rgb(63,67,82)',
    },
    chooseFileButton: {
        borderRadius: 15,
        backgroundColor: 'rgb(55,90,242)',
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    chooseFileButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
    createRouteButton: {
        position: 'absolute',
        bottom: 30,
        left: screenWidth * 0.1,
        right: screenWidth * 0.1,
        backgroundColor: 'rgb(77,193,93)',
        padding: 20,
        borderRadius: 50,
        elevation: 5,
        shadowColor: '#000',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 },
        alignItems: 'center',
    },
    createRouteButtonText: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 16,
    },
})