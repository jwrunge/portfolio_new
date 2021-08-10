<script>
	import { onMount } from "svelte"

	let about

	onMount(()=>{
		let wrapper = document.querySelector("main")
		let aboutListener = ()=> {
			if(about.getBoundingClientRect().top - window.innerHeight/2 <= 0) {
				about.classList.add('shown')
			}

			window.removeEventListener("scroll", aboutListener)
		}

		wrapper.addEventListener('scroll', aboutListener)
	})
</script>

<section id='aboutpage'>  
	<div id='about' bind:this={about}>
		<div class='quick-bio'>
			<div id='me'>
				<h2>Who am I?</h2>
			</div>
			<p>I'm a freelance and hobbyist web developer, and I think interacting with websites and apps should be <em>fun</em>.</p>
			<p>I love <strong>designing satisfying user experiences</strong>&mdash;from animations and effects to back-end logic and data delivery. The absolute coolest thing about development is creating flexible systems that hide complex sequences behind simple interfaces. Pushing a button and watching something just <em>work</em> is so satisfying!</p>
			<p>
				<strong>Currently learning: </strong>Advanced <a href="https://www.tiny.cloud/" target="_blank">TinyMCE</a> topics, Calculus<br/>
				<strong>Current projects: </strong>The <a href="https://hammockcms.com" target="_blank">Hammock CMS</a> alpha
			</p>
		</div>

		<div class='skills'>
			<h2>Front-end</h2>
			<ul>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/html5.png' alt="HTML5"/>HTML5</li>
					<li><img src='../assets/tool-symbols/css3.svg' alt="CSS3"/>CSS3</li>
					<li><img src='../assets/tool-symbols/sass.png' alt="Sass"/>SASS</li>
				</span>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/js.png' alt="JavaScript"/>JavaScript</li>
					<li><img src='../assets/tool-symbols/svelte.png' alt="Svelte"/>Svelte</li>
					<li><img src='../assets/tool-symbols/vue.png' alt="Vue"/>Vue.js</li>
				</span>
			</ul>
			<h2>Back-end and Systems</h2>
			<ul>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/php.png' alt="PHP"/>PHP</li>
					<li><img src='../assets/tool-symbols/golang.png' alt="Go"/>Go</li>
					<li><img src='../assets/tool-symbols/node.svg'  alt="Node"/>Node.js</li>
				</span>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/sql.png' alt="SQL"/>SQL</li>
					<li><img src='../assets/tool-symbols/linux.png' alt="Linux"/>Linux</li>
					<li><img src='../assets/tool-symbols/nginx.png' alt="Nginx"/>Nginx</li>
				</span>
			</ul>
			<h2>Tools</h2>
			<ul>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/github.png' alt="GitHub"/>GitHub</li>
					<li><img src='../assets/tool-symbols/npm.png' alt="NPM"/>NPM</li>
				</span>
				<span class='unbreakable'>
					<li><img src='../assets/tool-symbols/webpack.png' alt="Webpack"/>Webpack</li>
					<li><img src='../assets/tool-symbols/rollup.png' alt="Rollup"/>Rollup</li>
				</span>
			</ul>
		</div>
	</div>
</section>

<style lang='scss'>
	@import "../variables.scss";

    #about {
		width: 90%;
		max-width: 60em;
		display: grid;
		margin: 3em auto 0 auto;
		grid-template-columns: 1fr;
		padding: 0 5% 3em 5%;
		align-items: flex-start;
		justify-items: stretch;
		grid-gap: 8vw;
		position: relative;

		@media screen and (min-width: 1500px) {
			grid-gap: 3em;
			grid-template-columns: 1fr 1fr;
		}
	}

	.quick-bio {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		flex-wrap: wrap;
		max-width: 100%;

		transition: opacity .5s ease, transform .5s ease-out;

		p {
			text-align: center;
			width: 90%;
			max-width: 40em;
			margin-top: 0;

			strong { color: $darkblue; }
		}
	}

	#me {
		background-image: url('../assets/mnj.jpg');
		width: 100%;
		height: 70vh;
		position: relative;
		background-size: cover;
		background-position: 50% 25%;
		margin-bottom: 1em;

		h2 {
			color: white;
			position: absolute;
			text-align: center;
			bottom: 0;
			margin: 0;
			width: 100%;
			font-size: 3em;
			text-shadow: 0 0 10px rgba(0,0,0,.5);
		}
	}

	.skills {
		max-width: 100%;
		font-size: .75em;
		border-style: solid;
		border-width: 2px;
		border-color: $darkblue;
		padding: 0;
		position: sticky;
		top: 2em;

		transition: opacity .5s ease, transform .5s ease-out;
		transition-delay: .25s;
		background-color: #EEEEEE;
	
		h2 {
			margin-top: 0;
			padding: .5em 0;
			font-size: 1.5em;
			color: white;
			background-color: $darkblue;
			box-shadow: 0 0 0 2px $darkblue;

			@media screen and (max-width: 1499px) {
				text-align: center;
				margin: 0 auto;
			}
			
			@media screen and (min-width: 1500px) {
				padding-left: 1em;
			}
		}

		ul {
			list-style-type: none;
			padding-left: .5em;
			margin-bottom: 0;
		}

		li {
			min-width: 4em;
			display: inline-flex;
			flex-direction: column;
			flex-wrap: wrap;
			text-align: center;
			justify-items: center;
			transition: transform .25s ease-in-out;
			margin: 0 .5em 1em .5em;
		}

		img {
			display: block;
			margin: 0 auto .25em auto;
			max-width: 3em;
			max-height: 4em;
		}
	}

	@media screen and (min-width: 1000px) {
		#about:not(.shown) .skills {
			opacity: 0;
			transform: translateX(5em);
		}

		#about:not(.shown) .quick-bio {
			opacity: 0;
			transform: translateX(-5em);
		}
	}

	@media screen and (max-width: 999px) {
		#about:not(.shown) .skills {
			opacity: 0;
		}

		#about:not(.shown) .quick-bio {
			opacity: 0;
		}
	}

	#about.shown > * {
		opacity: 1;
		transform: translateX(0);
	}

	@media screen and (max-width: 1499px) {
		.skills ul {
			text-align: center;
			max-width: 50em;
			width: 90%;
			margin: 1em auto;
			padding: 0;
		}

		.unbreakable {
			white-space: nowrap;
		}
	}

</style>
