const express = require('express')
const bodyParser = require('body-parser')
const mssql = require('mssql')
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

var userResponse;

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

  //opens connection pool on page load
  pool.connect(err => {
    console.log("Initial Open Pool Conn.")
    console.log(err);
  })

  //render index page
  res.render('index');
})

app.post('/', function (req, res) {
  console.log(req.body.agent);
  //if no pool connection exists for pool variable, connect pool for POST
  if(!pool) {
    pool.connect(err => {
      console.log("Opened pool conn in POST" + err);
    })
  }

  var request = new mssql.Request(pool);

  //sql queries to run
  var sql = "select usr_key, usr_email, usr_first_name, usr_last_name from users where usr_active_flag = 1 and usr_delete_flag = 0 and usr_email like '%" + req.body.agent + "%' order by usr_first_name asc";
  //var simplesql = "select top 1 * from users";
  console.log(sql);
  
  //request for sql queries, populated from database based on above queries
  request.query(sql, function(err, recordset) {
      userResponse = recordset;
      console.log("\nResponse Body:");
      console.log(userResponse);
      console.log("\nParsed Response:")
      //below populates based off of index of record set returned from query. Most queries only return one row, so the index of this row is 0.  
      console.log("User Key: " + userResponse.recordset[0]["usr_key"] + " User Email: " + userResponse.recordset[0]["usr_email"]);
  }); 

/*   if(pool) {
    console.log("Closed pool conn.")
    pool.close();
  } */
  res.render('index');  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})