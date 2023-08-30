const express = require('express');
const { createRegisterForm, bootstrapField, createLoginForm } = require('../forms');
const { User } = require('../models');
const router = express.Router();

const { checkAuthentication } = require('../middleware');
const crypto = require('crypto');

const getHashedPassword = (password) => {
    const hash = crypto.createHash('sha256');
    const hashedPassword = hash.update(password).digest('base64');
    return hashedPassword
}

router.get("/register", (req, res)=>{
    const userForm = createRegisterForm();
    res.render('user/register',{
        userForm: userForm.toHTML(bootstrapField)
    })
})

router.post("/register", (req, res)=>{
    const userForm = createRegisterForm();
    userForm.handle(req, {
            success: async (userForm) => {
                const user = new User();
                user.set({
                    name: userForm.data.name,
                    email: userForm.data.email,
                    password: getHashedPassword(userForm.data.password)
                })
                await user.save();
                req.flash("success", "Successful registration")
                res.redirect('/user/login')
            },
            error: async (userForm) =>{
                res.render('user/register', {
                    userForm: userForm.toHTML(bootstrapField)
                })
            },
            empty: async (userForm) =>{
                res.render('user/register', {
                    userForm: userForm.toHTML(bootstrapField)
                })
            }        
    })
}
)

router.get('/login', (req, res) => {
    const userForm = createLoginForm();
    res.render('user/login',{
        userForm: userForm.toHTML(bootstrapField)
    })
})

router.post('/login', (req,res) => {
    
    const userForm = createLoginForm();
    
    userForm.handle(req, {
        'success': async (userForm) => {
            const user = await User.where({
                email: userForm.data.email,
                password:getHashedPassword(userForm.data.password)
            }).fetch({
                require: false
            })

            if (user){
                req.session.user = {
                    id: user.get('id'),
                    name: user.get('name'),
                    email: user.get('email')
                }
                req.flash('success', 'Login Successful')
                res.redirect('/user/profile')
            } else {
                req.flash('error', 'Invalid Login');
                res.redirect('/user/login');
            }
        }
        // ,
        // 'error': async (userForm) => {
        //     res.render('user/login', {
        //         userForm: userForm.toHTML(bootstrapField)
        //     })
        // },
        // 'empty': async (userForm) => {
        //     res.render('user/login', {
        //       userForm: userForm.toHtml(bootstrapField)  
        //     })
        // }
    })
})

router.get('/profile', [checkAuthentication], (req, res) => {
    const user = req.session.user
    res.render('user/profile',{
        user
    })
})

router.get('/logout', [checkAuthentication], (req,res)=>{
    req.session.user = null;
    req.flash('success', 'See you soon')
    res.redirect('/user/login')
})


module.exports = router;