import mongoose from "mongoose";
import dotenv from 'dotenv'

dotenv.config();

mongoose.Promise = global.Promise
const mongooseConnect = mongoose.connect(process.env.CONNECTION_URL, {useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log("Connected to MongoDB successfully") )
    .catch((e) => console.log("Error trying to connect to MongoDB"))

export default mongooseConnect;