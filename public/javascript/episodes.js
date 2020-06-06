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
      const box = li.getElementsByClassName("selected-box")[0]

      if (this.currentEp) {
        const oldEl = document.querySelector(`[data-episode-num='${this.currentEp}']`)
        const oldBox = oldEl.getElementsByClassName("selected-box")[0]
        oldBox.innerHTML = ''
        oldEl.classList.remove('selected');
      }

      this.currentEp = id;
      if (!li.classList.contains('selected')) {
        const episode = await this.getEpisode(id);
        box.appendChild(this.constructElement(episode));
        li.classList.add('selected');  
      } else {
        li.classList.remove('selected');
      }
    }

    constructElement(episode) {
      console.log(episode);
      const fragment = document.createDocumentFragment(),
            tagTitle = document.createElement("h3"),
            title = document.createTextNode(episode.title),
            tagCaption = document.createElement("h4"),
            caption = document.createTextNode(episode['itunes:subtitle']),
            tagLink = document.createElement("a")
            tagLink.href = '/episodes/' + episode.episodeNum

      tagLink.appendChild(title)
      tagCaption.appendChild(caption)
      fragment.appendChild(tagTitle).appendChild(tagLink)
      fragment.appendChild(tagCaption)
      return fragment;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => await init())

  async function init() {
    const ep = new Episodes();
    await ep.init();
    
  }

})()