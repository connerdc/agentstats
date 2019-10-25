const express = require('express')
const bodyParser = require('body-parser')
const mssql = require('mssql')
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

const pool = new mssql.ConnectionPool({
  user: 'it_qualityassurance',
  password: 'f3FszTRYRjiJ',
  server: 'sq14db-prpt02.sqis-corp.com',
  database: 'SelectCARE-SQS',
})

app.get('/', function (req, res) {
  if(pool) {
    pool.close();
  }
  pool.connect(err => {
    console.log(err);
  })
  res.render('index');
})

app.post('/', function (req, res) {
  console.log(req.body.agent);
  //pool.query('select usr_key, usr_first_name from users where usr_first_name = "Brandon"');
  var request = new mssql.Request(pool);
  request.query("select top 1 usr_email, usr_key from users where usr_first_name like '%Conner%'", function(err, recordset) {
    // ... error checks
    console.dir(recordset);
  }); 
  res.render('index');  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})