<script lang=ts>
	import {onMount} from "svelte";
	import "./global.scss";
	
	import Splash from './components/Splash.svelte';
	import About from './components/About.svelte';
	import Portfolio from './components/Portfolio.svelte';
	import ConcaveArrowDown from './components/ConcaveArrowDown.svelte';
	import ConvexArrowDown from './components/ConvexArrowDown.svelte';
	//@ts-ignore
	import Modal from "@jwrunge/modal/src/Modal.svelte";
    import MainScene from "./3d/core/MainScene.svelte";

    let contactModalOpen = false
	let isThin = window.outerWidth < 700
	let mainEl: HTMLElement
	let winScrollY: number
	let video: HTMLVideoElement
	let portModalOpen = false
	let portModalEntry: {
		title?: string,
		src?: string,
		alt?: string,
		link?: string,
		code?: string,
		description?: string
	} = {}

	onMount(()=> {
		if(video) video.play()

		mainEl.addEventListener("scroll", ()=> {
			winScrollY = mainEl.scrollTop
		})

		window.addEventListener("hashchange", ()=> {
			setTimeout(()=>{
				window.location.hash = ""
			}, 250)
		})
	})
</script>

<!-- Main sections -->
<main bind:this={mainEl}>
	<!-- Background -->
	{#if isThin}
		<div id='bgimg' style="transform: translate(0, {winScrollY/1.5}px)"></div>
	{:else}
		<video id='bg' style="transform: translate(0, {winScrollY/1.5}px)" bind:this={video} muted>
			<source src='assets/video/Coffee_orig.mp4' type='video/mp4'/>
		</video>
	{/if}

	<div class="follower">
		<MainScene/>
	</div>

	<!-- Splash screen -->
	<Splash></Splash>
	<ConcaveArrowDown isGray={true}></ConcaveArrowDown>

	<!-- Projects -->
	<div class='content'>
		<h1 id='abouthash'>Selected Projects</h1>
		<Portfolio bind:portModalEntry bind:portModalOpen></Portfolio>
	</div>

	<!-- About me -->
	<div class='darker-content'>
		<ConvexArrowDown isGray={true}></ConvexArrowDown>
		<h1>Let's build something awesome!</h1>
		<About></About>
		<ConcaveArrowDown></ConcaveArrowDown>
	</div>

	<!-- Footer -->
	<div id='footer'>
		<h1 class='gradient-back'>Get in touch!</h1>
		<div id='getintouch'>
		<p>Like what you see? Let's talk!</p>
		<a class='box white' href="getintouch" on:click|preventDefault={()=> {contactModalOpen = true}}>Get in touch</a>
		<p>Additional projects, code, and references available on request.</p>
		</div>
	</div>
</main>

<!-- Contact modal -->
{#if contactModalOpen}
	<Modal bgclose={true} on:close={()=> {contactModalOpen = false}}>
		<h2>Want to get in touch?</h2>
		<p>Feel free to email me at <a href='mailto:jwrunge@gmail.com'>jwrunge@gmail.com</a>. I'm happy to answer any questions you may have about my work, to discuss a project, or just talk about web development.</p>
		<p>Additional projects, code, and references available on request.</p>
		<div id='social-list'>
			<a href='https://github.com/jwrunge' target='_blank'><img src='assets/github.svg' alt="My GitHub" class='contact_logo'/></a>
			<a href='https://www.npmjs.com/~jwrunge' target='_blank'><img src='assets/tool-symbols/npm.png' alt="My NPM" class='contact_logo'/></a>
			<a href='https://codepen.io/jwrunge' target='_blank'><img src='assets/codepen.png' alt="My CodePen" class='contact_logo'/></a>
			<a href='https://jsfiddle.net/user/jwrunge/fiddles/' target='_blank'><img src='assets/jsfiddle.png' alt="My JSFiddle" class='contact_logo'/></a>
		</div>
	</Modal>
{/if}

<!-- Portfolio modal -->
{#if portModalOpen}
    <Modal wide={true} bgclose={true} on:close={()=> {portModalOpen = false}}>
        <div class="port-modal-entry">
			<h3>{portModalEntry.title}</h3>
			<img src={portModalEntry.src} alt={portModalEntry.alt}>
			<div>
				{#if portModalEntry.link}<strong>Link: </strong>{@html portModalEntry.link}<br>{/if}
				{#if portModalEntry.code}<strong>Code on </strong><a href={portModalEntry.code} target="_blank">GitHub</a><br>{/if}
			</div>
			{#if portModalEntry.description}
				{@html portModalEntry.description}
			{/if}
		</div>
    </Modal>
{/if}

<style lang='scss'>
	@import "./variables.scss";

	main {
		position: absolute;
		top: 0; left: 0;
		width: 100%; height: 100vh;
		background-color: #000;
		overflow-x: hidden;
		overflow-y: auto;
		perspective: 2px;
		scroll-behavior: smooth;
	}

	// Background
	#bg, #bgimg
	{
		position: absolute;
		top: 0; left: 0;
		z-index: -1;
		width: 100%;
		height: 105vh;
	}

	#bg { object-fit: cover; }

	#bgimg
	{
		background-image: url('../assets/novideo_bg.jpg');
		background-size: cover;
		background-position: top left;
	}

	/*
		contact
	*/
	.contact_logo {
		width: 3em;
		margin: 1em 1em 1em 0;
	}

	#social-list {
		display: flex;
		justify-content: center;
		align-items: center;

		img { width: 3em; }

		@media screen and (max-width: 500px) {
			img { width: 2em; }
		}
	}

	#footer {
		background-color: $darkblue;
		text-align: center;
		padding-bottom: 5em;

		p {
		color: white;
		max-width: 40em;
		margin: 0 auto;
		text-align: center;
		}

		a {
		margin: 2em auto;
		}
	}

	#getintouch { margin-top: 3em; }

	.port-modal-entry img {
		max-width: 100%;
		max-height: 50vh;
		margin-bottom: .5em;

		@media screen and (min-width: 1000px) {
			max-width: 40%;
			float: right;
			margin-left: 1em;
		}
	}

	.follower {
		position: fixed;
		top: 0; left: 0;
		width: 100%; height: 100%;
	}
</style>
