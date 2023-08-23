<template>
  <div ref="heatmap" style="width: 100%; height: 300px"
  @dragover.prevent @drop="heatmapDrop">热力图</div>
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
];
export default {
  name: "Heatmap",
  data() {
    return {
      charts: null, //
      pocketData: [], // 请求数据
      frameData: [],
      arrs: [],
      similarityArrs: [],
    };
  },
  mounted() {
    this.pocketData = heatmap_frame_pocket;
    // this.initData();
    this.similarityArrs = [["1_1","1_1",1],["1_1","2_4",0.2],["1_1",3,0.5],["1_1",4,0.8],["1_1",5,0.1],["1_1",6,0.7],["1_1",7,0.1],["1_1",8,0.1],
        ["2_4",1,0.4],["2_4","2_4",1],["2_4",3,0.1],["2_4",4,0.2],[2,5,0.3],[2,6,0.4],[2,7,0.1],[2,8,0.1],
        [3,1,0.1],[3,"2_4",0.2],[3,3,1],[3,4,0.4],[3,5,0.5],[3,6,0.6],[3,7,0.8],[3,8,0.8],
        [4,1,0.4],[4,2,0.2],[4,3,0.3],[4,4,1],[4,5,0.5],[4,6,0.6],[4,7,0.8],[4,8,0.8],
        [5,1,0.1],[5,2,0.2],[5,3,0.3],[5,4,0.4],[5,5,1],[5,6,0.6],[5,7,0.8],[5,8,0.8],
        [6,1,0.1],[6,2,0.2],[6,3,0.3],[6,4,0.4],[6,5,0.5],[6,6,1],[6,7,0.8],[6,8,0.8],
        [7,1,0.1],[7,2,0.2],[7,3,0.3],[7,4,0.4],[7,5,0.5],[7,6,0.6],[7,7,1],[7,8,0.8],
        [8,1,0.1],[8,2,0.2],[8,3,0.3],[8,4,0.4],[8,5,0.5],[8,6,0.6],[8,7,0.8],[8,8,1],
    ];
    this.myEcharts()
  },
  methods: {
    async initData() {
    //   let that = this;
      
      await request({
        url: "/subPocket/index",
        method: "POST",
        data: { frame_pocket: that.pocketData },
      })
        .then((res) => {
          if (res.status === 200) {
            // 数据库的数据是 100*100的数组
            // 后端传来的数据应该是 n*n 的相似度数组
            // [  "1_1",  "2_4",  "3_3",  "4_6",  "4_11",  "5_4",  "6_3",  "7_2"];
            // 找到 ["1_1","2_4"],[ "1_1","3_3"]...对应的相似度数组
            // 
            // 接收到的数据应该是[]
            let volumes = res.data["frame_pocket_data"].map(
              (item) => item.volume
            );
            that.arrs.push(volumes);
            let frame_pockets = res.data["frame_pocket_data"].map(
              (item) => item.frame_pocket
            );

            that.frameData = res.data["frame_pocket_data"]; // 每一帧的各个属性值
            that.myEcharts();
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
            height: "80%",
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
        visualMap: {
          min: 0,
          max: 1,
          calculable: true,
        orient: "vertical",
        top: "10%",
        right: "2%",
        text:['High','Low'],
        precision: 2 ,
        },
        series: [
          {
            name: "Similarity",
            type: "heatmap",
            data: this.similarityArrs,
            label: {
              show: true,
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
      this.pocketData = event.dataTransfer.getData("framePocket").trim().split(",")
      this.initRequire()
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
