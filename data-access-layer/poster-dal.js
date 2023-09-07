const { Poster, Property, Artist } = require("../models")

const getAllPosters = async () => {
    return await Poster.fetchAll();
}


const fetchFormData = async () => {

    const posters = await Poster.collection().fetch(
        {
            withRelated:['property', 'artists']
        }
        );
    return posters
}

const getAllProperties = async () => {

    const allProperties = await Property.fetchAll().map(property => [property.get('id'), property.get('name')]);
    return allProperties;
}

const getAllArtists = async () => {

    const allArtists = await Artist.fetchAll().map(artist => [artist.get('id'), artist.get('name')]);
    return allArtists;
}

const findPoster = async (posterId) => {

    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require:true,
        withRelated:['property', 'artists']
    })

    return poster
}

const addPoster = async (posterForm) => {

    const poster = new Poster();
    poster.set('title', posterForm.data.title);
    poster.set('cost', posterForm.data.cost);
    poster.set('description', posterForm.data.description);
    poster.set('date', posterForm.data.date);
    poster.set('stock', posterForm.data.stock);
    poster.set('height', posterForm.data.height);
    poster.set('width', posterForm.data.width);
    poster.set('media_property_id', posterForm.data.media_property_id);
    poster.set('image_url', posterForm.data.image_url);
    poster.set('thumbnail_url', posterForm.data.thumbnail_url)
    await poster.save();

    return poster;
}

module.exports= {
                    fetchFormData,
                    getAllProperties,
                    getAllArtists,
                    findPoster,
                    addPoster,
                    getAllPosters
                }