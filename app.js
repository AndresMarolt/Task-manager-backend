import bodyParser from 'body-parser';
import express from 'express'
import dotenv from 'dotenv'
import router from './routes/index.js'
import mongooseConnect from './db/index.js';
import cors from 'cors'

const app = express();

app.use(bodyParser.urlencoded({extended: true}))
app.use(express.json());
app.use(cors());
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
  res.header('Access-Control-Allow-Methods', 'GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, x-access-token, x-refresh-token, X-Requested-With, Content-Type, Accept, _id');

  res.header(
    'Access-Control-Expose-Headers',
    'x-access-token, x-refresh-token'
  )
  next();
});

app.use('/', router); 

dotenv.config();
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
})
