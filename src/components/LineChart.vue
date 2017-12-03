<script>
import { Line, mixins } from 'vue-chartjs'
const {reactiveProp} = mixins;

export default {
  extends: Line,
  mixins: [reactiveProp],
  name: 'LineChart',
  props: ['data', 'options'],
  mounted () {

    this.renderChart(this.chartData, this.options)
  }
}
</script>