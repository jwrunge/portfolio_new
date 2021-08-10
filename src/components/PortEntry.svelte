<template>
    <div class='entry' @click="$emit('selected')">
        <div class='wip' v-if="entry.created === 'In progress'"><span>Coming soon!</span></div>
        <div class='wip' v-if="entry.type === 'library'"><span>Code Library</span></div>
        <img :src='entry.src' :alt='entry.alt'/>
        <div class='title'>{{ entry.title }}</div>
    </div>
</template>

<script>

export default {
  name: 'PortEntry',
  props: [ 'entry' ]
}

</script>

<style lang='scss' scoped>
    .entry {
        position: relative;
        margin-bottom: 2em;
        background-color: #03587c;
        display: inline-block;
        border-top-right-radius: 2px;
        border-top-left-radius: 2px;
        box-shadow: 0 2px 4px #00000088;
        transition: background-color .2s;

        img { min-width: 100%; transition: filter .2s; }

        .title {
            width: 90%;
            color: white;
            text-align: center;
            padding: 5%;
            border-bottom-right-radius: 2px;
            border-bottom-left-radius: 2px;
        }

        .wip {
            border-radius: 50%;
            background-color: #ff8133;
            box-shadow: 0 2px 4px #00000088;
            color: white;
            position: absolute;
            padding: .5em;
            top: -.7em;
            right: -.7em;
            width: 4em;
            height: 4em;
            display: flex;
            justify-content: center;
            text-align: center;
            align-items: center;
            z-index: 1;
            font-size: .7em;
        }
    }
</style>
