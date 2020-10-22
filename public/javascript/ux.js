(async function () {
    class Ux {
      constructor () {
      }
  
      async init() {
        await this.setPageParallax();
      }

      addParallax( selector, context ) {
        context = context || document;
        let elements = context.querySelectorAll( selector );
        return Array.prototype.slice.call( elements );
      }
    
      async setPageParallax() {
        let self = this;
        window.addEventListener( "scroll", function() {
          let scrolledHeight= window.pageYOffset;
          // Ideally add a classname to body or any other element
          // to launch parallax. Using tag name for now
          self.addParallax( "body" ).forEach( function( el, index, array ) {
            const limit = el.offsetTop + el.offsetHeight;
            if( scrolledHeight > el.offsetTop && scrolledHeight <= limit ) {
              el.style.backgroundPositionY = ( scrolledHeight - el.offsetTop ) / 2 + "px";
            } else {
              el.style.backgroundPositionY = "0";
            }
          });
        });
      }
    }
  
    document.addEventListener('DOMContentLoaded', async () => await init())
  
    async function init() {
      const ux = new Ux();
      await ux.init();    
    }
  
  })()

