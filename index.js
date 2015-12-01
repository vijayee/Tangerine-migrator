
'use strict';

// check for needed environment variables
if (!(process.env.T_ADMIN && process.env.T_PASS)) {
  console.log('Please set T_ADMIN and T_PASS environment variables.');
  process.exit(1);
}

var unirest = require('unirest'); // rest client
var CouchMigrator = require('./CouchMigrator'); // processing for docs

// Transformations from 0 or ' to version 1
var startTime     = require('./transforms/startTime');
var gridValues    = require('./transforms/gridValues');
var gridKeys      = require('./transforms/gridKeys');
var orderMap      = require('./transforms/orderMap');
var participantId = require('./transforms/participantId');
var version       = require('./transforms/version');
var surveyValues  = require('./transforms/surveyValues');
var classResult   = require('./transforms/classResult');
var sequenceId   = require('./transforms/sequenceId');
var Sequence = require('base62sequence');
var opts={};
opts.sequence= new Sequence(0);
opts.mapping= {};

var JSON_HEADERS = {
  'Accept'       : 'application/json',
  'Content-Type' : 'application/json'
};

/*
 * Configuration
 */

// These should only change in a new migrator or @todo make this automatic
var OLD_VERSION = '';
var NEW_VERSION = 1;

var CHUNK_SIZE = 500; // kinda arbitrary

var groups = []; // list of groups to transform

var doGroup = function() {

  if (groups.length === 0) { return; } // exit when we're all done the groups

  var groupName = groups.pop();

  console.log('\n\n' + groupName);

  var docCount = 0;
  var lastId = '';

  var beforeDocSize = 0;
  var afterDocSize = 0;

  var timeBegin = (new Date()).getTime();

  var doOne = function() {

    // weird couchdb pagination
    // this limit stuff just makes sure we get a consistent amount of documents
    // except for the very last call that is
    var limit;
    if (lastId === '') {
      limit = CHUNK_SIZE;
    } else {
      limit = CHUNK_SIZE + 1;
    }

    unirest.get('http://dev.tangerinecentral.org/db/group-'+groupName+'/_all_docs?include_docs=true&limit='+limit+'&startkey='+JSON.stringify(lastId))
      .headers(JSON_HEADERS)
      .auth(process.env.T_ADMIN, process.env.T_PASS)
      .end(function (response) {

        var rows = response.body.rows;
        console.log( 'fetched ' + rows.length + ' rows, lastId: ' + lastId );

        // weird couchdb pagination
        if ( lastId !== '' ) {
          rows.shift(); // throw out the first document if we used a startkey
        }

        // exit if we didn't get any new documents
        var onlyGotTheStartDoc = rows.length === 1;
        var didntGetAnything = rows.length === 0;
        if ( onlyGotTheStartDoc || didntGetAnything ) {
          console.log('All done');
          console.log('Old size: ' + beforeDocSize);
          console.log('New size: ' + afterDocSize + ' (' + parseInt((afterDocSize/beforeDocSize)*100)+'%)');
          console.log('That took ' + (parseInt((new Date()).getTime() - timeBegin)/1000));
          return doGroup();
        }

        // count how many documents we've seen so far
        docCount = docCount + rows.length;

        // set us up for next loop
        lastId = response.body.rows[response.body.rows.length - 1].id;

        /*
         * Do real work below here
         */
        var docs = rows
          .filter(function(el){ return el.id.substring(0,8) !== '_design/'; }) // axe design docs
          .map( function(row) { return row.doc; } );                           // return only the docs

        beforeDocSize += JSON.stringify(docs).length;

        var migrator = new CouchMigrator(opts);
        migrator
          .addDocs(docs)
          .versions(OLD_VERSION, NEW_VERSION)
          .addTransform(classResult)
          .addBatchTransform(sequenceId)
          .addCollectionTransform('result', startTime)
          .addCollectionTransform('result', orderMap)
          .addCollectionTransform('result', version)
          .addCollectionTransform('result', version)
          .addResultTransform('id', participantId)
          .addResultTransform('grid', gridKeys)
          .addResultTransform('grid', gridValues)
          .addResultTransform('survey', surveyValues)
          .process()
          .processBatches()
          .done(function(docs){

            afterDocSize += JSON.stringify(docs).length;

            var localGroupPath = 'g-' + groupName;

            unirest.put('http://localhost:5984/')
              .headers(JSON_HEADERS)
              .auth(process.env.T_ADMIN, process.env.T_PASS)
              .end(function (response) {

                if (!response.error) {
                  console.log('database ('+localGroupPath+') created');
                }

                unirest.post('http://localhost:5984/'+localGroupPath+'/_bulk_docs')
                  .headers(JSON_HEADERS)
                  .auth(process.env.T_ADMIN, process.env.T_PASS)
                  .send({docs:docs})
                  .end(function (response) {
                    console.log("write errors: " +
                      response.body
                        .map(function(el){return el.error;})
                        .filter(function(el){return el;})
                        .length);

                    process.nextTick(doOne); // clear the stack

                  });

              });

          });

        // do work above here, call doOne when done a step

      });

  };

  doOne(); // kick it off


};

doGroup(); // kick off a group
