<script lang=ts>
    import {onMount} from "svelte";

    type PortfolioEntry = { 
        title: string, 
        code: string,
        src: string,
        focus: string,
    };

    let entries: PortfolioEntry[] = [];
    export let portModalOpen = false;
    export let portModalEntry = {};
    let portfolio: HTMLElement, portfolioGrid: HTMLElement;

    //Get portfolio entries
	function getPortfolioEntries() {
		let xhr = new XMLHttpRequest();
		xhr.open('GET', 'portfolio_entries.json', true);
		xhr.responseType = 'json';
		xhr.onreadystatechange = function() {
			if(xhr.readyState === 4 && xhr.status === 200) {
				entries = xhr.response;
			}
		}
		xhr.send()
	}
      
    function openPortModal(entry: PortfolioEntry) {
        portModalEntry = entry;
        portModalOpen = true;
    }

    onMount(()=> {
        let wrapper = document.querySelector("main");
        let portfolioListener = ()=> {
            if(portfolioGrid.getBoundingClientRect().top - window.innerHeight/2 <= 0) {
                portfolio.classList.add('shown');
                setTimeout(()=>{ portfolio.classList.add('nodelay') }, 1000);
                wrapper?.removeEventListener('scroll', portfolioListener);
            }
        }

        getPortfolioEntries();
        wrapper?.addEventListener('scroll', portfolioListener);
    })
</script>

<section id='portfolio' bind:this={portfolio}>
    <div id='portfolio-grid' bind:this={portfolioGrid}>
        {#each entries as entry}
            <div 
                role="button" tabindex="0"
                class='port-entry' class:centerbg={entry.focus == "middle"} 
                style="background-image: url('{entry.src}')"
                on:click={()=> openPortModal(entry)}
                on:keydown={e => {if(e.key === "Enter") openPortModal(entry)}}
            >
                <div class='title'>{ entry.title }</div>
                {#if entry.code}
                    <div class="code-available">Code</div>
                {/if}
            </div>
        {/each}
    </div>
    <p style="text-align: center;">Code for this portfolio wesbite is available <a href="https://github.com/jwrunge/portfolio_new" target="_blank">here</a>.</p>
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

        &.centerbg {
            background-position: top center;
        }

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

    .code-available {
        font-size: .75em;
        background-color: $yellow;
        color: $darkblue;
        padding: .25em;
        border-bottom-left-radius: 2px;
        position: absolute;
        top: 0; right: 0;
        box-shadow: 0 0 5px black;
    }

</style>
