const express = require("express");
const router = express.Router();

const { Posters } = require('../models');
const { bootstrapField, createPosterProductForm } = require('../forms');

router.get('/', async (req,res)=>{
    let posters = await Posters.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON()
    })
})

router.get('/add-poster', async (req, res) => {
    const posterForm = createPosterProductForm();
    res.render('posters/create',{
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/add-poster', (req,res)=>{
    const posterForm = createPosterProductForm();
    posterForm.handle(req, {
        "success":async (form)=>{
            const poster = new Posters();
            poster.set('title', form.data.title);
            poster.set('cost', form.data.cost);
            poster.set('description', form.data.description);
            poster.set('date', form.data.date);
            poster.set('stock', form.data.stock);
            poster.set('height', form.data.height);
            poster.set('width', form.data.width);
            await poster.save();
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
    const poster = await Posters.where({
        'id': posterId
    }).fetch({
        require:true
    })
    const posterForm = createPosterProductForm();
    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/:posterId/update', async (req,res)=>{

        const posterId = req.params.posterId;
        const poster = await Posters.where({
            'id': posterId
        }).fetch({
            require:true
        })

        const posterForm = createPosterProductForm();
        posterForm.handle(req, {
            "success":async (posterForm)=>{
                poster.set(posterForm.data);
                await poster.save();
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
    const poster = await Posters.where({
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
    const poster = await Posters.where({
        'id': posterId
    }).fetch({
        require:true
    })
    await poster.destroy();
    res.redirect('/posters');
})


module.exports=router;