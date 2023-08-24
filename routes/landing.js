const express = require("express");
const router = express.Router(); // #1 - Create a new express Router
const { Posters } = require('../models')

//  #2 Add a new route to the Express router
router.get('/', async (req,res)=>{
    let posters = await Posters.collection().fetch();
    res.render('landing/index', {
        'posters': posters.toJSON()
    })
})

router.get('/about-us', (req,res)=>{
    res.render('landing/about-us')
})

router.get('/contact-us', (req,res)=>{
    res.render('landing/contact-us')
})

module.exports = router;