const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Review = require("./review.js");
const listingSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  country: String,
  price: Number,
  image: {
    url: String,
    filename: String
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'], 
      required: true
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true
    }
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Review'
    }
  ]
});


listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
