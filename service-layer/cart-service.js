const cartDataLayer = require('../data-access-layer/cart-dal');

const fetchCartItems = async (userId) => {
    let cartItems = await cartDataLayer.fetchCartItems(userId);
    return cartItems;
}

const addToCart = async (userId, posterId, quantity) => {
    let cartItem = await cartDataLayer.fetchCartItemByUserAndProduct(userId, posterId);
    if (cartItem){
        let newQuantity = cartItem.get('quantity')+1;
        await cartDataLayer.updateItemQuantity(cartItem, userId=null, productId=null, newQuantity);
    } else {
        return await cartDataLayer.createCartItem(userId, posterId, quantity);
    }
}

const updateItemQuantity = async (userId, posterId, newQuantity) => {

    await cartDataLayer.updateItemQuantity(cartItem=null, userId, posterId, newQuantity);
}

const removeFromCart = async (userId, posterId) => {
    
    await cartDataLayer.removeFromCart(userId, posterId);
}

module.exports = {
                    fetchCartItems, 
                    addToCart, 
                    updateItemQuantity, 
                    removeFromCart
}