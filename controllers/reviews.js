const Listing = require("../models/listing");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  const newReview = new Review(req.body.review);
  
  // ✅ attach the logged-in user as author
  newReview.author = req.user._id;
  

  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Created new review!");
  res.redirect(`/listings/${listing._id}`);
};


module.exports.destroyReview = async (req, res) => {
    const { id, reviewId } = req.params;

    // Remove review reference from listing
    const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
   
   try { if (!listing) {
        req.flash("error", "Listing not found!");
        return res.redirect("/listings");
    }

    // Delete the review
    const review = await Review.findByIdAndDelete(reviewId);
    if (!review) {
        req.flash("error", "Review not found!");
        return res.redirect(`/listings/${id}`);
    }

    req.flash("success", "Review Deleted!");
    res.redirect(`/listings/${id}`);
}

catch(err) {
    console.log(err);
}
};

