<template>
  <div id="wrapper">
    <el-row :gutter="20">
      <el-col
        v-for="device of devices"
        :key="device"
        :span="6"
      >
        <div class="grid-content bg-purple">
          {{msg}}
          {{device}}
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  name: 'SiteDetails',
  data() {
    return {
      msg: 'This is the SiteDetails page',
    };
  },
  computed: {
    devices() {
      return this.$myStore.state.devices;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
