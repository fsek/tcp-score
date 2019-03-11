const express = require('express')
const fs = require('fs')
const readLine = require('readline')
const io = require('socket.io')(3001);
const app = express()
const port = 3000
let timeStart = Date.now()
let totalTimeStart = timeStart
app.use(express.static('public'))
let answer_req = [true, true, true]

let team_scores = []
const rl = readLine.createInterface({
  input: fs.createReadStream('team_scores.dat')
});

rl.on('line', (line) => {
  team_scores = line.split(',').map((dat) => parseInt(dat, 10))
  console.log('Read file, current scores: ' + team_scores)
})

app.all('/', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});

app.get('/', (req, res) => res.send('Hello World!'))

app.get('/get_time', (req, res) => {

  res.send({ time_start: timeStart, total_time_start: totalTimeStart })
})

io.on('connection', function (socket) {
  io.clients((error, clients) => {
    if (error) throw error;
    console.log(clients); // => [PZDoMHjiu8PYfRiKAAAF, Anw2LatarvGVVXEIAAAD]
  });
});

app.get('/start', (req, res) => {
  totalTimeStart = Date.now()
  timeStart = totalTimeStart
  io.emit('started competition')
  res.send({ time_start: totalTimeStart })
})

app.get('/start_at_time/:date', (req, res) => {
  /*
  let timeDecrementHours = new Date(Date.now()).getHours() - parseInt(req.params["hour"])
  console.log(timeDecrementHours)
  let timeDecrementMinutes = new Date(Date.now()).getMinutes() - parseInt(req.params["minute"])
  console.log(timeDecrementMinutes)
  let timeDecrement = timeDecrementHours * 60 * 60 * 1000 + timeDecrementMinutes * 60 * 1000*/
  totalTimeStart = new Date(req.params["date"]).getTime()
  res.send({ time_start: totalTimeStart })
})


app.get('/reset_time', (req, res) => {
  timeStart = Date.now()
  answer_req = [true, true, true]
  res.send({ time_start: timeStart, total_time_start: totalTimeStart })
})

app.get('/get_answer_req', (req, res) => {
  res.send({ answer_req })
})


app.get('/increment_score/:team', (req, res) => {
  team_scores[req.params["team"]] += 1
  answer_req[req.params["team"]] = false
  saveFile(team_scores)
  io.emit('score_update', team_scores)
  res.send({ score: team_scores[req.params["team"]] })
})

app.get('/decrement_score/:team', (req, res) => {
  team_scores[req.params["team"]] -= 1
  saveFile(team_scores)
  io.emit('score_update', team_scores)
  res.send({ score: team_scores[req.params["team"]] })
})

function saveFile(scores) {
  team_scores = scores
  console.log(team_scores)
  if (scores.length != 3) {
    console.log('Not a valid array')
    return;
  }

  fs.writeFile('team_scores.dat', scores, (err) => {
    if (err) throw err;
    console.log('The file has been saved!');
  })
}

app.get('/get_scores', (req, res) => {
  console.log(JSON.stringify(team_scores))
  res.send(JSON.stringify(team_scores))
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))
