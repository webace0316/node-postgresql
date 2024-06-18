var async = require('async');
var helper = require('../test-helper');

var db = helper.client();

function createTableFoo(callback){
    db.query("create temp table foo(column1 int, column2 int)", callback);
}

function createTableBar(callback){
    db.query("create temp table bar(column1 text, column2 text)", callback);
}

function insertDataFoo(callback){
    db.query({
        name: 'insertFoo',
        text: 'insert into foo values($1,$2)',
        values:['one','two']
    }, callback );
}

function insertDataBar(callback){
    db.query({
        name: 'insertBar',
        text: 'insert into bar values($1,$2)',
        values:['one','two']
    }, callback );
}

function startTransaction(callback) {
    db.query('BEGIN', callback);
}
function endTransaction(callback) {
    db.query('COMMIT', callback);
}

function doTransaction(callback) {
    // The transaction runs startTransaction, then all queries, then endTransaction,
    // no matter if there has been an error in a query in the middle.
    startTransaction(function() {
        insertDataFoo(function() {
            insertDataBar(function() {
                endTransaction( callback );
            });
        });
    });
}

var steps = [
  createTableFoo,
  createTableBar,
  doTransaction,
  insertDataBar
]

async.series(steps, assert.success(function() {
  db.end()
}))
