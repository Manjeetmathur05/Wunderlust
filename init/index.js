const mongoose = require("mongoose");
const initData = require("./data.js");
const listing = require("../modelss/listing.js");

const MONGO_URL ="mongodb://127.0.0.1:27017/wanderlust";

main()
.then(()=>{
    console.log("connected to db");
})
.catch((err)=>{
    console.log(err);
});

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    try {
        await listing.deleteMany({});
        console.log("Deleted all listings");

        await listing.insertMany(initData.data);
        console.log("Data was initialized");

    } catch (err) {
        console.error("Error during data initialization:", err);
    }
};

initDB();