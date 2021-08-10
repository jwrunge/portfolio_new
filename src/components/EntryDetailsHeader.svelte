<template>

    <div>
        <h3>{{ entry.title }}</h3>
        <p class='status'>
            <span v-if="entry.created"><strong>Created: </strong>{{ entry.created }}<br/></span>
            <span v-if="entry.url === 'not available'">{{ entry.status }}</span>
            <a class='status' v-else :href="entry.url" target="_blank">{{ entry.status }}</a>
            <span v-if='entry.notes'> - {{ entry.notes }}</span>
        </p>
        
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

<style>

    .status { margin-bottom: 1em; }

</style>