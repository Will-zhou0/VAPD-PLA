<template>
  <div>
    <v-chart :options="chartOptions" />
  </div>
</template>

<script>
import * as echarts from 'echarts'

export default {
  data() {
    return {
      chartOptions: {
        tooltip: {
          trigger: 'item',
          formatter: '{a} <br/>{b} : {c} ({d}%)',
        },
        series: [
          {
            type: 'chord',
            data: [
              ['A', 'B', 1],
              ['A', 'C', 2],
              ['A', 'D', 3],
              ['A', 'E', 4],
              ['B', 'C', 5],
              ['B', 'D', 6],
              ['B', 'E', 7],
              ['C', 'D', 8],
              ['C', 'E', 9],
              ['D', 'E', 10],
            ],
            itemStyle: {
              emphasis: {
                lineStyle: {
                  width: 4,
                },
              },
            },
          },
        ],
      },
    }
  },
}
</script>
