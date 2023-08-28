const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Posters', {
    tableName:'posters',

    property(){
        return this.belongsTo('Property')
    }
});

const Property = bookshelf.model('Property',{
    tableName:'media_properties'
})

module.exports = { Poster, Property };