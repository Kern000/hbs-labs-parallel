const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Posters', {
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

module.exports = { Poster, Property, Artist };