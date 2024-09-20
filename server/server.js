

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
app.use(cors());


const workspaceSlug = 'Arpan-Chowdhury-s-workspace-8i1n54';
const region = 'us-east-1';
const dbBranchName = 'kafka-ecom:main'; 

const apiUrl = `https://${workspaceSlug}.${region}.xata.sh/db/${dbBranchName}/sql`;


const headers = {
    'Authorization': 'Bearer API_Key',
    'Content-Type': 'application/json'
};


const sendQuery = async (statement, params = [], consistency = 'strong', responseType = 'json') => {
    try {
        const requestBody = {
            statement,
            params,
            consistency,
            responseType
        };

        const response = await axios.post(apiUrl, requestBody, { headers });
        return response.data.records; 
    } catch (error) {
        console.error('Error sending SQL query', error.response ? error.response.data : error.message);
        throw error; 
    }
};


app.get('/api/activity-data', async (req, res) => {
    const sqlQuery = 'SELECT * FROM activity_log;'; 

    try {
        const records = await sendQuery(sqlQuery);
        res.json(records);
    } catch (error) {
        res.status(500).send('Error fetching activity data');
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});


io.on('connection', (socket) => {
    console.log('New client connected');

    
    const interval = setInterval(async () => {
        try {
            const sqlQuery = 'SELECT * FROM activity_log ORDER BY timestamp DESC LIMIT 1;';
            const records = await sendQuery(sqlQuery);
            const latestActivity = records[0];

          
            if (latestActivity) {
                socket.emit('new-activity', latestActivity);
            }
        } catch (error) {
            console.error('Error fetching latest activity data', error.response ? error.response.data : error.message);
        }
    }, 5000); 


    socket.on('disconnect', () => {
        console.log('Client disconnected');
        clearInterval(interval);
    });
});


//const port = 5000

server.listen(5000, () => {
    console.log('Server running on port 5000');
});
