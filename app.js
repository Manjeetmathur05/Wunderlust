const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./modelss/listing.js");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const {listingSchema} = require("./schema.js");
const Review = require("./modelss/review.js");

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
app.set("view engine", "ejs");
app.set("views",path.join(__dirname,"views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs',ejsMate);
app.use(express.static(path.join(__dirname,"/public")));


app.get("/",(req,res)=>{
    res.send("Hi I am root");
});

const validateListing = (req,res,next)=>{
    let {error} = listingSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el)=>el.message).join(",");
     throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

app.get("/listings",async(req,res)=>{
    const alllistings= await Listing.find({});
    res.render("listings/index.ejs",{alllistings});
 });
 
// New Route
app.get("/listings/new",(req,res)=>{
    res.render("listings/new.ejs");
})

// create route
app.post("/listings",validateListing, wrapAsync(async (req, res, next) => {
    const newListing = new listing( req.body.listing);
    await newListing.save();
    res.redirect("/listing");
  
}));

// show route
app.get("/listings/:id", wrapAsync(async(req, res, next) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
        return next(new ExpressError(404, "Listing not found"));
    }
    res.render("listings/show.ejs", { listing });
}));


// edit rout
app.get("/listings/:id/edit",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    const listings = await listing.findById(id);
    res.render("listings/edit.ejs",{listings});
}));

// update rout
app.put("/listings/:id",validateListing, wrapAsync(async(req,res)=>{
    let {id} = req.params;
    await listing.findByIdAndUpdate(id,{...req.body.listing});
    res.redirect(`/listings/${id}`);
}));
// delete rout
app.delete("/listings/:id",wrapAsync(async(req,res)=>{
    let {id} = req.params;
    let deleteListing= await listing.findByIdAndDelete(id);
    console.log(deleteListing);
    res.redirect("/listings");
}));

// Reviwes
// post route
app.post("/listing/:id/reviews",async(req,res)=>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    console.log("new review saved");
    res.send("new review saved");
});

// app.get("/testlisting",async(req,res)=>{
//     let sampleListing = new listing({
//         title:"My New Villa",
//         description:"On city",
//         price:3000,
//         location:"Karnal,Haryana",
//         country:"India",
//     });

//     await sampleListing.save();
//     console.log("sample was saved");
//     res.send("successful testing");
// });

app.all("*",(req,res,next)=>{
    next(new ExpressError(404,"page Not Found!"));
})

app.use((err,req,res,next)=>{
    let{statusCode=505, message="something went wrong"} = err;
    res.status(statusCode).render("error.ejs",{message});
    // res.status(statusCode).send(message);
});

app.listen(8080, ()=>{
    console.log("server is listening to port 8080 ");
});
