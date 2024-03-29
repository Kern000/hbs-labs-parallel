'use strict';

const { VARCHAR } = require("mysql/lib/protocol/constants/types");

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
  return db.createTable('media_properties',{
    id: {
      type:'int',
      unsigned: true,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: 'string',
      length: 100,
      notNull: true
    },
    description: {
      type: 'string',
      length: 255,
      notNull: true
    },
    url: {
      type: 'string',
      length: 60,
      notNull: true
    }
  })
};

exports.down = function(db) {
  return db.dropTable('media_properties')
};

exports._meta = {
  "version": 1
};
