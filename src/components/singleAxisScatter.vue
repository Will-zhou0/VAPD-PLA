<template>
  <el-card class="bottom_right">
    <div slot="header" class="card_header">
      <span>Scatter on Single Axis</span>
      <el-dropdown :hide-on-click="false" style="float: right">
        <span class="el-dropdown-link">
          Other Attributes<i class="el-icon-arrow-down el-icon--right"></i>
        </span>
        <el-dropdown-menu slot="dropdown">
          <el-dropdown-item>
            <el-checkbox v-model="checked.volume" @change="changeVolume"
              >Volume</el-checkbox
            >
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.polarSasa" @change="changePolarSasa"
              >Polar SASA</el-checkbox
            >
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.apolarSasa" @change="changeApolarSasa"
              >Apolar SASA</el-checkbox
            >
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox
              v-model="checked.hydrophobicDens"
              @change="changeHydrophobicDens"
              >Mean local hydrophobic density</el-checkbox
            >
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.alpSpDens" @change="changeAlpSpDens"
              >Alpha sphere density</el-checkbox
            >
          </el-dropdown-item>
          <el-dropdown-item>
            <el-checkbox v-model="checked.maxDis" @change="changeMaxDis"
              >Cent. of mass - Alpha Sphere max dist</el-checkbox
            >
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
import { request } from "@/network/request";
export default {
  name: "SingleAxisScattert",
  data() {
    return {
      checked: {
        volume: true,
        polarSasa: true,
        apolarSasa: false,
        hydrophobicDens: false,
        alpSpDens: false,
        maxDis: false,
      },
      // 需要获取属性的相关口袋
      pocketData: [
        "20_1",
        "86_1",
        "13_9",
        "21_4",
        "37_6",
        "1_1",
        "2_4",
        "3_3",
        "4_6",
        "4_11",
        "5_4",
        "6_3",
      ],
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
        polarSasa: [
          [0, 15],
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
        apolarSasa: [
          [0, 25],
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
      attrNameList: ["Volume", "Polar SASA"], // 返回的属性值数据
      singleAxisChart: null, // 单轴图表
    };
  },
  mounted() {
    this.initData();
    // this.myCharts();
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
            // console.log(res);
            this.attrValueData = res.data["singleAxisData"];
            console.log("单轴散点图", this.attrValueData);
            this.myCharts();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    myCharts() {
      this.singleAxisChart = echarts.init(this.$refs.singleAxisScatter);
      // 生成1-100字符串的数组
      let frames = [];
      for (let i = 1; i <= 100; i++) {
        frames.push(i);
      }
      console.log(frames);
      // const data = [[0, 5], [1, 1], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [11, 2], [12, 4], [13, 1], [14, 1], [15, 3], [16, 4], [17, 6], [18, 4], [19, 4], [20, 3], [21, 3], [22, 2], [23, 5]]
      let title = [];
      let singleAxis = [];
      let series = [];
      let len = this.attrNameList.length;
      console.log(this.attrNameList);
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
            interval: 4,
          },
        });
        series.push({
          singleAxisIndex: idx,
          coordinateSystem: "singleAxis",
          type: "scatter",
          data: [],
          symbolSize: function (dataItem) {
            return dataItem[3] * 60;
          },
          emphasis: {
            focus: "series",
            blurScope: "global",
          },
        });
      });
      for (let i = 0; i < this.attrNameList.length; i++) {
        series[i].data = this.attrValueData[this.attrNameList[i]];
      }
      const option = {
        tooltip: {
          position: "top",
          valueFormatter: (value) => value[1] + ": " + value[2],
        },
        dataZoom: [
          {
            type: "inside",
            singleAxisIndex: [0, 1, 2, 3, 4, 5, 6],
            start: 0,
            end: 20,
            minValueSpan: 10,
          },
          {
            type: "slider",
            singleAxisIndex: [0, 1, 2, 3, 4, 5, 6],
            start: 0,
            end: 20,
            minValueSpan: 10,
          },
        ],
        title: title,
        singleAxis: singleAxis,
        series: series,
      };
      console.log(option);
      this.singleAxisChart.setOption(option, true);
    },
    singleAxisDrop(event) {
      this.pocketData = event.dataTransfer
        .getData("framePocket")
        .trim()
        .split(",");
      this.initData();
    },
    changeVolume() {
      if (this.checked.volume == true) {
        console.log("addVolume");
        this.attrNameList.push("Volume");
        this.myCharts();
      } else {
        console.log("removeVolume");
        this.attrNameList.splice(this.attrNameList.indexOf("Volume"), 1);
        this.singleAxisChart.setOption({});
        this.myCharts();
      }
    },
    changePolarSasa() {
      if (this.checked.polarSasa == true) {
        console.log("addPolarSasa");
        this.attrNameList.push("Polar SASA");
        this.myCharts();
      } else {
        console.log("removePolarSasa");
        this.attrNameList.splice(this.attrNameList.indexOf("Polar SASA"), 1);
        this.myCharts();
      }
    },
    changeApolarSasa() {
      if (this.checked.apolarSasa == true) {
        console.log("addApolarSasa");
        this.attrNameList.push("Apolar SASA");
        this.myCharts();
      } else {
        console.log("removeApolarSasa");
        this.attrNameList.splice(this.attrNameList.indexOf("Apolar SASA"), 1);
        this.myCharts();
      }
    },
    changeHydrophobicDens() {
      if (this.checked.hydrophobicDens == true) {
        console.log("addHydrophobicDens");
        this.attrNameList.push("Mean local hydrophobic density");
        this.myCharts();
      } else {
        console.log("removeHydrophobicDens");
        this.attrNameList.splice(
          this.attrNameList.indexOf("Mean local hydrophobic density"),
          1
        );
        this.myCharts();
      }
    },
    changeAlpSpDens() {
      if (this.checked.alpSpDens == true) {
        console.log("addAlpSpDens");
        this.attrNameList.push("Alpha sphere density");
        this.myCharts();
      } else {
        console.log("removeAlpSpDens");
        this.attrNameList.splice(
          this.attrNameList.indexOf("Alpha sphere density"),
          1
        );
        this.myCharts();
      }
    },
    changeMaxDis() {
      if (this.checked.maxDis == true) {
        console.log("addMaxDis");
        this.attrNameList.push("Cent. of mass - Alpha Sphere max dist");
        this.myCharts();
      } else {
        console.log("removeMaxDis");
        this.attrNameList.splice(
          this.attrNameList.indexOf("Cent. of mass - Alpha Sphere max dist"),
          1
        );
        this.myCharts();
      }
    },
  },
  components: {},
};
</script>

<style scoped></style>
