const express = require('express');
const myModule = require('./MyModule');
const mysql = require('mysql');
const MyModule = require('./MyModule');

const db = mysql.createConnection({
    host     : '127.0.0.1',
    user     : 'root',
    password : '',
    database : 'nodemysql'
  });

  // Connect DB
db.connect((err) => {
    if(err) throw err;
    console.log('MySQL connected...');
});

const app = express();

//Create new DB
app.get('/createdb', (req, res) => {
    let sql = 'CREATE DATABASE IF NOT EXISTS nodemysql';
    db.query(sql, (err, result) => {
        if(err) throw err;
        res.send('Database created or existed already...');
    })
});

// Create table
app.get('/createposttable', (req, res) => {
    let sql = 'CREATE TABLE IF NOT EXISTS posts(id int AUTO_INCREMENT, title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))';
    db.query(sql, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('<h1>Posts table created!<h1>');
    });
});

//Insert post 2
app.get('/addpost2', (req, res) => {
    let post = {title:'Post Two', body:'This is post number two'};
    let sql = 'INSERT INTO posts SET ?';
    let query = db.query(sql, post, (err, result) => {
        if(err) throw err;
        console.log(result);
        res.send('<h1>POST INSERTED<h1>');
    });
});

//Select Records
app.get('/getposts', (req, res, db) => {
    MyModule.test();
});

//Select Records
app.get('/getposts/:id', (req, res) => {
    MyModule.test(req, res, db);
});

app.get('/getjson/:id', (req, res) => {
    let json = {
        id: parseInt(req.params.id),
        name: "Hans",
        number: 2.5
    };
    res.send(json);
});

app.use(express.static('public/'))
app.listen(8080, () => {
    console.log('Server listening at 8080');
});

//console.log('Hello World');
//console.log(myModule.alphabet);
//myModule.test();