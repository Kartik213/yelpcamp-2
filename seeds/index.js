const mongoose = require("mongoose");

const Campground = require("../models/campground");
const Cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.set('strictQuery', false);
mongoose.connect('mongodb://localhost:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const sample = array => (array[Math.floor(Math.random() * array.length)]);

const seedDB = async () => {
    await Campground.deleteMany({}); //deleting whole data
    for (let i = 0; i < 50; ++i) { //inserting 50 new campgrounds
        let random1000 = Math.floor(Math.random() * 1000);
        let price = Math.floor(Math.random() * 50) + 10;
        const c = new Campground({ //creating new campground
            author:"63c951ccd62c548575510cf2",
            location: `${Cities[random1000].city}, ${Cities[random1000].state}`, //setting the value of location
            title: `${sample(descriptors)} ${sample(places)}`, //setting the title of campground
            images: [
                {
                  url: 'https://res.cloudinary.com/dr3mlnoqz/image/upload/v1674292978/YelpCamp/smn2emkmfgwlrvctdrjs.jpg',
                  fileName: 'YelpCamp/n0ubn7pnivwoqfzu30ut',
                  
                },
                {
                  url: 'https://res.cloudinary.com/dr3mlnoqz/image/upload/v1674288290/YelpCamp/zelvtqjzesrxmyirxzlw.jpg',
                  fileName: 'YelpCamp/hxu7dprjcpdh15hvwrpq',
                  
                }
              ],
            price: price,
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Cumque velit voluptatem voluptate quas ab necessitatibus numquam perferendis dignissimos vitae. Eos voluptate facilis pariatur molestiae nam assumenda quod eum libero tenetur!"
        })
        await c.save(); //saving the campground
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});


