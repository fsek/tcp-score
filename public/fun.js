let dom = ''
let max_score = 16
let time_per_check_in_millis = 15 * 60 * 1000
let interval;
let current_max = 0
$(async function () {
  dom = window.location.origin
  console.log(dom)
  get_scores();
  get_time();

  $('.point-buttons a').on('click', async function () {
    let team = $(this).attr('team')
    let score = 0
    console.log($(this).attr('point-method'))
    if ($(this).attr('point-method') == "increment") {
      score = await increase_points(team)
      console.log('increasing')
    } else {
      score = await decrease_points(team)
      console.log('decreasing')
    }

    update_progress(team, score)
    get_scores()
    console.log(score)
  })


  let socket = io.connect('http://' + window.location.hostname + ':3001');

  socket.on('score_update', (scores) => {
    console.log('update')
    set_scores(scores)
  })

  socket.on('started competition', () => {
    clearInterval(interval)
    get_time();
  })
})

async function increase_points(team) {
  console.log(dom + '/increment_score/' + team);
  let score = 0
  await $.get(dom + '/increment_score/' + team, (data) => {
    score = data.score
  })

  return score
}

async function decrease_points(team) {
  let score = 0
  await $.get(dom + '/decrement_score/' + team, (data) => {
    score = data.score
  })

  return score
}

function get_scores() {
  $.get(dom + '/get_scores', (data) => {
    let scores = JSON.parse(data)
    let teams = $('.teams')[0].children
    set_scores(scores)
  });
}

function update_progress(teamCard, score) {

  let progress = Math.floor((score / max_score) * 100)
  if (score > current_max) {
    current_max = score
    $('#check').html(current_max)
  }
  $('#' + teamCard + ' .progress-bar').css('width', progress + '%').attr('aria-valuenow', progress)
}


function set_scores(scores) {
  let teams = $('.teams')[0].children
  let progress;
  let max = 0;
  for (let i = 0; i < teams.length; i++) {
    $(teams[i]).find('.card-text').html(scores[i] + '/' + max_score)
    progress = Math.floor((scores[i] / max_score) * 100)
    if (progress == 100) {
      alert('Wowowow, vinnaren är lag ' + i)
    }
    $(teams[i]).find('.progress-bar').css('width', progress + '%').attr('aria-valuenow', progress)
    if (parseInt(scores[i]) > current_max) {
      current_max = scores[i]
    }


    $('#check').html(current_max)

  }
}

function get_answer_req() {
  $.get(dom + '/get_answer_req', (data) => {
    let teams = $('.teams')[0].children
    let req = data.answer_req
    for (let i = 0; i < teams.length; i++) {
      let str = req[i] ? 'Ja' : 'Nej'
      $(teams[i]).find('#ansreq').html(str)
    }
  })
}

function get_time() {
  $.get(dom + '/get_time', (data) => {
    let timeStart = new Date(data.time_start).getTime()
    let totalTimeStart = new Date(data.total_time_start)
    console.log(timeStart);
    set_time(timeStart, totalTimeStart)
    update_time(data.time_start, data.total_time_start);
  })
}

function reset_time() {
  $.get(dom + '/reset_time', (data) => {
    let timeStart = new Date(data.time_start)
    let totalTimeStart = new Date(data.total_time_start)
    set_time(timeStart, totalTimeStart)
    update_time(data.time_start, data.total_time_start);
  })
}

function update_time(timeStart, totalTimeStart) {
  interval = setInterval(() => set_time(timeStart, totalTimeStart), 1000)
}

function set_time(timeStart, totalTimeStart) {
  let currentTime = Date.now()
  let timeLeft = timeStart - currentTime + time_per_check_in_millis
  let date
  if (timeLeft > 0) {
    date = new Date(timeLeft)
  } else {
    clearInterval(interval)
    reset_time()
    return;
  }

  let seconds = date.getSeconds(),
    minutes = date.getMinutes()

  let totalTime = currentTime - totalTimeStart

  let dateTotal = new Date(totalTime)
  let tHours = dateTotal.getHours() - 1,
    tMinutes = dateTotal.getMinutes(),
    tSeconds = dateTotal.getSeconds()

  $('#time').html(minutes + ':' + seconds)
  $('#total_time').html(tHours + ':' + tMinutes + ':' + tSeconds)
}
/*
function update_checkpoint(checkpoint) {
}

function fetch_new_checkpoint() {
  $.get(dom + '/increase_current_checkpoint', (data) => {
    timeStart = data.time_start
    update_checkpoint(data.current_checkpoint)
    set_time(timeStart)
    update_time(data.time_start);
  })
}

function fetch_checkpoint() {
  $.get(dom + '/get_current_checkpoint', (data) => {
    console.log(data);

    update_checkpoint(data.current_checkpoint)
  })
}
*/
