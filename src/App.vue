<template>
  <div id="app">
    <el-container>
      <el-header>
        <el-row :gutter="20">
          <el-col :span="6">
            <div class="grid-content">
              <h3 style="font-weight: 400">Canterbury Gardens</h3>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content"></div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content"></div>
          </el-col>
          <el-col :span="6">
            <div class="grid-content">
              <h5>Internet of Things: Assignment 3: Greenhouse Data</h5>
            </div>
          </el-col>
        </el-row>
      </el-header>
      <el-container>
        <el-aside>
          <el-row>
            <el-menu
              :default-active="$route.path"
              :router="true"
              active-text-color="#409eff"
            >						
              <el-menu-item index="/">
                <i class="el-icon-menu"></i>
                <span>Dashboard</span>
              </el-menu-item>
              <el-submenu
                v-for="site in sites"
                :index="site.id"
                :key="site.id"
              >
                <template slot="title">
                  <i class="el-icon-location"></i>
                  <span>{{site.name}}</span>
                </template>
                <el-menu-item
                  :index="'/' + site.id + '/overview'"
                >
                  Overview
                </el-menu-item>
                <el-menu-item-group title="Zone Listings:">
                  <el-menu-item
                    v-for="location in site.zones"
                    :index="'/' + site.id + '/' + location.id"
                    :key="location.id"
                  >
                    {{location.name}}
                  </el-menu-item>
                </el-menu-item-group>
              </el-submenu>
            </el-menu>
          </el-row>
        </el-aside>
        <el-main>
          <router-view/>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  name: 'app',
  beforeCreate() {
    this.$myStore.dispatch('fetchSites');
    this.$myStore.dispatch('fetchSensors');
    this.$myStore.dispatch('groupData');
  },
  computed: {
    sites() {
      return this.$myStore.state.sites;
    },
  },
};
</script>

<style style="scss">
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.el-header {
  /* background-color: #4a8c2a; */
  color: #fff;
  background: #409eff; 
}

.el-menu {
  text-align: left;
}

.el-row {
  margin-bottom: 20px;
}

.graph-col {
  margin-top: 30px;
}

.graph-col .grid-content {
  box-shadow: 0 0 11px 3px #ccc;
  padding: 15px;
}

.el-col {
  border-radius: 4px;
}

.bg-purple-dark {
  background: #99a9bf;
}

.bg-purple {
  background: #d3dce6;
}

.bg-purple-light {
  background: #e5e9f2;
}

.grid-content {
  border-radius: 8px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
