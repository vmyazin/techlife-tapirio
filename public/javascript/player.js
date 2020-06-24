class Player {
  constructor (element, source, everPlayer) {
    this.everPlayer = everPlayer;
    this.source = source;
    console.log(element);
    //this.audioPlayerEl = element.querySelector('#player')
    this.controls = {
      play: element.querySelector('.btn-play'),
    }
    this.started = false;
    this.controls.play.addEventListener('click', () => {
      if (!this.started) {
        everPlayer.source = source;
      }
      if (this.isPlaying) {
        this.everPlayer.pause()
      } else {
        this.everPlayer.play()
      }
      this.isPlaying = !this.isPlaying;
      this.controls.play.setAttribute('data-is-playing', this.isPlaying);
      this.started = true;
    });
  }  
}

class EverPlayer {
  constructor () {
    // console.log(element);
    this.container = document.querySelector('.player-wrapper')
    this.player = this.container.querySelector('#player')
    this.player.addEventListener('timeupdate', () => this.updateBar());
    
    this.controls = {
      play: this.container.querySelector('.btn-play'),
      bar: this.container.querySelector('.progress-bard'),
      soFar: this.container.querySelector('.so-far'),
      title: this.container.querySelector('title')
    }

    this.controls.bar.addEventListener('click', (e) => {
      // from E find %
      // const p = e.clientX-this.offsetLeft
      const percentagePlayed = e.offsetX / this.controls.bar.offsetWidth * 100
      console.log(percentagePlayed + "%");
      this.player.currentTime = percentagePlayed;
    });

    this.controls.play.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    });
  }  
  set source(s) {
    this.player.setAttribute('src', s);
  }
  play() {
    this.player.play();
    this.isPlaying = true;
    this.controls.play.setAttribute('data-is-playing', true);
  }
  pause() {
    this.player.pause();
    this.isPlaying = false;
    this.controls.play.setAttribute('data-is-playing', false);
  }
  updateBar() {
    const progress = this.player.currentTime / this.player.duration * 100;
    console.log("progress", progress);
    this.controls.soFar.style.width = progress + '%';
  }
}
