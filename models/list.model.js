import mongoose from "mongoose";

const listSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        minlength: 1,
        trim: true
    },
    _userId: {
        type: mongoose.Types.ObjectId,
        required: true
    }
})

const List = mongoose.model('listModel', listSchema);

export default List;