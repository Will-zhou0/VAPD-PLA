<template>
  <div id="parallelPlot" ref="parallelPlotRef" @drop="parallelPlotDrop" @dragover.prevent @mousemove="mouseXY">
  </div>
</template>

<script>
import { request } from "@/network/request";

const { mapActions } = require("vuex");
let parallel_frame_pocket = ["20_1", "86_1", "13_9", "21_4", "37_6", "12_4", "19_5", "54_5", "95_5", "97_6", "57_6", "71_5", "61_6", "72_3", "55_6", "53_7", "33_5", "9_5", "90_5", "87_6", "39_8", "41_4", "98_8", "24_5"];
export default {
  name: "ParallelPlotView",
  data() {
    return {
      width: 720,       /*  平行坐标图宽度 */
      height: 190,      /*  平行坐标图高度 */
      margin: 10,
      svg: null,   //
      charts: null,  //

      tooltip: "",
      line: "",           // 线性生成器
      scales: [],         // 刻度尺
      colorScales: null,  // 颜色刻度尺
      pocketData: [],     // 请求数据
      frameData: [],
      columnName: [],     // 列名
      rangeData: [],      // 范围
      mapIndex: [],       // 下标映射
      axis: [],
      mouseX: 0, // 鼠标位置
      timeOut: null,
    }
  },
  mounted() {
    this.pocketData = parallel_frame_pocket;
    this.initData();
  },
  methods: {
    ...mapActions(["highlightScatter"]),
    initData() {
      let that = this;
      that.svg = d3.select("#parallelPlot").selectAll("svg").data([1]).join("svg").attr("width", that.width).attr("height", that.height)
      that.charts = that.svg.selectAll("g.parallelClass").data([1]).join("g").attr("class", "parallelClass").attr("width", 780).attr("height", 200).attr('transform', `translate(-10,0)`)
      that.colorScales = d3.scaleSequential(d3.interpolateRainbow).domain([0, 30]);
      that.line = d3.line()
      // 提示框
      that.drawToolTips();
      that.initRequire();

    },
    async initRequire() {
      let that = this;
      await request({
        url: "/parallelPlot/index",
        method: "POST",
        data: { "frame_pocket": that.pocketData }
      }).then(res => {
        if (res.status === 200) {
          that.frameData = res.data["frame_pocket_data"];  // 每一帧的各个属性值
          that.columnName = res.data["columnName"];        // 显示的列名
          that.rangeData = res.data["rangeData"]           // 返回属性范围
          that.mapIndex = res.data["mapIndex"]             // 下标映射
          that.drawChart();
        }
      }).catch(err => {
        console.log(err)
      })
      // that.drawChart();
    },
    drawChart() {
      let that = this;
      // 绘制图表
      let columnNameLength = that.columnName.length;
      for (let i = 0; i < columnNameLength; i++) {
        that.scales[that.columnName[i]] = d3.scaleLinear().range([that.height - that.margin * 2, 0]).nice().domain([that.rangeData[that.columnName[i]]["min"], that.rangeData[that.columnName[i]]["max"]]);
        that.axis[that.columnName[i]] = d3.axisLeft(that.scales[that.columnName[i]])
        that.charts.selectAll("." + that.columnName[i] + "_class").data([1]).join("g").attr("class", that.columnName[i] + "_class").attr("transform", `translate(${[that.margin + (that.width / columnNameLength) * i, that.margin]})`).call(that.axis[that.columnName[i]])
      }

      // 坐标轴标签
      that.charts.selectAll("text.parallelTextLabel")
        .data(that.columnName)
        .join("text")
        .attr("class", "parallelTextLabel")
        .attr("transform", (d, i) => {
          return `translate(${[that.margin * 0.7 + (that.width / (columnNameLength) * i) - 15, that.margin * 0.7 - 5]}) rotate(30)`
        }).attr("fill", "black")
        .attr("font-size", 12)
        .text(d => d);

      // 绘制线
      that.charts.selectAll("path.parallel_line")
        .data(that.frameData)
        .join("path")
        .attr("class", d => "parallel_line parallel_line_" + d["frame_pocket"])
        .attr("d", that.generationLine)
        .style("fill", "none")
        .style("stroke", d => d["color"]/*that.colorScales(d["colorLabel"])*/)
        .style("opacity", 0.3)
        .style("stroke-width", 2)
        .on("mouseenter", that.mouseEnter) // 添加鼠标进入监听事件
        .on("mouseout", that.mouseOut)   // 添加
        .on("click", that.parallelClick)    // 三维模型中被触发
    },

    // 根据每帧的每个属性生成折线图
    generationLine(node) {
      let that = this;
      let columnNameLength = that.columnName.length;
      let d = [];
      for (let i = 0; i < columnNameLength; i++) {
        d.push([that.margin + (that.width / (columnNameLength)) * i, that.margin + that.scales[that.columnName[i]](node[that.columnName[i]])])
      }
      return that.line(d);
    },
    mouseEnter(node) {
      let that = this;
      // console.log("mouseEnter node ", node)
      d3.selectAll("path.parallel_line").style("opacity", 0.1)
      d3.select(".parallel_line_" + node["frame_pocket"]).style("opacity", 1)
      // // 默认显示在左边
      let flag = true;
      if (that.mouseX > that.width / 2)
        flag = false;
      // 显示图例
      that.timeOut = setTimeout(() => {
        console.log(node);
        console.log(that.mapIndex);
        console.log();
        that.showDetails(that.frameData[that.mapIndex[node["frame_pocket"]]], !flag); // 显示详情
      }, 500);
    },
    mouseXY(e) {
      this.mouseX = e.offsetX
    },
    drawToolTips() {
      let that = this;
      that.tooltip = that.svg.selectAll("g.parallel_tooltip").data([1]).join("g").attr("class", "parallel_tooltip").attr("opacity", 0)
      that.tooltip.selectAll("rect").data([1]).join("rect").attr("width", 80).attr("height", 110).attr("rx", 3).attr("ry", 3).attr("x", -3).attr("y", -10).style("fill", "#eee").style("fill-opacity", 0.7).style("stroke-width", 3).style("stroke", "gray").style("stroke-opacity", "0.5");
      that.tooltip.selectAll("text.parallel_Frame").data([1]).join("text").attr("class", "parallel_Frame").attr("y", 5);
      that.tooltip.selectAll("text.parallel_Volume").data([1]).join("text").attr("class", "parallel_Volume").attr("y", 20);
      that.tooltip.selectAll("text.parallel_PocketScore").data([1]).join("text").attr("class", "parallel_PocketScore").attr("y", 35);
      that.tooltip.selectAll("text.parallel_DrugScore").data([1]).join("text").attr("class", "parallel_DrugScore").attr("y", 50);
      that.tooltip.selectAll("text.parallel_HydrophobicityScore").data([1]).join("text").attr("class", "parallel_HydrophobicityScore").attr("y", 65);
      that.tooltip.selectAll("text.parallel_AlphaNumber").data([1]).join("text").attr("class", "parallel_AlphaNumber").attr("y", 80);
      that.tooltip.selectAll("text.parallel_PolarityScore").data([1]).join("text").attr("class", "parallel_PolarityScore").attr("y", 95);
    },
    mouseOut() {
      let that = this;
      if (that.timeOut) {
        clearTimeout(that.timeOut)
      }
      d3.selectAll("path.parallel_line").style("opacity", 0.3)
      d3.select(".parallel_tooltip").attr("opacity", 0)   // 隐藏提示框
    },

    // 显示悬浮框
    showDetails(nodeInfo, flag) {
      let that = this;
      d3.select(".parallel_tooltip").attr("opacity", 1)            // 显示提示框
      let frame = d3.select(".parallel_tooltip .parallel_Frame").text(nodeInfo["frame_pocket"]) // 编号
      let volume = d3.select(".parallel_tooltip .parallel_Volume").text("Volume : " + nodeInfo["volume"])
      let pocketScore = d3.select(".parallel_tooltip .parallel_PocketScore").text("PocketScore : " + nodeInfo["score"])
      let drugScore = d3.select(".parallel_tooltip .parallel_DrugScore").text("DrugScore : " + nodeInfo["drugscore"])
      let hydrophobicityScore = d3.select(".parallel_tooltip .parallel_HydrophobicityScore").text("HydrophobicityScore : " + nodeInfo["hydropscore"])
      let alphaNumber = d3.select(".parallel_tooltip .parallel_AlphaNumber").text("AlphaNumber : " + nodeInfo["alphanum"])
      let polarityScore = d3.select(".parallel_tooltip .parallel_PolarityScore").text("PolarityScore : " + nodeInfo["polarityscore"])

      let boxWidth = 5 + d3.max(
        [
          frame.node().getComputedTextLength(),
          volume.node().getComputedTextLength(),
          pocketScore.node().getComputedTextLength(),
          drugScore.node().getComputedTextLength(),
          hydrophobicityScore.node().getComputedTextLength(),
          alphaNumber.node().getComputedTextLength(),
          polarityScore.node().getComputedTextLength(),
        ]
      )
      if (flag) {  // 表示显示在左边
        d3.select(".parallel_tooltip").attr("transform", `translate(${[50, 50]})`);
      } else {
        d3.select(".parallel_tooltip").attr("transform", `translate(${[that.width - 50 - boxWidth, 50]})`)
      }
      d3.select(".parallel_tooltip rect").attr("width", boxWidth);
    },
    parallelPlotDrop(event) {
      // console.log(event.dataTransfer.getData("framePocket"));
      this.pocketData = event.dataTransfer.getData("framePocket").trim().split(",")
      this.initRequire()
    },
    parallelClick(node) {
      console.log('parallel_node', node);
      this.$emit("parallelShowMol", node)
      this.$emit("parallelScatterLinkLine", node["frame_pocket"])
      this.highlightScatter(node["frame_pocket"])
    }
  }
}
</script>

<style scoped></style>
