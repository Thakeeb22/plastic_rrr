const mongoose = require("mongoose")
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    profileCode:{
        type: String,
        required: true,
        unique:true,
    },
    phone:{
        type: String,
        required: true,
    },
    points: {
        type: Number,
        default: 0,
    }
})
module.experts = mongoose.model("User", userSchema)