import axios from 'axios'
import WebSocket from 'ws'

interface GPSLocation {
  gps_coordinates: {
    latitude: number,
    longitude: number
  }
}

const wss = new WebSocket.Server({ port: 8080 })
console.log('Server started on port: 8080')

wss.on('connection', (ws: WebSocket) => {
  console.log('New client connected')

  ws.on('message', async <T>(message: T | GPSLocation) => {
    console.log(`Received message: ${message}`)

    // check if message is GPSLocation
    if(typeof message === 'object' && message.toString().includes('gps_coordinates')) {
      message = JSON.parse(message.toString()) as GPSLocation
      const hospitals = await getHospitals(message.gps_coordinates.latitude, message.gps_coordinates.longitude)
      if(hospitals !== null){
        ws.send(JSON.stringify(hospitals))
      }
      else{
        ws.send('getHospitals Error!')
      }

      return
    }
    
    ws.send(`Server received your message: ${message}`)
  })

  ws.on('close', () => {
    console.log('Client disconnected')
  })
})

async function getHospitals(latitude: number, longitude: number): Promise<Record<string, unknown>[] | null> {
  const options = {
    headers: {
      'Content-Type': 'application/json'
    },
    params: {
      engine: 'google_maps',
      q: 'hospital & โรงพยาบาล',
      ll: `@${latitude},${longitude},21z`,
      type: 'search',
      api_key: '<Your Private API Key>'
    }
  }

  try {
    const response = await axios.get(
      'https://serpapi.com/search',
      options
    )
    console.log(response.data.local_results)

    return response.data.local_results
  } catch (error) {
    console.log(error)

    return null
  }
}
