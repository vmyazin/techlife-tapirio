(function () {
  class Episodes {
    constructor () {
      // this.searchEl.toggleAttribute('active')
      // this.searchEl.addEventListener('focus', this.activate.bind(this))
      // this.episodeEl.addEventListener('click', this.showDetails.bind(this))
      // this.clearSearchEl.style.display = 'none'

      const episodeEls = this;

      Array.from(episodeEls.episodeEl).forEach(function(element) {
        element.addEventListener('click', episodeEls.showDetails.bind(element))
      });
    }

    get episodeEl () {
      if (!this.episodeEl_) {
        this.episodeEl_ = document.getElementsByClassName("show-episode")
      }
      return this.episodeEl_
    }

    async getEpisode (id) {
      return await fetch('/api/episode/' + id)
        .then(async (response) => {
          return await response.json()
        })
        .then(async (json) => {
          return await json
        })
    }

    showDetails () {
      // let epi = this.getEpisode(1)
      console.log('details', this);
    }
  }

  document.addEventListener('DOMContentLoaded', init)

  function init() {
    new Episodes()
  }

})()