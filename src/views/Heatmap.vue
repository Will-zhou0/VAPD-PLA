<template>
  <div
    ref="heatmap"
    style="width: 100%; height: 350px"
    @dragover.prevent
    @drop="heatmapDrop"
  >
    热力图
  </div>
</template>

<script>
import { request } from "@/network/request";
import * as echarts from "echarts";
let heatmap_frame_pocket = [
  "1_1",
  "2_4",
  "3_3",
  "4_6",
  "4_11",
  "5_4",
  "6_3",
  "7_2",
  "20_1",
  "86_1",
  "13_9",
  "21_4",
  "37_6",
  "12_4",
  "19_5",
  "54_5",
  "95_5",
  "97_6",
];
export default {
  name: "Heatmap",
  data() {
    return {
      pocketData: [], // 请求的口袋参数
      similarityArrs: [], // 返回的相似度数组
    };
  },
  mounted() {
    this.pocketData = heatmap_frame_pocket;
    this.initData();
    // this.myEcharts()
  },
  methods: {
    async initData() {
      //   let that = this;

      await request({
        url: "/subPocket/index",
        method: "POST",
        data: { frame_pocket: this.pocketData },
      })
        .then((res) => {
          if (res.status === 200) {
            this.similarityArrs = res.data["subSimilarity"];
            this.myEcharts();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    myEcharts() {
      const myChart = echarts.init(this.$refs.heatmap);
      const option = {
        tooltip: {
          position: "top",
        },
        grid: {
          height: "70%",
          top: "5%",
        },
        xAxis: {
          type: "category",
          data: this.pocketData,
          splitArea: {
            show: true,
          },
        },
        yAxis: {
          type: "category",
          data: this.pocketData,
          splitArea: {
            show: true,
          },
        },
        dataZoom: [
          {
            type: "inside",
            xAxisIndex: 0,
            start: 0,
            end: 30,
            filterMode: "filter",
          },
          {
            type: "slider",
            xAxisIndex: 0,
            start: 0,
            end: 30,
            filterMode: "filter",
          },
          {
            type: "inside",
            yAxisIndex: 0,
            start: 0,
            end: 30,
            filterMode: "filter",
          },
          {
            type: "slider",
            yAxisIndex: 0,
            start: 0,
            end: 30,
            filterMode: "filter",
          },
        ],
        visualMap: {
          min: 0,
          max: 1,
          calculable: true,
          orient: "vertical",
          top: "10%",
          right: "5%",
          text: ["High", "Low"],
          precision: 2,
        },
        series: [
          {
            name: "Similarity",
            type: "heatmap",
            data: this.similarityArrs,
            label: {
              show: false,
            },
            emphasis: {
              itemStyle: {
                shadowBlur: 10,
                shadowColor: "rgba(0, 0, 0, 0.5)",
              },
            },
          },
        ],
      };
      // 使用刚指定的配置项和数据显示图表。
      myChart.setOption(option);
    },

    heatmapDrop(event) {
      this.pocketData = event.dataTransfer
        .getData("framePocket")
        .trim()
        .split(",");
      this.initData();
    },

    mouseXY(e) {
      this.mouseX = e.offsetX;
    },

    boxPlotDrop(event) {
      // console.log(event.dataTransfer.getData("framePocket"));
      this.pocketData = event.dataTransfer
        .getData("framePocket")
        .trim()
        .split(",");
      this.initData();
    },
    parallelClick(node) {
      console.log(node);
      this.$emit("parallelShowMol", node);
      this.$emit("parallelScatterLinkLine", node["frame_pocket"]);
      this.highlightScatter(node["frame_pocket"]);
    },
  },
};
</script>
