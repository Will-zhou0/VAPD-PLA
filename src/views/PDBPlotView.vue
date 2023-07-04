<template>
  <div>
    <div class="rightTop">
      <div id="pdbView">
      </div>
    </div>
    <div class="rightBottomTimeLine" @drop="timeLineDrop" @dragover.prevent>
      <div id="timeLine_text">0</div>
    </div>
  </div>
</template>

<script>
import {request} from "@/network/request";

export default {
  name: "PDBPlotView",
  data() {
    let width = 520, height = 230, margin = 10;
    return {
      viewerInstance: null,
      viewerContainer: null,
      optionBall: null,
      frame: [],// 接收拖入的数据
      framePocket: "1_1",
      framePocketStr: "", // 滑块数据
      width,
      height,
      margin,
      chartWidth: width - (margin * 2),
      chartHeight: height - margin,
      barWidth: 10,
      legend: null, // 图例

      svg: "",
      chart: "",
    }
  },
  mounted() {
    this.initData()
    this.initMolStart()
  },
  methods: {
    initMolStart() {
      let that = this;
      that.viewerInstance = new PDBeMolstarPlugin();
      that.viewerContainer = document.getElementById("pdbView")
      that.optionBall = {
        customData: {
          url: "http://127.0.0.1:5000/molStar/molStarInit?frame_pocket=" + that.framePocket, format: "pdb",
        }, visualStyle: "molecular-surface",    // 分子表面
        // visualStyle: "carbohydrate",            // 碳水化合物
        // visualStyle: 'distance-restraint',
        // visualStyle:"putty",                // 线
        // visualStyle: "mesh",              // 球
        bgColor: {r: 255, g: 255, b: 255}, hideControls: true, landscape: false,
      }
      that.viewerInstance.render(that.viewerContainer, that.optionBall)
    },
    initData() {
      let that = this;
      that.frame = [["76_4", "49_4", "47_5", "65_4", "2_5", "63_2", "15_8", "86_7", "7_9", "72_5", "22_5", "79_5", "11_4", "12_6", "82_5", "85_6", "28_6"],
        ["1_8", "2_8", "3_12", "5_6", "6_4", "7_8", "9_5", "10_3", "11_5", "12_4", "13_9", "14_7", "15_6", "16_5", "17_7", "18_5", "19_5", "20_5", "21_4", "22_4", "23_4", "24_4", "25_11", "26_5", "28_4", "29_5", "30_4", "31_10", "32_6", "33_5", "34_5", "35_5", "36_5", "37_6", "38_4", "39_8", "40_7", "41_4", "42_2", "43_4", "44_4", "45_2", "46_7", "47_4", "48_8", "49_6", "50_5", "51_4", "52_11", "53_7", "54_5", "55_6", "56_7", "57_6", "58_4", "59_2", "60_4", "61_6", "62_3", "63_7", "64_9", "65_5", "66_6", "67_3", "68_4", "69_5", "70_4", "71_5", "72_3", "73_1", "74_7", "75_6", "76_5", "77_4", "78_8", "79_3", "80_3", "81_7", "82_6", "83_4", "84_5", "85_5", "86_5", "87_6", "88_7", "89_7", "90_5", "91_3", "92_3", "93_6", "94_3", "95_5", "96_6", "97_6", "98_5", "99_10", "100_6",]]
      that.initRequire()
    },
    // 数据请求
    async initRequire() {
      let that = this;
      await request({
        url: "/molStar/frame_bar",
        method: "POST",
        data: {"frame_pocket": that.frame}
      }).then(res => {
        if (res.status === 200) {
          that.frameMap = res.data["frameMap"];       // 每一帧的各个属性值
          that.clusterBar = res.data["clusterBar"];         // 表示有多少簇 clusterBar : 1
          that.frameExtent = res.data["frameExtent"]            // 数据帧范围 frameExtent : [2, 86]
          that.maxValue = res.data["maxVolume"]             // maxVolume: 353.147
          that.barData = res.data["barData"]
          // 表示每组的宽度
          that.barWidth = (that.width - that.margin * 4.5) / (that.frameExtent[1] - that.frameExtent[0])
          // console.log("that.frameExtent ", that.frameExtent)
          that.drawChart();
        }
      }).catch(err => {
        console.log(err)
      })
    },
    drawChart() {
      let that = this;
      that.svg = d3.select(".rightBottomTimeLine")
          .selectAll("svg.timeLineSvg").data([1]).join("svg")
          .attr("class", "timeLineSvg")
          .attr("width", that.width)
          .attr("height", that.height)

      that.chart = that.svg.selectAll("g.timeLineChart").data([1]).join("g").attr("transform", `translate(${[that.margin * 2, that.margin]})`).attr("class", "timeLineChart")
      // that.chart.append("rect").attr("width", that.chartWidth - that.margin * 2).attr("height", that.chartHeight - that.margin * 2).style("fill", "#a83f3f")
      let timeLineScaleLinearAxisBottom = d3.scaleLinear().range([0, that.chartWidth - that.margin * 2]).domain(d3.extent(that.frameExtent)); // 线性比例尺
      let timeLineScaleLinearAxisLeft = d3.scaleLinear().range([0, that.chartHeight - that.margin * 2]).domain([that.maxValue, 0])
      let timeLineAxisBottom = d3.axisBottom(timeLineScaleLinearAxisBottom).tickValues(d3.extent(that.frameExtent)).tickSize(that.margin / 2);   // 刻度点
      let timeLineAxisLeft = d3.axisLeft(timeLineScaleLinearAxisLeft).tickSize(2)    // 刻度点
      let timeLineAxisColorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, that.clusterBar]) // 填充颜色

      // 坐标轴位置
      that.chart.selectAll("g.axisBottom").data([1]).join("g").attr("transform", `translate(${[0, that.chartHeight - that.margin * 2]})`).attr("class", "axisBottom").call(timeLineAxisBottom)
      that.chart.selectAll("g.axisLeft").data([1]).join("g").attr("class", "axisLeft").call(timeLineAxisLeft);

      // 边框
      that.chart.selectAll("g.timeLine_chart_border").data([1]).join("g").attr("transform", `translate(${[0, that.chartHeight - that.margin * 2]})`).attr("class", "timeLine_chart_border")
          .selectAll("rect").data([1]).join("rect")
          .attr("id", "timeLine_chart_border")
          .attr("rx", that.margin / 2)
          .attr("width", that.chartWidth - that.margin * 2) // 滑动条宽度
          .attr("height", that.margin)  // 滑动条高度
          .style("stroke-width", 1).style("stroke", "black").attr("fill", "none");

      // 绘制柱状图
      that.chart.selectAll("rect.bar").data(that.barData).join("rect").attr("class", d => "bar cluster cluster_" + d["j"])
          .attr("id", d => "bar_" + d["frame_pocket"])
          .attr("x", d => (d["i"] * that.barWidth + that.barWidth / that.clusterBar * d["j"]))
          .attr("y", d => that.chartHeight - timeLineScaleLinearAxisLeft(d["volume"]) - that.margin * 2)
          .attr("width", that.barWidth / that.clusterBar)   // 宽度为
          .attr("height", d => timeLineScaleLinearAxisLeft(d["volume"]))
          .style("fill", d => timeLineAxisColorScale(d["j"]))
          .on("click", that.timeLineBarClick)
          .on("mouseenter", "")
          .on("mouseleave", "")

      // 绘制图例
      that.legend = that.chart.selectAll("g.item").data(that.frame).join("g").attr("class", (d, i) => "cluster cluster_" + i)
          .attr("transform", `translate(${[that.margin, that.margin]})`)
          .on("mouseenter", (d, i) => that.mouseEnterLegend(i))
          .on("mouseleave", that.mouseLeaveLegend)
          .each(function (d, i) {
            d3.select(this).selectAll("rect").data([1])
                .join("rect")
                .attr("x", i * 90)
                .attr("y", -8)
                .attr("height", 8)
                .attr("width", 20)
                .style("fill", timeLineAxisColorScale(i))
            d3.select(this).selectAll("text").data([1])
                .join("text")
                .attr("x", 22 + i * 90)
                .text("cluster_" + i)
                .style("font-size", 14)
          })

      let timeLine_dragBehavior = d3.drag().on("drag", function () {
        let dx = +d3.event.dx; // 移动坐标
        let node = d3.select(this);
        let x = +node.attr("x"); // 当前选中节点
        let border = +d3.select("#timeLine_chart_border").attr("width")
        if ((x >= 0 && (x + that.margin) <= border) && (x + dx >= 0 && (x + dx + that.margin) <= border)) node.attr("x", x + dx)
        // 更新标签数据
        let text = d3.select("#timeLine_text") // 标签数据
        let frame_num = Math.ceil(timeLineScaleLinearAxisBottom.invert(x + that.margin / 2)) - 2 // 映射的键值
        if (that.frameMap[frame_num]) {
          that.framePocketStr = frame_num + "," + that.frameMap[frame_num].join("-")
          text.text(frame_num)
        }
      }).on("end", function () {
        that.timeLineSlider(that.framePocketStr) //
      })

      // 绘制滑块
      that.chart.selectAll("rect.timeLine_slider").data([1]).join("rect").attr("class", "timeLine_slider").attr("x", 0).attr("y", that.margin).attr("rx", 5).attr("width", that.margin).attr("height", that.margin)
          .attr("transform", `translate(${[0, that.chartHeight - that.margin * 3]})`)
          .style("stoke", "black").style("stroke-width", 1).attr("fill", "black").call(timeLine_dragBehavior)
    },
    mouseEnterLegend(index) {
      d3.selectAll(".cluster").style("opacity", .2)
      d3.selectAll(".cluster_" + index).style("opacity", 1)
    },
    mouseLeaveLegend() {
      d3.selectAll(".cluster").style("opacity", 1)
    },
    timeLineDrop(event) {
      let that = this;
      that.frame.push(event.dataTransfer.getData("framePocket").trim().split(",")) // 放入多维数据
      console.log("timeLineDrop ", that.frame)
      // 请求数据
      that.initRequire()
    },
    timeLineBarClick(node) {
      // node {frame_pocket: '49_4', i: 48, j: 0, volume: 284.376}
      console.log("timeLineBarClick ", node)
      this.PDBClick(node)
    },
    timeLineSlider(pocketData) {
      // 19,19_5
      // console.log("timeLineSlider ", pocketData)
      let that = this;
      that.viewerInstance.visual.update({
        customData: {
          url: "http://127.0.0.1:5000/molStar/slider?frame_pocket=" + pocketData, format: 'pdb',
        }, bgColor: {r: 255, g: 255, b: 255}, visualStyle: "molecular-surface",
      }, true)
    },
    PDBClick(node) {
      // node
      console.log("PDBClick  ", node)
      let that = this;
      that.viewerInstance.visual.update({
        customData: {
          url: "http://127.0.0.1:5000/molStar/framePocket?frame_pocket=" + node, format: 'pdb',
        }, bgColor: {r: 255, g: 255, b: 255}, visualStyle: "molecular-surface",
      }, true)
    }
  }
}
</script>

<style scoped>


#timeLine_text {
  height: 20px;
}

#pdbView {
  /*float: left;*/
  width: 100%;
  height: 100%;
  position: relative;
}

.rightBottomTimeLine {
  width: 520px;
  height: 250px;
  position: relative;
}
</style>
