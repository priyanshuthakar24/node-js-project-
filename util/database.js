const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;
let _db;

const mongoConnect= (callback)=>{
    MongoClient.connect('mongodb+srv://priyanshuthakar24:%40pinku24@cluster0.c77xwlg.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client => {
        console.log('Connected');
        _db=client.db();
        callback();
    })
    .catch(err => {
        console.log(err);
        throw err;
    });
};
const getDb=()=>{
    if (_db){
        return _db;
    }
    throw 'No database Found!'
}
exports.mongoConnect=mongoConnect; 
exports.getDb=getDb;