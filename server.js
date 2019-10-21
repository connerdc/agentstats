const express = require('express')
const bodyParser = require('body-parser')
const mssql = require('mssql')
const app = express()

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs')

const pool = new mssql.ConnectionPool({
  user: 'SQSENIOR\\con900048',
  password: 'Rennoc1995',
  server: 'sq14db-prpt02.sqis-corp.com',
  database: 'SQS-Senior',

  options: {
    trustedConnection: true
  }
})

app.get('/', function (req, res) {
  res.render('index');
})

app.post('/', function (req, res) {
  console.log(req.body.agent);
  pool.connect(err => {
    console.log(err);
  })
  res.render('index');  
})

app.listen(3000, function () {
  console.log('Example app listening on port 3000!')
})