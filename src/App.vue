<template>
	<div id="app">
		<el-container>
			<el-header>
				<el-row :gutter="20">
					<el-col :span="6">
						<div class="grid-content">
							<h5>Internet of Things: Assignment 3</h5>
						</div>
					</el-col>
					<el-col :span="6">
						<div class="grid-content"></div>
					</el-col>
					<el-col :span="6">
						<div class="grid-content"></div>
					</el-col>
					<el-col :span="6">
						<div class="grid-content"></div>
					</el-col>
				</el-row>
			</el-header>
			<el-container>
				<el-aside width="200px">
					<el-row class="tac">
						<el-menu default-active="1" :router="true" background-color="#545c64" text-color="#fff" active-text-color="#ffd04b" style="text-align:left">
							<el-menu-item index="/">
								<i class="el-icon-menu"></i>
								<span>Dashboard</span>
							</el-menu-item>
							<el-submenu index="1">
								<template slot="title">
									<i class="el-icon-location"></i>
									<span>Greenhouse 1</span>
								</template>
								<el-menu-item index="/gh1">Overview</el-menu-item>
								<el-menu-item-group title="Specific locations">
									<el-menu-item index="1-2">CO2 Generator</el-menu-item>
									<el-menu-item index="1-3">Cactus Field</el-menu-item>
									<el-menu-item index="1-4">South Entrance</el-menu-item>
									<el-menu-item index="1-5">North Entrance</el-menu-item>
								</el-menu-item-group>
							</el-submenu>
							<el-submenu index="2">
								<template slot="title">
									<i class="el-icon-location"></i>
									<span>Greenhouse 2</span>
								</template>
								<el-menu-item index="/gh2">Overview</el-menu-item>
								<el-menu-item-group title="Specific locations">
									<el-menu-item index="2-2">CO2 Generator</el-menu-item>
									<el-menu-item index="2-3">Lettuce Field</el-menu-item>
									<el-menu-item index="2-4">South Entrance</el-menu-item>
									<el-menu-item index="2-5">North Entrance</el-menu-item>
									<el-menu-item index="2-6">Near water mains</el-menu-item>
								</el-menu-item-group>
							</el-submenu>
							<el-submenu index="3">
								<template slot="title">
									<i class="el-icon-location"></i>
									<span>Greenhouse 3</span>
								</template>
								<el-menu-item index="/gh3">Overview</el-menu-item>
								<el-menu-item-group title="Specific locations">
									<el-menu-item index="3-2">CO2 Generator</el-menu-item>
									<el-menu-item index="3-3">Seedlings</el-menu-item>
									<el-menu-item index="3-4">East Entrance</el-menu-item>
									<el-menu-item index="3-5">West Entrance</el-menu-item>
								</el-menu-item-group>
							</el-submenu>
							<el-submenu index="4">
								<template slot="title">
									<i class="el-icon-location"></i>
									<span>Outdoor beds</span>
								</template>
								<el-menu-item index="/beds">Overview</el-menu-item>
								<el-menu-item-group title="Specific locations">
									<el-menu-item index="4-2">Root crops</el-menu-item>
									<el-menu-item index="4-3">Much heap</el-menu-item>
									<el-menu-item index="4-4">Shed</el-menu-item>
								</el-menu-item-group>
							</el-submenu>
							<el-menu-item index="/store">
								<i class="el-icon-location"></i>
								<span>Store Room</span>
							</el-menu-item>
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
  created() {
    this.$myStore.dispatch('fetchDevices');
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
  background-color: #545c64;
  color: #fff;
}

.el-submenu .el-menu-item {
  font-size: 13px;
  height: 40px;
  line-height: 40px;
}

.el-row {
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
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
  border-radius: 4px;
  min-height: 36px;
}

.row-bg {
  padding: 10px 0;
  background-color: #f9fafc;
}
</style>
