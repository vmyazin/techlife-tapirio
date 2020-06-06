(async function () {
  class Episodes {
    constructor () {
      // this.searchEl.toggleAttribute('active')
      // this.searchEl.addEventListener('focus', this.activate.bind(this))
      // this.episodeEl.addEventListener('click', this.showDetails.bind(this))
      // this.clearSearchEl.style.display = 'none'


    }

    async init() {
      Array.from(this.episodeEl).forEach((element) => {
        element.addEventListener('click', async () => {
          await this.showDetails.bind(this, element)();
        })
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

    async showDetails (el) {
      const li = el.parentNode.parentNode;
      const id = li.getAttribute('data-episode-num');
      if (this.currentEp) {
        const oldEl = document.querySelector(`[data-episode-num='${this.currentEp}']`)
        oldEl.classList.remove('selected');
      }
      this.currentEp = id;
      if (!li.classList.contains('content-added')) {
        const episode = await this.getEpisode(id);
        li.appendChild(this.constructElement(episode));
        li.classList.add('content-added');  
      }
      li.classList.add('selected')
    }

    constructElement(episode) {
      const tag = document.createElement("div");
      const text = document.createTextNode(episode.title);
      tag.appendChild(text);
      return tag;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => await init())

  async function init() {
    const ep = new Episodes();
    await ep.init();
    
  }

})()