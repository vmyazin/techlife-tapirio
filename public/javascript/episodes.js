(async function () {
  class Episodes {
    constructor () {
      this.everPlayer = new EverPlayer();
      // this.searchEl.toggleAttribute('active')
      // this.searchEl.addEventListener('focus', this.activate.bind(this))
      // this.episodeEl.addEventListener('click', this.showDetails.bind(this))
    }

    async init() {
      Array.from(this.episodeEl).forEach((element) => {
        element.addEventListener('click', async () => {
          await this.showDetails.bind(this, element)(true);
        })
      });

      // Показать самый свежий эпизод
      this.showDetails(this.episodeEl[0], false);
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

    async showDetails (el, scrollView) {
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

      const episode = await this.getEpisode(id);

      if (!li.classList.contains('selected')) {
        box.appendChild(this.constructElement(episode));
        li.classList.add('selected');

        if (scrollView) {
          li.scrollIntoView({ behavior: "smooth" })
        }
      } else {
        li.classList.remove('selected');
      }

      const player = new Player(li, episode, this.everPlayer);
    }
    
    constructElement(episode) {
      const fragment = document.createElement('div'),
            href = '/episodes/' + episode.episodeNum,
            template = `<h3><span class="episode-num">№${episode.episodeNum}</span><a href="${href}">${episode.title}</a> <span class="small-caps date">${episode.pubDateConverted}</span></h3>
                        <h4>${episode['itunes:subtitle']}</h4>
                        <section class="episode-desc">${episode.description}</section>
                        <div class="player">
                          <div class="btn-play">Play</div>
                        </div>
                        <progress id="seekbar" value="0" max="1" style="width:400px;"></progress>`;
      fragment.innerHTML = template;
      return fragment;
    }
  }

  document.addEventListener('DOMContentLoaded', async () => await init())

  async function init() {
    const ep = new Episodes();
    await ep.init();    
  }

})()