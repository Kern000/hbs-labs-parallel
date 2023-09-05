const express = require("express");
const router = express.Router();
const { Poster, Property, Artist } = require('../models');
const { bootstrapField, createPosterProductForm } = require('../forms');
const async = require('hbs/lib/async');
const { checkAuthentication } = require("../middleware");

router.get('/', async (req,res)=>{
    let posters = await Poster.collection().fetch(
    {
        withRelated:['property', 'artists']
    });
    res.render('posters/index', {
        'posters': posters.toJSON(),
    })
})

router.get('/add-poster', async (req, res) => {

    const allProperties = await Property.fetchAll().map(property => [property.get('id'), property.get('name')])

    const allArtists = await Artist.fetchAll().map(artist => [artist.get('id'), artist.get('name')])

    const posterForm = createPosterProductForm(allProperties, allArtists);
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/add-poster', checkAuthentication, async (req,res)=>{

    const allProperties = await Property.fetchAll().map(property => [property.get('id'), property.get('name')])

    const allArtists = await Artist.fetchAll().map(artist => [artist.get('id'), artist.get('name')])

    const posterForm = createPosterProductForm(allProperties, allArtists);
    posterForm.handle(req, {
        "success":async (posterForm)=>{
            const poster = new Poster();
            console.log(posterForm.data);

            poster.set('title', posterForm.data.title);
            poster.set('cost', posterForm.data.cost);
            poster.set('description', posterForm.data.description);
            poster.set('date', posterForm.data.date);
            poster.set('stock', posterForm.data.stock);
            poster.set('height', posterForm.data.height);
            poster.set('width', posterForm.data.width);
            poster.set('media_property_id', posterForm.data.media_property_id);
            poster.set('image_url', posterForm.data.image_url);
            poster.set('thumbnail_url', posterForm.data.thumbnail_url)
            await poster.save();

            if (posterForm.data.artists){
                await poster.artists().attach(posterForm.data.artists.split(','));
            }
            req.flash("success", "New product has been created successfully!")
            res.redirect('/posters');
        },
        "error":(posterForm)=>{
            res.render('posters/create', {
               'form': posterForm.toHTML(bootstrapField) 
            })
        },
        "empty":(posterForm)=>{
            // the form is empty
            res.render('posters/create', {
                'form': posterForm.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/:posterId/update', async (req,res)=>{
    const posterId = req.params.posterId;
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require:true,
        withRelated:['property', 'artists']
    })

    const allProperties = await Property.fetchAll().map(property => [property.get('id'), property.get('name')]) 

    const allArtists = await Artist.fetchAll().map(artist => [artist.get('id'), artist.get('name')])

    const posterForm = createPosterProductForm(allProperties, allArtists);
    posterForm.fields.title.value = await poster.get('title');
    posterForm.fields.cost.value = await poster.get('cost');
    posterForm.fields.description.value = await poster.get('description');
    posterForm.fields.date.value = await poster.get('date');
    posterForm.fields.stock.value = await poster.get('stock');
    posterForm.fields.height.value = await poster.get('height');
    posterForm.fields.width.value = await poster.get('width');
    posterForm.fields.media_property_id.value = await poster.get('media_property_id');
    posterForm.fields.image_url.value = await poster.get('image_url');
    posterForm.fields.thumbnail_url.value = await poster.get('thumbnail_url');

    const selectedArtists = await poster.related('artists').pluck('id');
    posterForm.fields.artists.value = selectedArtists;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/:posterId/update', async (req,res)=>{

        const posterId = req.params.posterId;
        const poster = await Poster.where({
            'id': posterId
        }).fetch({
            require:true,
            withRelated:['property', 'artists']
        })

        const allProperties = await Property.fetchAll().map(property => [property.get('id'), property.get('name')])

        const allArtists = await Artist.fetchAll().map(artist => [artist.get('id'), artist.get('name')])

        const posterForm = createPosterProductForm(allProperties, allArtists);
        posterForm.handle(req, {
            "success":async (posterForm)=>{
                let {artists, ...posterData} = posterForm.data
                poster.set(posterData);
                await poster.save();

                const alreadyIndicatedArtists = await poster.related('artists').pluck('id');
                await poster.artists().detach(alreadyIndicatedArtists);
                await poster.artists().attach(posterForm.data.artists.split(','))

                res.redirect('/posters');
            },
            "error":(posterForm)=>{
                res.render('posters/update', {
                   'form': posterForm.toHTML(bootstrapField),
                   'poster': poster.toJSON()
                })
            },
            "empty":(posterForm)=>{
                // the form is empty
                res.render('posters/update', {
                    'form': posterForm.toHTML(bootstrapField),
                    'poster': poster.toJSON()
                })
            }
        })
})

router.get('/:posterId/delete', async (req,res)=>{
    let posterId = req.params.posterId;
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require:true
    })
    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
})

router.post('/:posterId/delete', async (req,res)=>{
    let posterId = req.params.posterId;
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require:true
    })
    await poster.destroy();
    res.redirect('/posters');
})


module.exports=router;