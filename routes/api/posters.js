const express = require('express');
const router = express.Router();
const { Poster } = require('../../models');
const { createPosterProductForm } = require('../../forms')
const posterDataLayer = require('../../data-access-layer/poster-dal');

router.get('/', async(req,res)=>{
    res.send(await posterDataLayer.getAllPosters())
})

// router.post('/', async(req,res)=>{
//     const allProperties = await posterDataLayer.getAllProperties

// })


module.exports = router;