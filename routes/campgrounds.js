const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage});



//middleware
//const { campgroundSchema } = require('../schemas')

router.get('/', catchAsync(campgrounds.renderCamping));

router.get('/new',isLoggedIn,campgrounds.renderNew);

//Post

router.post('/camping',isLoggedIn,upload.array('image'),validateCampground, catchAsync(campgrounds.createCamp));

// Update & delete

router.route('/:id')
     .get(catchAsync(campgrounds.showCampground))
     .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.updateCampground))
     .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCampground));
     
module.exports = router;