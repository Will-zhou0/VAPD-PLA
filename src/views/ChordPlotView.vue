<template>
  <div class="com-page">
    <div :class="chordClass" ref="chordPlotRef" @dragstart="chordDragStart" @drop="chordDrop" draggable="true"
      @dragover.prevent>
    </div>
  </div>
</template>

<script>

import { request } from "@/network/request";
import { mapActions, mapState } from "vuex"

export default {
  name: "ChordPlotView",
  props: {
    //  chord 编号
    chordID: { type: String, default: "1" },
    chordData: { type: Array, default: [] },
    chordColor: { type: String }
  },
  data() {
    return {
      chordClass: "chordPlotSVG" + this.chordID,
      width: 210,
      height: 200,
      padding: 1,
      padAngle: 0.02,
      circleRadius: 70,/*内圆半径*/
      arcRadius: 15, /*环状图宽度*/
      arcInnerRadius: 0,
      arcOuterRadius: 0,
      svg: null,  // 弦图
      chart: null,  //
      // 拖拽数据
      chordDropData: [],  // 接收的数据
      chordDropColor: [],
      dropData: "",  // 要传递的数据
      dropColor: "",
      chordPocketData: null, // 获取的弦图数据
    }
  }, computed: {
    ...mapState(["radius", "zoomFactor"])
  }, created() {
    this.chordDropData.push(this.chordData)
    this.chordDropColor.push(this.chordColor)
  }, mounted() {
    this.initData();
  }, methods: {
    // 高亮点
    ...mapActions(["highlightScatter"]),
    initData() {
      let that = this;
      that.width = 210;
      that.height = 200;
      that.padding = 1;
      that.padAngle = 0.02;
      that.circleRadius = 70;
      that.arcRadius = 15;
      that.arcInnerRadius = that.circleRadius + that.padding;    // 环状图内环半径
      that.arcOuterRadius = that.circleRadius + that.arcRadius; // 环状图外环半径
      that.cross = "M0,0 L15,15 M15,0 L0,15"
      // "M50 70A20 20 0 1 0 50 30M50 20V40M20 50H40"
      that.svg = d3.select(".chordPlotSVG" + that.chordID).selectAll("svg.chord_svg").data([1]).join("svg").attr("width", that.width).attr("height", that.height).attr("class", "chordPlotSVG" + that.chordID);
      that.initRequire()
    },
    async initRequire() {
      let that = this;
      if (that.chordDropData.length === 1) {
        // 一条数据为环状图
        that.drawCircleAndRing()
      } else {
        await request({
          url: "/chordPlot/index",
          method: "POST",
          data: { "frame_pocket": that.chordDropData, "padAngle": that.padAngle },
        }).then(res => {
          if (res.status === 200) {
            that.chordPocketData = res.data
            // 颜色渐变
            that.gradualColor(that.chordPocketData["ribbons"])
            that.drawChordChart();
          }
        })
      }
    },
    // 绘制圆形
    drawCircleAndRing() {
      let that = this;
      that.chart = that.svg.append("g").attr("id", "chord_" + "circle_" + that.chordID).attr("transform", `translate(${[that.width / 2, that.height / 2 + 5]})`)

      // 内圆
      that.chart.selectAll("#chord_" + that.chordID).data([1]).join("circle")
        .attr("class", "chord_" + that.chordID + "_circle")
        .attr("r", that.circleRadius).style("fill", that.chordColor)
        .on("mouseover", that.circleMouseenter) // 鼠标进入
        .on("mouseout", that.circleMouseout) // 鼠标离开
        .on("click", that.circleClick)
      // 外环
      that.chart.selectAll("#chord_" + that.chordID + "_arc")
        .data(d3.pie()([1])).join("path")
        .attr("id", "#chord_" + that.chordID + "_arc")
        .attr("d", d3.arc().innerRadius(that.arcInnerRadius).outerRadius(that.arcOuterRadius))
        .style("fill", that.chordColor)
        .on("mouseover", that.circleMouseenter) // 鼠标进入
        .on("mouseout", that.circleMouseout) // 鼠标离开
        .on("click", that.circleClick)

      // 添加叉号 关闭按钮
      that.chart.append("path")
        .attr("d", that.cross)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("transform", `translate(${[that.width / 2 - 25, -that.height / 2 + 5]})`)
        .on("click", function () {
          // 点击移除对应的弦图 center_top_child
          d3.select(this.parentNode.parentNode.parentNode.parentNode.parentNode).remove();
        });
    },
    drawChordChart() {
      let that = this;
      // 删除圆，生成弦图
      d3.select("#chord_circle_" + that.chordID).remove() // 删除指定标签

      that.chart = that.svg.selectAll("g.chordPlotChart" + that.chordID).data([1]).join("g").attr("class", "chordPlotChart" + that.chordID).attr("transform", `translate(${[that.width / 2, that.height / 2 + 5]})`); // 表格
      let chordArc = d3.arc().innerRadius(that.arcInnerRadius).outerRadius(that.arcOuterRadius);
      let chordRibbon = d3.ribbon().radius(that.circleRadius);
      // let chordColor = d3.scaleSequential(d3.interpolateRainbow).domain([0, that.chordDropData.length]);
      // 外部环状图
      that.chart.selectAll("path.arc")
        .data(that.chordPocketData["arcs"])
        .join("path")
        .attr("class", d => d["class"] === undefined ? "arc" : "arc " + d["class"])
        .attr("d", chordArc)
        .style("fill", d => d["index"] === undefined ? d["color"] : that.chordDropColor[d["index"]]) // 外部袋装图
        .on("mouseout", that.chordMouseout)
        .on("mouseover", that.arcMouseenter)
        .on("click", that.arcClick)

      // 内部带状图
      that.chart.selectAll("path.ribbon")
        .data(that.chordPocketData["ribbons"])
        .join("path")
        .attr("class", d => "ribbon " + d["class"])
        .attr("frame_pocket", d => d["frame_pocket"])
        .attr("d", chordRibbon)
        .style("opacity", .5)
        .style("fill", d => "url(#" + that.getGradID(d) + ")")
        .on("mouseover", that.ribbonMouseenter)
        .on("mouseout", that.chordMouseout)
        .on("click", that.ribbonClick)

      // 添加叉号 关闭按钮
      that.chart.append("path")
        .attr("d", that.cross)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("class", "cross")
        .attr("transform", `translate(${[that.width / 2 - 25, -that.height / 2 + 5]})`)
        .on("click", function () {
          // 点击移除对应的弦图 center_top_child
          d3.select(this.parentNode.parentNode.parentNode.parentNode.parentNode).remove();
        });
    },
    chordDragStart(event) {
      let that = this;
      event.dataTransfer.setData("identify", "chordPlotSVG" + that.chordID)
      event.dataTransfer.setData("framePocket", that.dropData)
      event.dataTransfer.setData("color", that.dropColor)
    },
    chordDrop(event) {
      let that = this;
      // 防止在内部拖动
      // 添加新数据
      if (("chordPlotSVG" + that.chordID) !== event.dataTransfer.getData("identify")) {
        that.chordDropData.push(event.dataTransfer.getData("framePocket").trim().split(","))
        that.chordDropColor.push(event.dataTransfer.getData("color")) // 颜色
        that.initRequire()
      }
    },
    getGradID(d) { // 带状图ID生成
      return "linkGrad-" + d["source"]["index"] + "-" + d["target"]["index"];
    },
    gradualColor(ribbons) { // 颜色渐变
      let that = this;
      // console.log("that.chordDropColor    ", that.chordDropColor);
      // let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, that.chordDropData.length])
      let defs = that.svg.selectAll("defs").data([1]).join("defs");
      let grads = defs.selectAll("linearGradient")
        .data(ribbons)
        .join("linearGradient")
        .attr("id", that.getGradID)
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", d => that.arcInnerRadius * Math.cos((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
        .attr("y1", d => that.arcInnerRadius * Math.sin((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
        .attr("x2", d => that.arcInnerRadius * Math.cos((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2))
        .attr("y2", d => that.arcInnerRadius * Math.sin((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2))
      grads.append("stop").attr("offset", "0%").attr("stop-color", d => that.chordDropColor[d.source.index])
      grads.append("stop").attr("offset", "100%").attr("stop-color", d => that.chordDropColor[d.target.index])
    },
    // 高亮
    // 内带
    ribbonMouseenter(node) {
      let that = this;
      // console.log("ribbonMouseenter(node)  ", node)
      that.dropData = node["source"]["frame_pocket"]
      that.chart.selectAll(".chordPlotChart" + that.chordID + " > path").style("opacity", 0.2)
      node["class"].split(" ").forEach(d => d3.selectAll(".chordPlotChart" + that.chordID + " > ." + d).style("opacity", 1))
      this.highlightScatter(that.dropData)
    },
    // 高亮
    // 外环
    arcMouseenter(node) {
      let that = this;
      that.dropData = node["frame_pocket"]
      that.dropColor = that.chordDropColor[node["colorIndex"]]
      // 更改所有的透明度
      that.chart.selectAll(".chordPlotChart" + that.chordID + " > path").style("opacity", 0.2)
      // 选中的高亮
      that.chart.selectAll(".chordPlotChart" + that.chordID + " > ." + node["class"]).style("opacity", 1);
      this.highlightScatter(that.dropData)
    },
    chordMouseout() {
      let that = this;
      d3.selectAll("path.arc").style("opacity", 1)
      d3.selectAll("path.arcLine").style("opacity", 1)
      d3.selectAll("path.cross").style("opacity", 1)
      d3.selectAll("path.ribbon").style("opacity", 0.5)
      d3.select(".scatterView").selectAll("circle").attr("r", that.radius / that.zoomFactor).style("opacity", 1) //
    },
    arcClick(node) {
      // 外环
      console.log(typeof (node.frame_pocket));
      this.$emit("chordScatterLinkLine", node["frame_pocket"])
    },
    ribbonClick(node) {
      // 内带
      console.log(node);
      this.$emit("chordScatterLinkLine", node["source"]["frame_pocket"])
    },
    circleMouseenter() {
      let that = this;
      that.dropData = that.chordData
      that.dropColor = that.chordColor
      this.highlightScatter(this.chordDropData[0].join(","))
    },
    circleMouseout() {
      d3.select(".scatterView").selectAll("circle").attr("r", this.radius / this.zoomFactor).style("opacity", 1)
    },
    circleClick() {
      console.log(this.chordDropData.join(","));
      this.$emit("chordScatterLinkLine", this.chordDropData[0].join(","))
    },
  },
}
</script>

<style scoped></style>
