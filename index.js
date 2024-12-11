const express = require('express');
const axios = require('axios'); 
const cors = require('cors');
require('dotenv').config(); 

const app = express();
app.use(cors());
app.use(express.json());

const port = 5100;
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY; 
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

async function getVideos(playlistItems) {
    let videoIds = "";
    
    playlistItems.forEach((video, index) => {
      const videoId = video.snippet.resourceId.videoId;
      videoIds += videoId;
      videoIds += ","
    });
  
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&part=snippet&id=${videoIds}&maxResults=5&key=${YOUTUBE_API_KEY}`;
  
    try {
      const response = await axios.get(apiUrl);
      return response.data.items
    } catch (error) {
      console.error(error.message);
    } 
}

// Route to fetch playlist data
app.get('/api/v1/youtube/videos', async (req, res) => {
    try {

        const {playlistId} = req.query;

        const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${playlistId}&maxResults=50&key=${YOUTUBE_API_KEY}`;

        // Fetch data using axios
        const response = await axios.get(apiUrl);
        const videos = await getVideos(response.data.items);

        res.status(200).json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Route to generate a response
app.get('/api/v1/gemini/questions', async (req, res) => {
    try {
        const {prompt} = req.query;

        console.log(req.query)

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

        const data = {
            contents: [
              {
                parts: [{ text: prompt }]
              }
            ]
          }

        const response = await axios.post(apiUrl, data, {
            headers: { "Content-Type": "application/json" }
          });
      
        res.status(200).json(`${response.data.candidates[0].content.parts[0].text}`);
        
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Failed to fetch data' });
        }
});


// Start the server
app.listen(port, () => {
    console.log(`Server is running on port : ${port}`);
});
