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

exports.up = async function(db) {
  await db.insert('artists',['name'],['Jon Wicked'])
  await db.insert('artists',['name'],['Cat Guy'])
  await db.insert('artists',['name'],['Weird Cat Guy'])
  await db.insert('artists',['name'],['Even Weirder Cat Guy'])
  return db.insert('artists',['name'],['Justin Bobber'])
};

exports.down = async function(db) {
  return await db.query("DELETE FROM artists")
};

exports._meta = {
  "version": 1
};
