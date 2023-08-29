'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.createTable('posters_artists',{
    id: {
      type: 'int',
      primaryKey: true,
      autoIncrement: true
    },
    poster_id:{
        type:'int',
        primaryKey: true,
        notNull: true,
        unsigned: true,
        foreignKey: {
          name:'posters_artists_poster_fk',
          table: 'posters',
          mapping: 'id',
          rules: {
            onDelete: 'restrict',
            onUpdate: 'restrict'
          }
        }
    },
    artist_id: {
      type:'int',
      notNull: true,
      unsigned: true,
      foreignKey: {
        name:'posters_artists_artist_fk',
        table: 'artists',
        mapping: 'id',
        rules: {
          onDelete: 'restrict',
          onUpdate: 'restrict'
        }
      }
    }
  })
};

exports.down = function(db) {
  return db.dropTable('posters_artists');
};

exports._meta = {
  "version": 1
};
