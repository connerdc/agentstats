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
    //console.log(err);
  })

  //render index page
  res.render('index');
})

app.post('/', function (req, res, next) {
  console.log("first middle ware");
  //if no pool connection exists for pool variable, connect pool for POST
  if(!pool) {
    pool.connect(err => {
      console.log("Opened pool conn in POST" + err);
    })
  } 
  next();
 }, function (req, res, next) {
  console.log("second middle ware");
  var request = new mssql.Request(pool);

  //sql queries to run
  var usersql = "select usr_key, usr_email, usr_first_name, usr_last_name from users where usr_active_flag = 1 and usr_delete_flag = 0 and usr_email like '%" + req.body.agent + "%' order by usr_first_name asc";
  var galandacdsql = "select agent_group_name, agent_group_acd_flag, usr_email, usr_key from gal_agentgroups AS ag join gal_agent2agentgroups AS a2g on a2g.agent_group_id = ag.agent_group_id join users on usr_key = a2g.agent_id where  agent_group_inactive = 0 and agent_group_delete_flag = 0 and usr_email like '%" + req.body.agent + "%' order by agent_group_name asc";
  //var simplesql = "select top 1 * from users";
  //console.log(galandacdsql);
  
  //request for sql queries, populated from database based on above queries
  /*
    Problem right now is with below. Returned data from query is not passing to response in .render below. Solution could be using next() to call another middleware function to call query function that is seperated from this POST. I think it could be inside as well but will need to look at how variables are passing around inside this.
  */
  request.query(galandacdsql, function(err, recordset) {
      console.log("SQL Query");
      userResponse = recordset;
      /* console.log("\nResponse Body:");
      console.log(userResponse);
      console.log("\nParsed Response:")
      //below populates based off of index of record set returned from query. Most queries only return one row, so the index of this row is 0. 
      for(var i=0; i<userResponse.recordset.length; i++) {
        console.log("User Email: " + userResponse.recordset[i]["usr_email"] + "\nAgent Group Name: " + userResponse.recordset[i]["agent_group_name"] + "\nIs ACD Group: " + userResponse.recordset[i]["agent_group_acd_flag"]);
      } */
      console.log(recordset);
  }); 
  next();
 }, function (req, res) {
  console.log("third middle ware");
  console.log(userResponse);
  res.render('index', userResponse.recordset[0]);  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})