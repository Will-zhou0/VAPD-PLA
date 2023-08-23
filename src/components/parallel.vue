<template>
  <div class="parallel" ref="parallel"></div>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "ParallelPlot",
  data() {
    return {};
  },
  mounted() {
    const parallel = echarts.init(this.$refs.parallel);
    parallel.setOption({
      parallelAxis: [
        { dim: 0, name: "Price" },
        { dim: 1, name: "Net Weight" },
        { dim: 2, name: "Amount" },
        {
          dim: 3,
          name: "Score",
          type: "category",
          data: ["Excellent", "Good", "OK", "Bad"],
        },
      ],
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
      },
      series: {
        type: "parallel",
        lineStyle: {
          width: 4,
        },
        data: [
          [12.99, 100, 82, "Good"],
          [9.99, 80, 77, "OK"],
          [20, 120, 60, "Excellent"],
        ],
      },
    });
  },
  methods: {},
  components: {},
};
</script>

<style scoped>
.parallel{
  width: 100%;
  height: 200px;
}
</style>
