var myPlayer = new SlidePlayer({
  width: '480',
  height: '270',
  containerId: 'player',
  videoId: 'M7lc1UVf-VE'
}, {
  containerId: 'slides',
  slides: [
      '<div>First slide here</div>',
      '<div>Second slide here</div>'
  ]
});

myPlayer.at('6', function () { this.nextSlide(); })
        .at('12', function () { this.nextSlide(); })
        .at('15', function () { this.prevSlide(); })
        .at('end', function () { console.log('video has ended'); })
        .play();