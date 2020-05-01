(function () {
  class Search {
    constructor () {
      this.searchEl.toggleAttribute('active')
      // add listeners for the search input to toggle active/inactive states
      this.searchEl.addEventListener('focus', this.activate.bind(this))
      this.searchEl.addEventListener('blur', this.deactivate.bind(this))
      this.searchEl.addEventListener('keydown', debounce(this.renderResults.bind(this)), 500)
      this.clearSearchEl.addEventListener('click', this.clearSearchInput.bind(this))
      this.clearSearchEl.style.display = 'none'
    }

    get searchEl () {
      if (!this.searchEl_) {
        this.searchEl_ = document.getElementById('search')
      }
      return this.searchEl_
    }

    get resultsEl () {
      if (!this.resultsEl_) {
        this.resultsEl_ = document.getElementsByClassName("search-results")[0]
      }
      return this.resultsEl_
    }

    get bodyEl () {
      if (!this.bodyEl_) {
        this.bodyEl_ = document.querySelector('body')
      }
      return this.bodyEl_
    }

    get clearSearchEl () {
      if (!this.clearSearchEl_) {
        this.clearSearchEl_ = document.getElementsByClassName("clear-search-input")[0]
      }
      return this.clearSearchEl_
    }

    async renderResults (event) {
      const value = event.target.value
      this.resultsEl.innerHTML = ''
      this.posts = await this.getPosts({ name: value })

      this.clearSearchEl.style.display = 'block'

      // in case of no search results
      this.resultsEl.style.display = this.hasResults ? 'none' : 'block'

      this.posts.forEach((c) => {
        this.resultsEl.style.display = 'block'
        this.resultsEl.appendChild(this.createSearchResultEl(c))
      })
    }

    clearSearchInput () {
      this.searchEl.value = ''
      this.resultsEl.style.display = 'none'
      this.clearSearchEl.style.display = 'none'
    }

    get hasResults () {
      return this.posts ? this.posts.length !== 0 : false
    }

    activate () {
      this.bodyEl.classList.add('dimmed')
      this.searchEl.classList.add('focus')
    }

    deactivate () {
      this.bodyEl.classList.remove('dimmed')
      if (!this.hasResults) {
        this.searchEl.classList.remove('focus')
      } // if no search results, remove .focus from input
    }

    async getPosts (query) {
      const params = new URLSearchParams('')
      for (const key in query) { params.append(key, query[key]) }
      return await fetch('/api/search?' + params.toString())
        .then(async (response) => {
          return await response.json()
        })
        .then(async (json) => {
          return await json
        })
    }

    createSearchResultEl (post) {
      const el = document.createElement('li')
      const a = document.createElement('a')
      const textEl = document.createTextNode(post.title)
      a.appendChild(textEl)
      a.title = post.title + ', ' + post.description
      a.href = ('/blog/' + post.slug).toLowerCase()
      el.appendChild(a)
      return el
    }
  }

  document.addEventListener('DOMContentLoaded', init)
  function init() {
    //
    new Search()
  }
  function debounce(fn, time) {
    let timeout;
  
    return function () {
      const functionCall = () => fn.apply(this, arguments)
  
      clearTimeout(timeout)
      timeout = setTimeout(functionCall, time)
    }
  }
})()