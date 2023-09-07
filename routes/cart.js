const express = require('express');
const router = express.Router();
const cartService = require('../service-layer/cart-service');
const { checkAuthentication } = require('../middleware');

router.get('/', [checkAuthentication], async(req,res)=>{

    const itemsInCart = await cartService.fetchCartItems(req.session.user.id);
    return res.render('cart/index',{
        'itemsInCart': itemsInCart.toJSON()
    })
})

router.post('/:poster_id/add', [checkAuthentication], async (req, res) => {

    const cartItem = await cartService.addToCart(
        req.session.user.id,
        req.params.poster_id,
        1
    );
    req.flash('success', "Added item to cart!");
    res.redirect("/cart")
})

router.post('/:poster_id/update-quantity', [checkAuthentication], async (req,res)=> {

    const newQuantity = req.body.newQuantity;
    await cartService.updateItemQuantity(
        req.session.user.id,
        req.params.poster_id,
        newQuantity
    );
    req.flash('success', 'Updated item quantity');
    res.redirect('/cart');
})

router.post('/:poster_id/delete', [checkAuthentication], async(req,res)=>{

    await cartService.removeFromCart(
        req.session.user.id,
        req.params.poster_id
    )
    req.flash('success', 'Removed item from cart')
    res.redirect('/cart');
})

module.exports = router;
