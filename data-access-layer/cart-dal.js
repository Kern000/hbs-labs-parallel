const { CartItem } = require('../models');

const fetchCartItems = async (userId) => {

    let cartItems = await CartItem.collection()
                    .where({'user_id': userId})
                    .fetch({
                        'require': false,
                        'withRelated': ['poster', 'poster.property', 'poster.artists']
                    })

    return cartItems;
}

const createCartItem = async (userId, posterId, quantity) => {
    const cartItem = new CartItem({
        'user_id': userId,
        'poster_id': posterId,
        'quantity': quantity
    })
    await cartItem.save();
    return cartItem;
}

const fetchCartItemByUserAndProduct = async (userId, posterId) => {
    const cartItem = await CartItem.where({
        'user_id': userId,
        'poster_id': posterId
    }).fetch({
        require: false
    })
    return cartItem;
}

const updateItemQuantity = async (cartItem = null, userId = null, posterId = null, newQuantity = null) => {

    if(!cartItem){
        cartItem = await fetchCartItemByUserAndProduct(userId, posterId);
    }

    if (cartItem){
        cartItem.set('quantity', newQuantity);
        await cartItem.save();
    }
}

const removeFromCart = async (userId, posterId) => {
    const cartItem = await fetchCartItemByUserAndProduct(userId, posterId);
    console.log(cartItem)
    await cartItem.destroy();
}

module.exports = {
                    fetchCartItems, 
                    createCartItem, 
                    fetchCartItemByUserAndProduct, 
                    updateItemQuantity, 
                    removeFromCart
}