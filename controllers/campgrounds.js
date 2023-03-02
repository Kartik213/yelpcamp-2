const { cloudinary } = require("../cloudinary");
const Campground = require("../models/campground");
// const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
// const mapBoxToken = process.env.MAPBOX_TOKEN;
// const geocoder = mbxGeocoding({accessToken:mapBoxToken});

module.exports.index = async (req, res) => {    //View all campgrounds
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
}

module.exports.renderNewForm = (req, res) => {   //Route to the form to create new campground
    res.render("campgrounds/new.ejs");
}

module.exports.createCampground = async (req, res, next) => {   //Creates new campground
    
    // const geoData = await geocoder.forwardGeocode({
    //     query:req.body.campground.location,
    //     limit:1
    // }).send();
    // console.log();
    const campground = new Campground(req.body.campground);
    // campground.geometry = (geoData.body.features[0].geometry);
    campground.images = req.files.map(f => ({ url: f.path, fileName: f.filename }));
    campground.author = req.user._id;
    await campground.save();
    // console.log("\nI AM PRINTING THIS controllers/campgrounds.js/18\n", campground);
    req.flash("success", "New Campground created!");
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req, res) => {  //Show route for a specific campground
    const campground = await Campground.findById(req.params.id).populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    // console.log(campground);
    if (!campground) {
        req.flash("error", "Can't find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
}

module.exports.renderEditForm = async (req, res) => {   //Route to the form to edit a specific campground
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Can't find that campground!");
        return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", { campground });
}

module.exports.updateCampground = async (req, res) => {  //Updating the campground
    const { id } = req.params;
    // console.log("\nI AM PRINTING controllers/campgrounds/50\n", req.body);
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    const imgs = req.files.map(f => ({ url: f.path, fileName: f.filename }))
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for(let fileName of req.body.deleteImages){
            await cloudinary.uploader.destroy(fileName);
        }
        await campground.updateOne({ $pull: { images: { fileName: { $in: req.body.deleteImages } } } });
        // console.log("\nI AM PRINTING controllers/campgrounds/57\n",campground);
    } 
    req.flash("success", "Campground Updated!")
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteCampground = async (req, res) => {  //Delete a specific campground
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground Deleted!")
    res.redirect("/campgrounds");
}