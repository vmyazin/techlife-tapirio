(async function () {
    class Effects {
      constructor () {
        this.heroId = "hero-image";
        this.parallaxClass = "parallax";
      }
  
      async init() {
        if (document.getElementById(this.heroId).classList.contains(this.parallaxClass)) {
          await this.setHeroParallax();
        } 
      }

      parallaxAction() {
        let scrolledHeight= window.pageYOffset;
        let hero = document.getElementById(this.heroId);
        console.log(this.parallaxClass)
      
        const limit = hero.offsetTop + hero.offsetHeight * 2;
        if( scrolledHeight > hero.offsetTop ) {
          hero.style.transform = "translateY(" + ( scrolledHeight - hero.offsetTop ) / 2 + "px)";
        } else if (scrolledHeight <= hero.offsetTop) {
          hero.style.transform = "translateY(0)";
        }
      }
    
      async setHeroParallax() {
        let self = this;
        let timeout;

        window.addEventListener( "scroll", function(event) {
          console.log( 'no debounce' );
          // If there's a timer, cancel
          if (timeout) {
            window.cancelAnimationFrame(timeout);
          }
          // Setup the new requestAnimationFrame()
          timeout = window.requestAnimationFrame(function () {
            // Run our scroll functions
            self.parallaxAction();
          });
        }, false);
      }


    }
  
    document.addEventListener('DOMContentLoaded', async () => await init())
  
    async function init() {
      const ux = new Effects();
      await ux.init();    
    }
  
  })()

