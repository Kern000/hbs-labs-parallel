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
  await db.insert('artists',['name'],['Justin Bobber'])
  
  await db.insert('media_properties',['name','description','url'],['bts', 'cats', 'btscats.com'])
  await db.insert('media_properties',['name','description','url'],['dogs', 'woof', 'woof.com'])

  await db.insert('posters',['title','cost','description', 'date', 'stock', 'height', 'width', 'thickness'],['meow1', '100', 'cats', '2022-01-01', '100', '20', '20', '10'])
  await db.insert('posters',['title','cost','description', 'date', 'stock', 'height', 'width', 'thickness'],['meow2', '100', 'cats', '2022-01-01', '100', '20', '20', '10'])
  return db.insert('posters',['title','cost','description', 'date', 'stock', 'height', 'width', 'thickness'],['meow3', '100', 'cats', '2022-01-01', '100', '20', '20', '10'])

};

exports.down = async function(db) {
  return await db.query("DELETE FROM artists")
};

exports._meta = {
  "version": 1
};
