let ramadanTimings = [];
let day = 0;

let [unixTime, currentTime, startOfDayUnix] = [0, 0, 0];

function updateTime() {
  unixTime = new Date().getTime() / 1000;
  currentTime = convertTimeToSec(new Date().toString().split(' ')[4]); // current Time in seconds
  startOfDayUnix = unixTime - currentTime; // unix time 12:00 am today
}

function convertTimeToSec(str) {
  let hours = parseInt(str.split(':')[0]);
  let minutes = parseInt(str.split(' ')[0].split(':')[1]);
  let seconds = parseInt(str.split(' ')[0].split(':')[2]) || 0;
  let totalMins = (hours * 60) + minutes;
  return ((totalMins * 60) + seconds);
}

function fetchTimings() {
  let date = new Date();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  return fetch(`https://api.aladhan.com/v1/calendarByCity?city=Dhaka&country=Bangladesh&method=1&month=${month}&year=${year}&tune=1`)
    .then(response => response.json())
    .then(res => {
      return res.data;
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function startTimer(callback) {
  updateTime();
  let sehriTime = convertTimeToSec(ramadanTimings[day].timings['Imsak']);
  let iftarTime = convertTimeToSec(ramadanTimings[day].timings['Sunset']);
  let toSehri = startOfDayUnix + sehriTime;
  let toIftar = startOfDayUnix + iftarTime;
  let passedSehri = (sehriTime - currentTime) < 0;
  let passedIftar = (iftarTime - currentTime) < 0;

  if (passedSehri && passedIftar) {
    day += 1;
    if (day < ramadanTimings.length) {
      sehriTime = convertTimeToSec(ramadanTimings[day].timings['Imsak']);
      iftarTime = convertTimeToSec(ramadanTimings[day].timings['Sunset']);
      toSehri = unixTime + (24*60*60 - currentTime) + sehriTime;
      toIftar = unixTime + (24*60*60 - currentTime) + iftarTime;
      passedSehri = false;
      passedIftar = false;
      document.getElementById('iftarTxt').classList.add('hide');
      document.getElementById('flipdownIftar').classList.add('hide');
      document.querySelector('.overlay img').classList.add('night');
    }
  }

  if (passedSehri && !passedIftar) {
    document.getElementById('sehriTxt').classList.add('hide');
    document.getElementById('flipdownSehri').classList.add('hide');
  }

  let flipdownSehri = new FlipDown(toSehri, 'flipdownSehri')
    .start()
    .ifEnded(() => {
      document.getElementById('flipdownSehri').innerHTML = '';
      document.getElementById('flipdownIftar').classList.remove('hide');
      document.getElementById('sehriTxt').classList.add('hide');
      document.getElementById('iftarTxt').classList.remove('hide');
    });
  let flipdownIftar = new FlipDown(toIftar, 'flipdownIftar')
    .start()
    .ifEnded(() => {
      document.querySelector('.overlay img').classList.add('night');
      if (day < ramadanTimings.length) {
        document.getElementById('flipdownIftar').innerHTML = '';
        document.getElementById('flipdownIftar').classList.add('hide');
        document.getElementById('flipdownSehri').classList.remove('hide');
        document.getElementById('iftarTxt').classList.add('hide');
        document.getElementById('sehriTxt').classList.remove('hide');
        startTimer();
      }
    });
  if (typeof callback === "function") {
    callback();
  }
}

function onLoadingComplete() {
  document.getElementsByTagName('body')[0].classList.remove('loading');
  anime({
    targets: '.message-container',
    translateX: [-150, 0],
    duration: 800,
    easing: 'cubicBezier(.5, .05, .1, .3)'
  });
  anime({
    targets: '.product-container img',
    translateY: [150, 0],
    duration: 600,
    opacity: [0,1],
    easing: 'easeInOutCubic'
  });
}

async function getDataAndStartTimer() {
  ramadanTimings = await fetchTimings();
  startTimer(onLoadingComplete);
}

function app() {
  document.getElementsByTagName('body')[0].classList.add('loading');
  getDataAndStartTimer();
}

app();