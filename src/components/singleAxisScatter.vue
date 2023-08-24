<template>
  <el-card class="bottom_right">
    <div slot="header" class="card_header">
      <span>单轴散点图</span>
      <el-dropdown :hide-on-click="false" style="float: right;">
        <span class="el-dropdown-link">
          添加其他属性<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-checkbox v-model="checked.polar" @change="addPolar">极性</el-checkbox>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.polar">备选项</el-checkbox>
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.polar">备选项</el-checkbox>
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
    </div>
    <div
      ref="singleAxisScatter"
      style="width: 100%; height: 400px"
      @dragover.prevent
      @drop="singleAxisDrop"
    ></div>
  </el-card>
</template>

<script>
import * as echarts from "echarts";
export default {
  name: "SingleAxisScattert",
  data() {
    return {
      checked: {
        polar: false,
      },
      // 需要获取属性的相关口袋
      pocketData: ["1_1", "2_4", "3_3", "4_6", "4_11", "5_4", "6_3"],
      attrValueData: {
        volume: [
          [0, 5],
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [11, 2],
          [12, 4],
          [13, 1],
          [14, 1],
          [15, 3],
          [16, 4],
          [17, 6],
          [18, 4],
          [19, 4],
          [20, 3],
          [21, 3],
          [22, 2],
          [23, 5],
        ],
        dis: [
          [0, 5],
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [11, 2],
          [12, 4],
          [13, 1],
          [14, 1],
          [15, 3],
          [16, 4],
          [17, 6],
          [18, 4],
          [19, 4],
          [20, 3],
          [21, 3],
          [22, 2],
          [23, 5],
        ],
        polar: [
          [0, 5],
          [1, 1],
          [2, 0],
          [3, 0],
          [4, 0],
          [5, 0],
          [6, 0],
          [11, 2],
          [12, 4],
          [13, 1],
          [14, 1],
          [15, 3],
          [16, 4],
          [17, 6],
          [18, 4],
          [19, 4],
          [20, 3],
          [21, 3],
          [22, 2],
          [23, 5],
        ],
      }, // 返回的属性列表
      attrNameList: ["volume", "dis"], // 返回的属性值数据
    };
  },
  mounted() {
    // this.initData();
    this.myCharts();
  },
  methods: {
    async initData() {
      await request({
        url: "/singleAxis/index",
        method: "POST",
        data: { frame_pocket: this.pocketData },
      })
        .then((res) => {
          if (res.status === 200) {
            this.attrValueData = res.data["attr"];
            this.myEcharts();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    myCharts() {
      const singleAxisChart = echarts.init(this.$refs.singleAxisScatter);
      const frames = [
        "1",
        "2",
        "3",
        "4",
        "5",
        "6",
        "7",
        "8",
        "9",
        "10",
        "11",
        "12",
        "13",
        "14",
        "15",
        "16",
        "17",
        "18",
        "19",
        "20",
        "21",
        "22",
        "23",
        "24",
        "25",
        "26",
        "27",
        "28",
        "29",
        "30",
        "31",
        "32",
        "33",
        "34",
        "35",
        "36",
        "37",
      ];
      // const data = [[0, 5], [1, 1], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [11, 2], [12, 4], [13, 1], [14, 1], [15, 3], [16, 4], [17, 6], [18, 4], [19, 4], [20, 3], [21, 3], [22, 2], [23, 5]]
      const title = [];
      const singleAxis = [];
      const series = [];
      let len = this.attrNameList.length;
      this.attrNameList.forEach(function (attrName, idx) {
        title.push({
          textBaseline: "middle",
          top: ((idx + 0.5) * 100) / len + "%",
          text: attrName,
        });
        singleAxis.push({
          left: 50,
          type: "category",
          boundaryGap: false,
          data: frames,
          top: (idx * 100) / len + 5 + "%",
          height: 100 / len - 10 + "%",
          axisLabel: {
            interval: 2,
          },
        });
        series.push({
          singleAxisIndex: idx,
          coordinateSystem: "singleAxis",
          type: "scatter",
          data: [],
          symbolSize: function (dataItem) {
            return dataItem[1] * 4;
          },
        });
      });
      for (let i = 0; i < this.attrNameList.length; i++) {
        series[i].data = this.attrValueData[this.attrNameList[i]];
      }
      // this.attrValueData.volume.forEach(function (dataItem) {
      //   series[0].data.push([dataItem[0], dataItem[1]]);
      // });
      // this.attrValueData.dis.forEach(function (dataItem) {
      //   series[1].data.push([dataItem[0], dataItem[1]]);
      // });
      const option = {
        tooltip: {
          position: "top",
        },
        title: title,
        singleAxis: singleAxis,
        series: series,
      };
      singleAxisChart.setOption(option);
    },
    singleAxisDrop(event) {
      this.pocketData = event.dataTransfer
        .getData("framePocket")
        .trim()
        .split(",");
      this.initData();
    },
    addPolar() {
      if(this.checked.polar == true){
        console.log("addPolar");
        this.attrNameList.push("polar");
        this.myCharts();
      }else{
        console.log('removePolar');
      }
    },
  },
  components: {},
};
</script>

<style scoped></style>
