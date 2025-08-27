const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");          // ✅ correct
const Listing = require("../models/listing.js");             // ✅ correct
const { isLoggedIn, isOwner, validateListing } = require("../middleware.js"); // ✅ correct
const listingController = require("../controllers/listings.js");
const multer = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({storage});


router.route("/")
.get( wrapAsync(listingController.index))
.post( 
  isLoggedIn,
  upload.single("image"),   // ✅ changed here
  validateListing,
  wrapAsync(listingController.createListing)
);




  //New route
router.get("/new" ,isLoggedIn,listingController.renderNewForm)

router.route("/:id")
.get(
     wrapAsync(listingController.showlisting))
     .put(isLoggedIn,
          isOwner,
           upload.single('image'),
    validateListing,
    wrapAsync(listingController.updateListing))
    .delete( isLoggedIn,isOwner,
     wrapAsync(listingController.destroyListing));

//Edit route
router.get("/:id/edit",isLoggedIn,isOwner,
     wrapAsync(listingController.renderEditForm));




module.exports = router;