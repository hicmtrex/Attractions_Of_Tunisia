const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
// const { places, descriptors } = require('./seedHelpers');


mongoose.connect('mongodb://localhost:27017/progress-yelpCamp', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

//const sample = array => array[Math.floor(Math.random() * array.length)];


const seedDB = async () => {
  // await Campground.deleteMany({});
    for (let i = 0; i < 4; i++) {
        const random1000 = Math.floor(Math.random() * 1);
        //const price = Math.floor(Math.random() * 12)  + 5
        const camp = new Campground({
            author : '60b92d8cac47af3e1cc1bf3c',
            title: `${cities[random1000].city}`,
           // Numbers: `${cities[random1000].population}`,
            location: `${cities[random1000].admin_name}`,
            description: '  Lorem, ipsum dolor sit amet consectetur adipisicing elit. Veritatis molestias maxime id soluta sed ab esse iste accusantium, architecto modi cum dolores ullam. Saepe eveniet unde tempore modi, eos tenetur!',
          //  price,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].lng,
                    cities[random1000].lat,

                ]
            },
            images: [
                {
                    url: 'https://res.cloudinary.com/hicm/image/upload/v1622635070/Hicm-YelpCamp/t0aygzkqpspslbmj037g.jpg',
                    filename: 'YelpCamp/ahfnenvca4tha00h2ubt'
                },
                {
                    url: 'https://res.cloudinary.com/hicm/image/upload/v1622648481/Hicm-YelpCamp/vyy3lmyiuhzlfhmwsixn.jpg',
                    filename: 'YelpCamp/ruyoaxgf72nzpi4y6cdi'
                }
            ]
           
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})