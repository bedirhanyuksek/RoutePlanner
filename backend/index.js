const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(express.json());

let locations = [];

// Basit test route
app.get('/', (req, res) => {
  res.send('API çalışıyor!');
});


app.get('/all', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM public.pp4');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Sunucu hatası');
  }
});

//Databaseden koordinatları alıyor
app.get('/locations', async (req, res) => {

  try {

    const result = await pool.query('SELECT DISTINCT ON (woonplaats) pp4, woonplaats,latitude,longitude FROM pp4 ORDER BY woonplaats, pp4')
    locations = result.rows
    res.json(result.rows);


  } catch (error) {
    console.error(error);
    res.status(500).send('Sunucu hatası');
  }
});
//OSRM'den mesafeleri hesaplatma
const getDistance = async (lat1, lon1, lat2, lon2) => {
  const url = `http://localhost:5001/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=full&geometries=geojson`;
  const response = await fetch(url);
  const data = await response.json();
  if (data.code === 'Ok') {
    const distance = data.routes[0].distance / 1000;
    const duration = data.routes[0].duration / 60;
    const geometry = data.routes[0].geometry.coordinates.map(coord => ({
      latitude: coord[1],
      longitude: coord[0],
    }))
    return { distance, duration, geometry };
  } else {
    throw new Error('OSRM API yanıtı geçersiz');
  }

}
//Rota oluşturma algoritması 

let latestRoute = [];
//let totalRouteDistance = 0;

const algoritma = async (locs) => {

  latestRoute = [];
  let totalRouteDistance = 0;
  let totalRouteDuration = 0;

  //graph oluşturuldu
  const graph = new Array(locs.length).fill(0).map(() => new Array(locs.length).fill(Infinity));
  for (let i = 0; i < locs.length; i++) {
    for (let j = i + 1; j < locs.length; j++) {
      try {
        const distanceInfo = await getDistance(
          locs[i].latitude, locs[i].longitude,
          locs[j].latitude, locs[j].longitude
        )
        graph[i][j] = {
          from: locs[i].woonplaats,
          to: locs[j].woonplaats,
          distance: distanceInfo.distance,
          duration: distanceInfo.duration,
          geometry: distanceInfo.geometry,

        };
        graph[j][i] = {
          from: locs[j].woonplaats,
          to: locs[i].woonplaats,
          distance: distanceInfo.distance,
          duration: distanceInfo.duration,
          geometry: distanceInfo.geometry
        }
      } catch (err) {
        console.error(err.message);
      }

    }
  }
  //totalRouteDistance = 0;
  const visited = [0];
  let currentIndex = 0;
  while (visited.length < locs.length) {

    //en uzak nokta bulunuyor
    let maxDistance = 0;
    let nextIndex = -1;
    for (let i = 0; i < locs.length; i++) {

      let minDistance = Infinity;
      currentIndex = 0;
      if (!visited.includes(i)) {
        for (let j = 0; j < visited.length; j++) {
          const currentDistance = graph[visited[j]][i].distance;
          if (currentDistance < minDistance) {
            minDistance = currentDistance;
          }
        }
        if (minDistance > maxDistance) {
          maxDistance = minDistance;
          nextIndex = i;
        }
      }
    }

    if (nextIndex === -1) {
      for (let i = 0; i < locs.length; i++) {
        if (!visited.includes(i)) {
          nextIndex = i;
          break;
        }
      }
    }

    //burda ekleme yapılacak
    let bestTotalDistance = Infinity;
    let bestIndex = 1;

    for (let i = 1; i < visited.length; i++) {
      let visitedTemp = [...visited];


      visitedTemp.splice(i, 0, nextIndex);

      let totalDistance = 0;
      for (let j = 0; j < visitedTemp.length - 1; j++) {
        let fromIndex = visitedTemp[j];
        let toIndex = visitedTemp[j + 1];
        totalDistance += graph[fromIndex][toIndex].distance;
      }

      if (totalDistance < bestTotalDistance) {
        bestTotalDistance = totalDistance;
        bestIndex = i;
      }

    }

    visited.splice(bestIndex, 0, nextIndex);



  }

  for (let i = 0; i < visited.length; i++) {
    const current = visited[i];
    const next = visited[i + 1];

    if (next !== undefined) {
      latestRoute.push({
        ...locs[current],
        geometry: graph[current][next].geometry,
      });

      totalRouteDistance += graph[current][next].distance;
      totalRouteDuration += graph[current][next].duration;
    } else {
      latestRoute.push({
        ...locs[current],
        geometry: [],
      });
    }


  }




  return { latestRoute, totalRouteDistance, totalRouteDuration };


}



app.post('/route', async (req, res) => {




  try {

    const inComeLocations = req.body.locations;
    const { latestRoute, totalRouteDistance, totalRouteDuration } = await algoritma(inComeLocations);

    res.json({
      message: "Rota oluşturuldu",
      totalDistance: totalRouteDistance.toFixed(2),
      totalDuration: totalRouteDuration.toFixed(1),
      route: latestRoute
    })
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "sunucu hatası" });
  }

});


app.post('/sync-route', async (req, res) => {

  try {
    if (!latestRoute || !totalRouteDistance) {
      return res.status(400).json({ message: 'Rota oluşturulamadı' })
    }
    return res.json({
      message: 'Rota optimize edildi',
      route: latestRoute.map(loc => ({
        woonplaats: loc.woonplaats,
        latitude: loc.latitude,
        longitude: loc.longitude
      })),
      totalDistance: totalRouteDistance.toFixed(2) + 'km'
    })
  } catch (err) {
    console.error(err);
    res.status(500).send('sunucu hatası');
  }

});





app.listen(port, () => {
  console.log(`Server ${port} portunda çalışıyor`);
});

