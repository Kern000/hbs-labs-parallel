const express = require('express');
const router = express.Router();

const cartService = require('../service-layer/cart-service')
const Stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// customer pay to stripe, no credit card credentials to our server

router.get('/', async (req, res)=>{

    console.log('checkout route hit')

    const cartBeingCheckedOut = await cartService.fetchCartItems(req.session.user.id);
    const lineItems = [];

    for (let cartItem of cartBeingCheckedOut){
    
        const lineItem = {
                            "quantity": cartItem.get('quantity'),
                            "price_data":{
                                            "currency": "SGD",
                                            "unit_amount": cartItem.related('poster').get('cost'),
                                            "product_data": {
                                                                "name": cartItem.related('poster').get('title'),
                                                                "metadata": {
                                                                                'product_id': cartItem.get('poster_id')
                                                                            }
                                                            }
                                        }
        }  

        if (cartItem.related('poster').get('thumbnail_url')){
            lineItem.price_data.product_data.images = [cartItem.related('poster').get('thumbnail_url')]
        }

        lineItems.push(lineItem);
    }

    const payment = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: "https://3000-kern000-hbslabsparallel-64lev91e82i.ws-us104.gitpod.io/user/profile",
        cancel_url: "https://3000-kern000-hbslabsparallel-64lev91e82i.ws-us104.gitpod.io/cart",
    }

    const stripeSession = await Stripe.checkout.sessions.create(payment);

    res.render('checkout/index', {
        payment_url: stripeSession.url
    })
})

// Receiving payment from stripe

router.post('/process-payment', express.raw({type:'application/json'}), async(req,res)=>{
    console.log('process payment route hit')

    const payload = req.body;
    const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET;
    const signatureHeader = req.headers['stripe-signature'];

    let event;

    try {
        event = Stripe.webhooks.constructEvent(payload, signatureHeader, endpointSecret);

        res.json({
            received: true
        })
    } catch (error) {
        res.json({
            'error': error.message
        })
        console.log(error.message)
    }

    if (event.type == "checkout.session.completed"){
        const stripeSession= event.data.object;
        console.log(stripeSession);
    }
})



module.exports = router;




