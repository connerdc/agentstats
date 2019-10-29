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
  res.render('index', {recordset: "" });
})
//State: "", 'Gal/Enroll': "", "User Email": "", "User Key": "", for above to change back to variable passing

function initializeConn(req, res, next) {
  console.log("Callback 1");
  next();
}

function galAndACDStates(req, res, next) {
  var request = new mssql.Request(pool);
  console.log("Callback 2");

  //sql queries to run
  var usersql = "select usr_key, usr_email, usr_first_name, usr_last_name from users where usr_active_flag = 1 and usr_delete_flag = 0 and usr_key ='" + req.body.agent + "' order by usr_first_name asc";
  var pastduecalendarsql = "select eventcalendar.act_account_id as AccountID, eventcalendar.evc_title as EventTitle,eventcalendar.evc_specific_date_time_from_now as TimeOfEvent, eventcalendar.evc_dismissed as IsDismissed,eventcalendar.evc_google_api_log as GoogleAPILog, users.usr_email as UserEmail from eventcalendar join users on eventcalendar.usr_user_id = users.usr_key where usr_user_id in (select usr_key from users where usr_key ='" + req.body.agent + "' and evc_specific_date_time_from_now < getdate() and usr_active_flag = 1 and usr_delete_flag = 0)and evc_dismissed = 0 order by users.usr_email desc, evc_specific_date_time_from_now desc";
  var galandacdsql = "select agent_group_name, agent_group_acd_flag, usr_email, usr_key from gal_agentgroups AS ag join gal_agent2agentgroups AS a2g on a2g.agent_group_id = ag.agent_group_id join users on usr_key = a2g.agent_id where  agent_group_inactive = 0 and agent_group_delete_flag = 0 and usr_key ='" + req.body.agent + "' order by agent_group_name asc";
  var galandenrollstatessql = "select sta_full_name AS 'State', stl_type AS 'Gal/Enroll', usr_email AS 'User Email', usr_key AS 'User Key' from state_licensure join users on usr_key = stl_usr_key join states on sta_key = stl_sta_key where usr_key ='" + req.body.agent + "' order by stl_type, sta_full_name asc";
  //, usr_email AS 'User Email', usr_key AS 'User Key' FOR ABOVE QUERY
  request.query(galandenrollstatessql, function(err, recordset) {
    console.log("SQL Query");
    userResponse = recordset;
    console.log(recordset);
    next();
  }); 
}

function renderStatistics(req, res, next) {
  console.log("Callback 3");
  console.log("Render response object:\n" + userResponse.recordset[1] + "\n");
  //app.set('json spaces', 2);
  //res.send(userResponse.recordset);
  res.render("index", userResponse);
}

app.post('/', initializeConn, galAndACDStates, renderStatistics);

/*app.post('/', function (req, res, next) {
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
  
  //Problem right now is with below. Returned data from query is not passing to response in .render below. Solution could be using next() to call another middleware function to call query function that is seperated from this POST. I think it could be inside as well but will need to look at how variables are passing around inside this.
  next();
}, function (req, res, next) {
  request.query(galandacdsql, function(err, recordset) {
      console.log("SQL Query");
      userResponse = recordset;
      console.log(recordset);
  }); 
  next();
}, function (req, res) {
  console.log("third middle ware");
  console.log(userResponse);
  res.render('index', );  
}) */

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})