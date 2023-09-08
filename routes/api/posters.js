const express = require('express');
const router = express.Router();
const { Poster } = require('../../models');
const { createPosterProductForm } = require('../../forms')
const posterDataLayer = require('../../data-access-layer/poster-dal');

router.get('/', async(req,res)=>{
    const posters = await posterDataLayer.getAllPosters();
    res.json({
        'posters': posters.toJSON()
    })
})

router.post('/', async(req,res)=>{
    const allProperties = await posterDataLayer.getAllProperties();
    const allArtists = await posterDataLayer.getAllArtists();
    const posterForm = createPosterProductForm(allProperties, allArtists);
    posterForm.handle(req, {
        'success': async(form)=>{
            const poster = await posterDataLayer.addPoster(form.data)
            res.json(poster);
        },
        'error': async(form)=>{
            let errors = {}
            for (let key in form.fields){   //gathering each error saved in caolan forms when input error occurs
                if (form.fields[key].error){
                    errors[key] = form.fields[key].error;
                }
            }
            res.json(errors);
        },
        'empty': async(form)=>{
            res.status(400);
            res.json({"error": "The form is empty"})
        }
    })
})




module.exports = router;