const express = require('express');
const router = express.Router();

const cloudinary = require('cloudinary');
cloudinary.config({
    'api_key': process.env.CLOUDINARY_API_KEY,
    'api_secret': process.env.CLOUDINARY_API_SECRET
})

router.get('/sign', (req,res)=>{

    const params_to_sign = req.query.params_to_sign;
    const signature = cloudinary.utils.api_sign_request(params_to_sign, process.env.CLOUDINARY_API_SECRET);
    res.send(signature)
})

module.exports = router;

