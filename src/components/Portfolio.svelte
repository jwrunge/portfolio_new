<script>
    import {onMount} from "svelte"

    let entries = []
    export let portModalOpen = false
    export let portModalEntry = {}
    let portfolio, portfolioGrid

    //Get portfolio entries
	function getPortfolioEntries() {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'portfolio_entries.json', true);
		xhr.responseType = 'json';
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4 && xhr.status === 200) {
				entries = xhr.response
			}
		}
		xhr.send()
	}
      
    function openPortModal(entry) {
        portModalEntry = entry
        portModalOpen = true
        console.log(portModalOpen)
    }

    onMount(()=> {
        let wrapper = document.querySelector("main")
        let portfolioListener = ()=> {
            if(portfolioGrid.getBoundingClientRect().top - window.innerHeight/2 <= 0) {
                portfolio.classList.add('shown')
                setTimeout(()=>{ portfolio.classList.add('nodelay') }, 1000)
                wrapper.removeEventListener('scroll', portfolioListener)
            }
        }

        getPortfolioEntries()
        wrapper.addEventListener('scroll', portfolioListener)
    })
</script>

<section id='portfolio' bind:this={portfolio}>
    <div id='portfolio-grid' bind:this={portfolioGrid}>
        {#each entries as entry}
            <div on:click={openPortModal(entry)} class='port-entry' style="background-image: url('{entry.src}')">
                <div class='title'>{ entry.title }</div>
            </div>
        {/each}
    </div>
</section>

<style lang='scss'>
    @import "../variables.scss";

    #portfolio {
        margin: 3em auto 0 auto;
        padding-bottom: 5em;
        width: 90%;
		max-width: 60em;
    }

    .port-entry {
        color: white;
        position: relative;
        width: 100%;
        background-repeat: no-repeat;
        background-position: top left;
        background-size: cover;
        border-width: 1px;
        border-style: solid;
        border-color: $darkblue;

        .title {
            position: absolute;
            z-index: 1;
            bottom: 0;
            width: 100%;
            text-align: center;
            background-color: rgba(0,0,0,.7);
            padding: 1em 0;

            -moz-user-select: none;
            -khtml-user-select: none;
            -webkit-user-select: none;
            -ms-user-select: none;
            user-select: none;
        }

        @media screen and (max-width: 499px) {
            height: 15em;
        }

        // Animatable
        transition: filter .25s ease, transform .25s ease-out, opacity .25s ease, box-shadow .25s ease;
	}

    // Animatable
    #portfolio:not(.shown) .port-entry {
        filter: brightness(0);
        transform: translateZ(-.25px);
        opacity: 0;
    }

	#portfolio.shown .port-entry {
        filter: brightness(1);
        transform: translateZ(0px);
        opacity: 1;
    }

    #portfolio .port-entry {
        transition: filter .25s ease, transform .25s ease-out, opacity .25s .1s ease, box-shadow .25s ease;

        &:hover {
            cursor: pointer;
            transform: translateZ(.1px);
            z-index: 1;
        }
    }

    @media screen and (min-width: 999px) {
        #portfolio:not(.nodelay) {
            .port-entry:nth-child(2) { transition: filter .25s ease, transform .25s .1s ease-out, opacity .25s .1s ease, box-shadow .25s ease; }
            .port-entry:nth-child(3) { transition: filter .25s ease, transform .25s .2s ease-out, opacity .25s .2s ease, box-shadow .25s ease; }
            .port-entry:nth-child(4) { transition: filter .25s ease, transform .25s .3s ease-out, opacity .25s .3s ease, box-shadow .25s ease; }
            .port-entry:nth-child(5) { transition: filter .25s ease, transform .25s .4s ease-out, opacity .25s .4s ease, box-shadow .25s ease; }
            .port-entry:nth-child(6) { transition: filter .25s ease, transform .25s .5s ease-out, opacity .25s .5s ease, box-shadow .25s ease; }
            .port-entry:nth-child(7) { transition: filter .25s ease, transform .25s .6s ease-out, opacity .25s .6s ease, box-shadow .25s ease; }
            .port-entry:nth-child(8) { transition: filter .25s ease, transform .25s .7s ease-out, opacity .25s .7s ease, box-shadow .25s ease; }
            .port-entry:nth-child(9) { transition: filter .25s ease, transform .25s .8s ease-out, opacity .25s .8s ease, box-shadow .25s ease; }
        }
    }

	#portfolio-grid {
		display: grid;
        width: 100%;
		grid-template-columns: 1fr;
		grid-template-rows: 1fr;
		justify-items: stretch;
		align-items: stretch;
		justify-content: center;
		align-content: center;
		grid-gap: 1em;
		perspective: 100px;
		perspective-origin: 50 50%;
		transform-style: preserve-3d;
	}

	@media screen and (min-width: 500px) {
		#portfolio-grid {
			grid-template-columns: repeat(4, 1fr);
			grid-template-rows: repeat(3, 1fr);
            height: 30em;
		}

		.port-entry:first-of-type {
			grid-column: span 2;
			grid-row: span 2;
		}
	}

</style>
