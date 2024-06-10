const User = require("../model/schema/user");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require('dotenv').config({
    path: "../.env"
});


const users = [
 
];



const DATABASE_URL = process.env.DB_URL || "mongodb://127.0.0.1:27017";
const DATABASE = process.env.DB || "crm";

const DB_OPTIONS = {
  dbName: DATABASE,
};

mongoose.set("strictQuery", false);
mongoose.connect(DATABASE_URL, DB_OPTIONS).catch((error) => {
  console.log(err.stack);
  process.exit(1);
});

function insertUsers() {

    users?.forEach(async (user) => {
        const hashed = await bcrypt.hash(user.password, 10);
       const newUser = new User({...user, password: hashed});
       await newUser.save(); 
       console.log("AdminUsers seeder succeeded");
    })
}

insertUsers(); 