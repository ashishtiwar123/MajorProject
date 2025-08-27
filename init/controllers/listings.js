const Listing = require("../models/listing");
const axios = require("axios");
const { cloudinary } = require("../cloudConfig");

// Show all listings
module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

// Render new listing form
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

// Show single listing
module.exports.showlisting = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }
  res.render("listings/show.ejs", { listing });
};

// Create new listing
module.exports.createListing = async (req, res, next) => {
  try {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // Handle file upload
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Geocoding (OpenStreetMap)
    const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: req.body.listing.location, format: "json", limit: 1 },
      headers: { "User-Agent": "mern-app/1.0" }
    });

    if (geoResponse.data.length > 0) {
      newListing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(geoResponse.data[0].lon),
          parseFloat(geoResponse.data[0].lat)
        ]
      };
    } else {
      newListing.geometry = { type: "Point", coordinates: [0, 0] };
    }

    await newListing.save();
    req.flash("success", "New Listing Created!");
    res.redirect(`/listings/${newListing._id}`);
  } catch (err) {
    next(err);
  }
};

// Render edit form
module.exports.renderEditForm = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

// ✅ Update listing (with geocoding)
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  // Update main fields first
  let listing = await Listing.findByIdAndUpdate(id, req.body.listing, { new: true });

  // Re-geocode new location if changed
  if (req.body.listing.location) {
    const geoResponse = await axios.get("https://nominatim.openstreetmap.org/search", {
      params: { q: req.body.listing.location, format: "json", limit: 1 },
      headers: { "User-Agent": "mern-app/1.0" }
    });

    if (geoResponse.data.length > 0) {
      listing.geometry = {
        type: "Point",
        coordinates: [
          parseFloat(geoResponse.data[0].lon),
          parseFloat(geoResponse.data[0].lat)
        ]
      };
    }
    await listing.save();
  }

  // If new image uploaded → replace
  if (req.file) {
    if (listing.image && listing.image.filename) {
      await cloudinary.uploader.destroy(listing.image.filename);
    }

    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

// Delete listing
module.exports.destroyListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);

  if (listing && listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};
