const mongoose = require('mongoose');
const connectdb = (url) => {
    main()
        .then(() => console.log("Mongo connected succesfully"))
        .catch(err => console.log("error connecting to MongoDB: ", err.message));

    async function main() {

        await mongoose.connect(url);
    }
}
module.exports = {
    connectdb
}


