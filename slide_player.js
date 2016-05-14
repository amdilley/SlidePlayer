// Depends on YouTube API available here:
// https://s.ytimg.com/yts/jsbin/www-widgetapi-vflWykQrU/www-widgetapi.js
var SlidePlayer = function (playerOptions, slideOptions) {
  this.slidesContainer = document.getElementById(slideOptions.containerId);
  this.slides = slideOptions.slides || [];
  this.events = [];
  this.currentTimeouts = [];
  this.initCallbacks = [];
  this.slideIndex = -1;
  
  new YT.Player(playerOptions.containerId, {
    width: playerOptions.width,
    height: playerOptions.height,
    videoId: playerOptions.videoId,
    events: {
      'onReady': this.init.bind(this),
      'onStateChange': this.onChange.bind(this)
    }
  });
};

SlidePlayer.prototype = {
  /*
   * Specifies event to take place at point during video play.
   * @param {string} tiemStr time in seconds or percentage video complete
   * @param {function} callback function to be executed at specified time
   * @return {object}
   */
  at: function (timeStr, callback) {
    var eventObj = {
      time: timeStr,
      callback: callback.bind(this)
    };

    this.events.push(eventObj);

    return this;
  },

  /*
   * Resets all event timeouts.
   */
  clearEvents: function () {
    this.currentTimeouts.forEach(clearTimeout);
  },

  /*
   * Inserts slide in slide container and updates slide index.
   * @param {number} index index of desired slide
   */
  goToSlide: function (index) {
    var slide = this.slides[index];

    if (slide) {
      this.loadSlide(this.slides[index]);
      this.slideIndex = index;
    }
  },

  /*
   * Hides YouTube player.
   */
  hide: function () {
    this.player.getIframe().style.display = 'none';
  },

  /*
   * Initializes player.
   */
  init: function (e) {
    this.player = e.target;
    this.duration = this.player.getDuration();

    while (this.initCallbacks.length) {
      this.initCallbacks[0]();
      this.initCallbacks.shift();
    }

    // parses time strings once video metadata has loaded
    for (var i = 0; i < this.events.length; i++) {
      this.events[i].time = this.parseTime(this.events[i].time);
    }
  },

  /*
   * Inserts HTML into slide container.
   * @param {string} slide HTML to be inserted in slide container
   */
  loadSlide: function (slide) {
    this.slidesContainer.innerHTML = slide;
  },

  /*
   * Go to next slide relative to current slide index.
   */
  nextSlide: function () {
    this.goToSlide(this.slideIndex + 1);
  },

  /*
   * Controller for video state change.
   */
  onChange: function (e) {
    switch (e.data) {
      case YT.PlayerState.BUFFERING:
        this.onBuffer();
        break;

      case YT.PlayerState.PLAYING:
        this.onPlay();
        break;

      case YT.PlayerState.PAUSED:
        this.onPause();
        break;

      case YT.PlayerState.ENDED:
        this.onEnd();
        break;

      default:
        return;
    }
  },

  /*
   * Handles video dealy due to buffer.
   */
  onBuffer: function () {
    this.clearEvents();
  },

  /*
   * Handles video end event.
   */
  onEnd: function () {

  },

  /*
   * Handles video pause event.
   */
  onPause: function () {
    this.clearEvents();
  },

  /*
   * Handles video play event.
   */
  onPlay: function () {
    this.setEvents();
  },

  /*
   * Temporarily stops video play.
   */
  pause: function () {
    this.player.pauseVideo();
  },

  /*
   * Takes a number (in seconds) or a percentage and returns
   * number of milliseconds into video this represents.
   * @param {string} timeStr seconds, percentage into video (e.g. '6' or '25%'), or state ('end')
   * @return {number}
   */
  parseTime: function (timeStr) {
    if (timeStr === 'end') {
      return this.duration * 1000;
    }

    var num = parseInt(timeStr);

    if (timeStr.indexOf('%') !== -1) {
      return Math.round(this.duration * num * 10);
    }

    return num * 1000;
  },

  /*
   * Starts video play.
   */
  play: function () {
    if (this.player) {
      this.player.playVideo();
    } else {
      this.initCallbacks.push(this.play.bind(this));
    }
  },

  /*
   * Go to prev slide relative to current slide index.
   */
  prevSlide: function () {
    this.goToSlide(this.slideIndex - 1);
  },

  /*
   * Sets video events with current elapsed time offset.
   */
  setEvents: function () {
    var timeDiff = this.player.getCurrentTime() * 1000;

    this.currentTimeouts = this.events.map(function (eventObj) {
      var delay = eventObj.time - timeDiff;
      if (delay >= 0) {
        return setTimeout(eventObj.callback, delay);
      }
    });
  },

  /*
   * Shows YouTube player.
   */
  show: function () {
    var iframe = this.player.getIframe();

    if (iframe.style.removeProperty) {
      iframe.style.removeProperty('display');
    } else {
      iframe.style.removeAttribute('display');
    }
  },

  /*
   * Stops video play and cancels remaining load.
   */
  stop: function () {
    this.player.stopVideo();
  }
};
