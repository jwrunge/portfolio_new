<template>

    <div>

        <a v-if="entry.url !== 'not available'" :href='entry.url' target="_blank"><img class='banner shadowed' :alt='entry.alt' :src='entry.src'/></a>
        <img v-else class='banner shadowed nolink' :alt='entry.alt' :src='entry.src'/>
        <strong>Description: </strong>
        <p v-html="entry.description"></p>
        <p v-html="entry.extended"></p>
        <p v-if='entry.features'>
            <strong>Features: </strong><br/>
            <ul>
                <li v-for="(feature, index) in entry.features" :key='index' v-html='feature'></li>
            </ul>
        </p>
        <p v-if='entry.tech'>
            <strong>Tech Details: </strong><br/>
            <ul>
                <li v-for="(feature, index) in entry.tech" :key='index'  v-html='feature'></li>
            </ul>
        </p>
        <div v-if='entry.images'>
            <strong>Images: </strong><br/>
            <p>Click to enlarge</p>
            <img v-for='(image, index) in entry.images' :key='index' :src="image.src" :alt='image.alt' class='img_entry shadowed enlargeable'/>
        </div>
        <div v-if='entry.originals'>
            <strong>References: </strong><br/>
            <p>Click to enlarge</p>
            <img v-for='(image, index) in entry.originals' :key='index' :src='image.src' :alt='image.alt' class='img_entry shadowed enlargeable'/>
        </div>

    </div>

</template>

<script>

    export default {
        name: 'EntryDetails',
        props: [ 'entry' ],
        mounted() {
            this.$emit('addEnlargeListeners')
        }
    }

</script>

<style scoped>

    img.banner { width: 100%; margin-bottom: 1em; }
    img.nolink { cursor: not-allowed }
    img.img_entry { margin-top: .5em; margin-bottom: .5em; }

</style>
