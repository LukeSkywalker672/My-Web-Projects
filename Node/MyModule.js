module.exports = {
    alphabet: 'abc',
    test: function(req, res, db) {
        let sql = `SELECT * FROM posts WHERE id=${req.params.id}`;
        let query = db.query(sql, (err, result) => {
        if(err != null || result.length == 0) {
            res.send("<h1 style='color:red;'>Post does not exist.</h1>");
            console.log("Invalid Post ID!");
            return;
        }
        console.log("--Post found in DB");
        console.log(result);
        res.send(`<h1>post ${result[0].id} fetched<h1><h2>${result[0].title}</h2><p>${result[0].body}</p>`);
        });
    }
}