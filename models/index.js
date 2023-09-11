const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName:'posters',

    property(){
        return this.belongsTo('Property')
    },

    artists(){
        return this.belongsToMany('Artist');
    }
});

const Property = bookshelf.model('Property',{
    tableName:'media_properties',

    posters(){
        return this.hasMany('Poster')
    }
})

const Artist = bookshelf.model('Artist',{
    tableName:'artists',

    posters(){
        return this.belongsToMany('Poster')
    }
})

const User = bookshelf.model('User',{

    tableName:'users',

    cartItems() {
        return this.belongsToMany('CartItem');      //one user many cart items
    }
})

const CartItem = bookshelf.model("CartItem", {

    tableName: 'cart_items',

    poster() {
        return this.belongsTo('Poster')     //One cart item only one poster product
    }
})

const BlackListedToken = bookshelf.model("BlackListedToken", {
    tableName: 'blacklisted_tokens'
})

module.exports = { Poster, Property, Artist, User, CartItem, BlackListedToken };