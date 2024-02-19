import express from 'express';
import AppDataSource from "./data-source"
import cors from 'cors';
import mainRoutes from './routes/mainRoute';
import { rootSocket } from './socket/socket';
// import { rootSocket } from './socket/socket';

const PORT = process.env.PORT || 4100;
// require('dotenv').config();

// establish database connection
AppDataSource
    .initialize()
    .then(() => {
        console.log("Data Source has been initialized!")
    })
    .catch((err) => {
        console.error("Error during Data Source initialization:", err)
    })

// create and setup express app

const app = express();
app.use(cors());
app.use('/uploads', express.static('uploads'));
// app.use(bodyParser.json());
app.use(express.json());

app.use('', mainRoutes);

const httpServer = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


rootSocket(httpServer);