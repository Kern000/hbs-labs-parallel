const express = require("express");
const router = express.Router();
const { Poster } = require('../models');
const { bootstrapField, createPosterProductForm, createSearchForm } = require('../forms');
const { checkAuthentication } = require("../middleware");
const { fetchFormData, getAllProperties, getAllArtists, findPoster, addPoster } = require("../data-access-layer/poster-dal");

router.get('/', async (req,res)=>{

    let posters = await fetchFormData();

    res.render('posters/index', {
        'posters': posters.toJSON(),
    })
})

router.get('/search', async(req,res)=>{

    let allProperties = await getAllProperties();

    allProperties.unshift([0, '-----']);

    const allArtists = await getAllArtists();
    
    const searchForm = createSearchForm(allProperties, allArtists);

    let query = Poster.collection()

    searchForm.handle(req, {
        'success': async (searchForm) => {

            console.log('success route hit')

            if (searchForm.data.title) {
                console.log('search form title hit', searchForm.data.title)
                query.where('title', 'like', '%' + searchForm.data.title + '%')
            }

            if (searchForm.data.min_cost) {
                console.log('search form min cost hit', searchForm.data.min_cost)
                query.where('cost', '>=', searchForm.data.min_cost)
            }

            if (searchForm.data.max_cost) {
                console.log('search form max cost hit', searchForm.data.max_cost)
                query.where('cost', '<=', searchForm.data.max_cost)
            }

            if (searchForm.data.media_property_id && searchForm.data.media_property_id != 0) {
                console.log('search form media property id hit =>', searchForm.data.media_property_id)

                query.where('media_property_id', '=', searchForm.data.media_property_id)
            }

            if (searchForm.data.max_height){
                console.log('search form max height hit', searchForm.data.max_height)
                query.where('height', '<=', searchForm.data.max_height)
            }

            if (searchForm.data.max_width){
                console.log('search form max width hit', searchForm.data.max_width)
                query.where('width', '<=', searchForm.data.max_width)
            }

            if (searchForm.data.artists){
                console.log('search form artists hit', searchForm.data.artists)

                query.query('join', 'artists_posters', 'poster_id', 'posters.id')
                .where('artist_id', 'in', searchForm.data.artists.split(','))
            }

            const posters = await query.fetch({
                withRelated:['property', 'artists']
            })

            res.render('posters/search', {
                'posters': posters.toJSON(),
                'form': searchForm.toHTML(bootstrapField)
            })
        },
        'error': async (searchForm) => {

            const posters = await query.fetch({
                withRelated:['property', 'artists']
            })

            res.render('posters/search', {
                'posters': posters.toJSON(),
                'form': searchForm.toHTML(bootstrapField)
            })
        },
        'empty': async (searchForm) => {

            const posters = await query.fetch({
                withRelated:['property', 'artists']
            })

            res.render('posters/search', {
                'posters': posters.toJSON(),
                'form': searchForm.toHTML(bootstrapField)
            })
        }
    })

})



router.get('/add-poster', async (req, res) => {

    const allProperties = await getAllProperties();
    const allArtists = await getAllArtists();

    const posterForm = createPosterProductForm(allProperties, allArtists);
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/add-poster', checkAuthentication, async (req,res)=>{

    const allProperties = await getAllProperties();
    const allArtists = await getAllArtists();

    const posterForm = createPosterProductForm(allProperties, allArtists);
    posterForm.handle(req, {
        "success":async (posterForm)=>{

            let poster = await addPoster(posterForm);

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
    const poster = await findPoster(posterId);

    const allProperties = await getAllProperties();
    const allArtists = await getAllArtists();

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

router.post('/:posterId/update', [checkAuthentication], async (req,res)=>{

        const posterId = req.params.posterId;

        const poster = await findPoster(posterId);

        const allProperties = await getAllProperties();
        const allArtists = await getAllArtists();
    
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
    
    const poster = await findPoster(posterId);

    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
})

router.post('/:posterId/delete', [checkAuthentication], async (req,res)=>{
    let posterId = req.params.posterId;
    
    const poster = await findPoster(posterId);

    await poster.destroy();
    res.redirect('/posters');
})


module.exports=router;