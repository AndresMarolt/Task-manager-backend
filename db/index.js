import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

mongoose.Promise = global.Promise
const mongooseConnect = mongoose.connect('mongodb://localhost:27017/TaskManager', {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to MongoDB successfully") )
    .catch(() => console.log("Error trying to connect to MongoDB"))

export default mongooseConnect;