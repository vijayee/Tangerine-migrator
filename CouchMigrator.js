/*
 * This takes a lot of Tangerine documents and pumps them through any
 * transformations that may have been applied.
 * @todo make this 
 */


'use strict';

// constructor
// set up some defaults.
var CouchMigrator = function(opts) {

  this.docs = [];
  this.current = [];
  this.transforms = [];
  this.resultTransforms = {};
  this.collectionTransforms = {};
  this.batchTransforms= [];
  this.oldVersion = '';
  this.newVersion = '';
  this.opts= opts || {};

  return this;

};


// add documents
CouchMigrator.prototype.addDocs = function( docs ){
  this.docs = this.docs.concat(docs);
  return this;
};

// add a transformation
CouchMigrator.prototype.addTransform = function(transform) {
  this.transforms.push(transform);
  return this;
};

// add a transformation
CouchMigrator.prototype.addBatchTransform = function(transform) {
    this.batchTransforms.push(transform);
    return this;
};

// 
CouchMigrator.prototype.addCollectionTransform = function(c, transform) {
  if (this.collectionTransforms[c] === undefined) {
    this.collectionTransforms[c] = [];
  }

  this.collectionTransforms[c].push(transform);

  return this;

};



CouchMigrator.prototype.addResultTransform = function(p, transform) {

  if (this.resultTransforms[p] === undefined) {
    this.resultTransforms[p] = [];
  }

  this.resultTransforms[p].push(transform);

  return this;

};

// sets the versions these will apply to
CouchMigrator.prototype.versions = function(oldVersion, newVersion) {
  this.newVersion = newVersion;
  this.oldVersion = oldVersion;
  return this;
};


// actually do work
CouchMigrator.prototype.process = function() {

  this.docs.forEach( function(doc, dI) {


    // skip this document unless
    var versionSpecified = this.oldVersion !== '';
    var inappropriateDoc = doc.dbVersion   !== this.oldVersion;
    if ( versionSpecified && inappropriateDoc ) {
      return;
    }


    // run every top level transform on every doc
    this.transforms.forEach( function(transform, tI) {
      this.docs[dI] = transform(doc, this.opts);
    }, this); // top level transforms


    // collection level transforms
    var collectionTransforms = this.collectionTransforms[doc.collection] || [];
    collectionTransforms.forEach( function(transform, cI){
      this.docs[dI] = transform(doc, this.opts);
    }, this);


    // transform different types of documents
    if (doc.collection === 'result') {
      var arr = doc.subtestData;
      // array structure within results
      arr.forEach( function(protoResult, sI) {
        // if transforms exist for this protoResult
        var resultTransforms = ( this.resultTransforms[protoResult.prototype] || []);
        resultTransforms.forEach( function(transform){
          arr[sI] = transform(protoResult, this.opts);
        });

      }, this);

    } // end of "result"

    // tag the doc with the new version
    this.docs[dI].dbVersion = this.newVersion;

  }, this);

  return this;

};

CouchMigrator.prototype.processBatches = function() {
    this.batchTransforms.forEach(function(transform){
        transform(this.docs);
    }, this);
    return this;
}


CouchMigrator.prototype.done = function(callback) {
  callback(this.docs);
  return this;
};

module.exports = CouchMigrator;