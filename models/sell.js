var mongoose = require("mongoose");

var sellSchema = new mongoose.Schema({
    name: String,
    image: String,
    price: Number,
    description: String,
    poster: {
         id: {
             type: mongoose.Schema.Types.ObjectId,
             ref: "User"
        },
         username: String
     }
    });

module.exports = mongoose.model("sell", sellSchema);