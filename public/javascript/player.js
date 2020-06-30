class Player {
  constructor (element, episode, everPlayer) {
    this.everPlayer = everPlayer;
    this.source = episode.enclosure.$.url;
    //this.audioPlayerEl = element.querySelector('#player')
    this.controls = {
      play: element.querySelector('.btn-play'),
    }
    this.started = false;
    this.controls.play.addEventListener('click', () => {
      if (!this.started) {
        everPlayer.source = episode.enclosure.$.url;
        everPlayer.title = episode.episodeNum + ': ' + episode.title;
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
    this.player.addEventListener('timeupdate', () => this.updateBar())
    this.audioLoaded = false
    
    this.controls = {
      play: this.container.querySelector('.btn-play'),
      bar: this.container.querySelector('.progress-bard'),
      soFar: this.container.querySelector('.so-far'),
      title: this.container.querySelector('.title')
    }
    
    this.player.addEventListener('canplay', () => {
      this.audioLoaded = true
      this.container.classList.add("active")
      this.controls.title.innerHTML = this.title
    })

    this.controls.play.addEventListener('click', () => {
      if (this.isPlaying) {
        this.pause()
      } else {
        this.play()
      }
    })

    this.player.addEventListener('ended', (event) => {
      this.pause()
    })

    // настроить функционал выбора позиции времени на прогресс-баре
    this.controls.bar.addEventListener('click', (e) => {
      const percentagePlayed = e.offsetX / this.controls.bar.offsetWidth * 100
      if (this.audioLoaded) {
        this.player.currentTime = this.player.duration / 100 * percentagePlayed;
      }
    })
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
    this.controls.soFar.style.width = progress + '%';
  }
}
