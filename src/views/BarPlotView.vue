<template>
  <div :class="barClass" @drop="timeLineDrop" @dragover.prevent>
    <div :id="barClass + '_text'">The current frame is: 0</div>
  </div>
</template>

<script>
import { request } from "@/network/request";

const { mapActions } = require("vuex");

export default {
  name: "BarPlotView",
  // bars=[{barClass,barData,barName,barColor}]
  props: { bar: undefined },

  data() {
    let width = 450,
      height = 230,
      margin = 10;
    return {
      barClass: "bar" + this.bar.barClass,
      frame: [], // 接收拖入的数据
      // framePocket: "1_1",
      framePocketStr: "", // 滑块数据
      barColors: [],
      width,
      height,
      margin,
      chartWidth: width - margin * 2,
      chartHeight: height - margin,
      barWidth: 10,
      legend: null, // 图例

      svg: "",
      chart: "",
    };
  },
  created() {
    let that = this;
    that.frame.push(that.bar.barData);
    that.barColors.push(that.bar.barColor);
  },
  mounted() {
    this.initData();
  },
  methods: {
    ...mapActions(["highlightScatter"]),
    initData() {
      let that = this;
      that.cross = "M0,0 L15,15 M15,0 L0,15";
      that.zoomStr =
        "M919.264 905.984l-138.912-138.912C851.808 692.32 896 591.328 896 480c0-229.376-186.624-416-416-416S64 250.624 64 480s186.624 416 416 416c95.008 0 182.432-32.384 252.544-86.208l141.44 141.44a31.904 31.904 0 0 0 45.248 0 32 32 0 0 0 0.032-45.248zM128 480C128 285.92 285.92 128 480 128s352 157.92 352 352-157.92 352-352 352S128 674.08 128 480z M625.792 448H512v-112a32 32 0 0 0-64 0V448h-112a32 32 0 0 0 0 64H448v112a32 32 0 1 0 64 0V512h113.792a32 32 0 1 0 0-64z";
      that.initRequire();
    },
    // 数据请求
    async initRequire() {
      let that = this;
      await request({
        url: "/molStar/frame_bar",
        method: "POST",
        data: { frame_pocket: that.frame },
      })
        .then((res) => {
          if (res.status === 200) {
            that.frameMap = res.data["frameMap"]; // frame_framePocket_dict 帧——口袋的映射 一帧可能对应几个不同的口袋
            that.clusterBar = res.data["clusterBar"]; // 表示有多少簇 clusterBar : 1

            that.frameExtent = res.data["frameExtent"]; // 数据帧范围 frameExtent : [2, 86]
            that.maxValue = res.data["maxVolume"]; // maxVolume: 353.147
            that.maxDis = res.data["maxDis"]; // 质心——阿尔法球的最大距离 中的最大值
            that.barData = res.data["barData"]; // 每一帧的各个属性值
            console.log("that.barData ", that.barData);
            // 表示每组的宽度
            that.barWidth =
              (that.width - that.margin * 4.5) /
              (that.frameExtent[1] - that.frameExtent[0]);
            // console.log("that.frameExtent ", that.frameExtent)
            that.drawChart();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    drawChart() {
      let that = this;
      // console.log(that.maxValue, that.maxDis);
      that.svg = d3
        .select("." + that.barClass)
        .selectAll("svg." + that.barClass + "timeLineSvg")
        .data([1])
        .join("svg")
        .attr("class", that.barClass + "timeLineSvg")
        .attr("width", that.width)
        .attr("height", that.height)
        .style("border-radius", "10px");

      // .attr("transform", `translate(${[that.margin, 0]})`)

      that.chart = that.svg
        .selectAll("g.timeLineChart")
        .data([1])
        .join("g")
        .attr("transform", `translate(${[that.margin * 2, that.margin]})`)
        .attr("class", "timeLineChart");
      // that.chart.append("rect").attr("width", that.chartWidth - that.margin * 2).attr("height", that.chartHeight - that.margin * 2).style("fill", "#a83f3f")
      let timeLineScaleLinearAxisBottom = d3
        .scaleLinear()
        .range([0, that.chartWidth - that.margin * 2])
        .domain(d3.extent(that.frameExtent)); // 线性比例尺
      let timeLineScaleLinearAxisLeft = d3
        .scaleLinear()
        .range([0, that.chartHeight - that.margin * 2])
        .domain([that.maxValue, 0]); // 用于绘制体积柱状图的比例尺
      let timeLineScaleLinearAxisRight = d3
        .scaleLinear()
        .range([0, that.chartHeight - that.margin * 2])
        .domain([that.maxDis, 0]); // 用于绘制最大距离柱状图的比例尺
      let timeLineAxisBottom = d3
        .axisBottom(timeLineScaleLinearAxisBottom)
        .tickValues(d3.extent(that.frameExtent))
        .tickSize(that.margin / 2); // 刻度点
      let timeLineAxisLeft = d3
        .axisLeft(timeLineScaleLinearAxisLeft)
        .tickSize(2); // 刻度点
      let timeLineAxisRight = d3
        .axisRight(timeLineScaleLinearAxisRight)
        .tickSize(2); // 刻度点
      // let timeLineAxisColorScale = d3.scaleSequential(d3.interpolateRainbow).domain([0, that.clusterBar]) // 填充颜色

      // 坐标轴位置
      that.chart
        .selectAll("g.axisBottom")
        .data([1])
        .join("g")
        .attr(
          "transform",
          `translate(${[5, that.chartHeight - that.margin * 2]})`
        )
        .attr("class", "axisBottom")
        .call(timeLineAxisBottom);
      that.chart
        .selectAll("g.axisLeft")
        .data([1])
        .join("g")
        .attr("class", "axisLeft")
        .call(timeLineAxisLeft)
        .attr("transform", `translate(${[5, 0]})`);
      // that.chart.selectAll("g.axisRight").data([1]).join("g").attr("transform", `translate(${[that.chartWidth - that.margin * 1.8, 0]})`).attr("class", "axisRight").call(timeLineAxisRight);

      // 边框
      that.chart
        .selectAll("g.timeLine_chart_border")
        .data([1])
        .join("g")
        .attr(
          "transform",
          `translate(${[5, that.chartHeight - that.margin * 2]})`
        )
        .attr("class", "timeLine_chart_border")
        .selectAll("rect")
        .data([1])
        .join("rect")
        .attr("id", "timeLine_chart_border")
        .attr("rx", that.margin / 2)
        .attr("width", that.chartWidth - that.margin * 2) // 滑动条宽度
        .attr("height", that.margin) // 滑动条高度
        .style("stroke-width", 1)
        .style("stroke", "black")
        .attr("fill", "none");
      let rectBarChart = that.chart
        .selectAll("g.rectBar")
        .data([1])
        .join("g")
        .attr("transform", `translate(${[0, 0]})`)
        .attr("class", "rectBar");
      // 绘制柱状图
      that.chart
        .selectAll("rect.bar")
        .data(that.barData)
        .join("rect")
        .attr(
          "class",
          (d) =>
            "bar " +
            "cluster" +
            that.bar.barClass +
            " cluster_" +
            d["j"] +
            that.bar.barClass
        )
        .attr("id", (d) => {
          return "bar_" + d["frame_pocket"];
        })
        .attr(
          "x",
          (d) =>
            d["i"] * that.barWidth +
            (that.barWidth / that.clusterBar) * d["j"] +
            5
        )
        .attr(
          "y",
          (d) =>
            that.chartHeight -
            timeLineScaleLinearAxisLeft(that.maxValue - d["volume"]) -
            that.margin * 2
        )
        .attr("width", that.barWidth / that.clusterBar) // 宽度为
        .attr("height", (d) =>
          timeLineScaleLinearAxisLeft(that.maxValue - d["volume"])
        )
        .style("fill", (d) => that.barColors[d["j"]])
        .style("opacity", 0.5)
        .on("click", that.barClick)
        .on("mouseenter", "")
        .on("mouseleave", "");

      // 绘制最大距离的折线图
      /*       let lineGen = d3.line()
              .x(function (d) {
                return (d["i"] * that.barWidth + that.barWidth / that.clusterBar * d["j"])
              })
              .y(function (d) {
                return that.chartHeight - timeLineScaleLinearAxisRight(that.maxDis - d["alphaspmaxdist"]) - that.margin * 2
              });
            let pathData = lineGen(that.barData);
            that.chart.selectAll("path.line_y").data(that.barData).join("path").attr("class", d => "line_y " + "line" + that.bar.barClass + " line_" + d["j"] + that.bar.barClass)
              // .attr("x", d => (d["i"] * that.barWidth + that.barWidth / that.clusterBar * d["j"]))
              // .attr("y", d => that.chartHeight - timeLineScaleLinearAxisLeft(that.maxDis - d["alphaspmaxdist"]) - that.margin * 2)
              .attr("d", pathData)
              .style("fill", "none")
              .style("stroke", d => that.barColors[d["j"]])
              .style("opacity", 1)
              .style("stroke-width", 2) */

      // 绘制图例
      that.legend = that.chart
        .selectAll("g." + "cluster" + that.bar.barClass)
        .data(that.frame)
        .join("g")
        .attr("class", (d, i) => {
          return (
            "cluster" + that.bar.barClass + " cluster_" + i + that.bar.barClass
          );
        })
        .attr("transform", `translate(${[that.margin, that.margin]})`)
        .on("mouseenter", (d, i) => that.mouseEnterLegend(i))
        .on("mouseleave", that.mouseLeaveLegend)
        .each(function (d, i) {
          d3.select(this)
            .selectAll("rect")
            .data([1])
            .join("rect")
            .attr("x", i * 90)
            .attr("y", -8)
            .attr("height", 8)
            .attr("width", 20)
            .style("fill", that.barColors[i])
            .style("opacity", 0.5);
          d3.select(this)
            .selectAll("text")
            .data([1])
            .join("text")
            .attr("x", 22 + i * 90)
            .text("cluster_" + i)
            .style("font-size", 14);
        });

      // 添加叉号 关闭按钮
      that.chart
        .append("path")
        .attr("d", that.cross)
        .attr("stroke", "gray")
        .attr("stroke-width", 2)
        .attr("fill", "none")
        .attr("transform", `translate(${[that.width - 62, that.margin - 10]})`)
        .on("click", function () {
          console.log("移除柱状图");
          d3.select(this.parentNode.parentNode.parentNode).remove();
        });

      // 定义缩放zoom行为对象
      that.zoomBehavior = d3
        .zoom()
        .scaleExtent([1, 8]) // 设置缩放范围
        .on("zoom", function () {
          // 获取当前 Zoom 变换的状态
          var transform = d3.event.transform;

          // 应用变换到所有子元素上
          d3.select("." + that.barClass).attr("transform", transform);
        });
      // 添加放大镜 放大柱状图
      /* let histogram = d3.select("." + that.barClass)
      let cloneHis = null
      that.zoom = that.chart.append("g")
        .attr("transform", `translate(${[that.width - 85, that.margin - 12]})`)
        .append('svg')
        .attr("width", 20).attr('height', 20)
        .attr("viewBox", "0 0 1024 1024")
        .attr("pointer-events", "all")
        .append("path")
        .attr("d", that.zoomStr)
        .on("click", function () {
          if (cloneHis === null) {
            cloneHis = histogram.clone(true)
            console.log('柱状图', histogram.node());
            // let parent = d3.select(this.parentNode.parentNode);
            // console.log(parent);
            // 将克隆的 div 元素添加到 main 子元素中
            d3.select(".main").append(() => cloneHis.node());

            // 将 div 副本移动到居中位置
            cloneHis.style("position", "fixed")
              .style("z-index", 2)
              .style("left", "456px")
              .style("top", "378px")
              .style("transform", "scale(1.8)")
              .style("background", "rgba(227, 236, 250,0.9)")
              .on("dblclick", function () {
                console.log('点击的对象是', this);
                d3.select(this).remove();
                cloneHis = null
              })


            // histogram.transition().duration(500)
            //   .attr("style", "transform:translate(-100px,-100px) scale(2)")
          }

        }); */

      let timeLine_dragBehavior = d3
        .drag()
        .on("drag", function () {
          let dx = +d3.event.dx; // 移动坐标
          let x = +d3.select(this).attr("x"); // 当前选中节点
          let border = +d3.select("#timeLine_chart_border").attr("width");
          if (
            x >= 0 &&
            x + that.margin <= border &&
            x + dx >= 0 &&
            x + dx + that.margin <= border
          ) {
            d3.select(this).attr("x", x + dx);
          }
          // 更新标签数据
          let text = d3.select("#" + that.barClass + "_text"); // 标签数据
          let frame_num =
            Math.ceil(
              timeLineScaleLinearAxisBottom.invert(x + that.margin / 2)
            ) - 2; // 映射的键值
          if (that.frameMap[frame_num]) {
            that.framePocketStr =
              frame_num + "," + that.frameMap[frame_num].join("-");
            text.text("The current frame is: " + frame_num);
          }
        })
        .on("end", function () {
          // 滑动结束事件
          that.$emit("barSlider", that.framePocketStr);
          that.highlightScatter(
            that.framePocketStr.split(",")[1].replaceAll("-", ",")
          );
        });
      // 绘制滑块
      that.chart
        .selectAll("rect.timeLine_slider")
        .data([1])
        .join("rect")
        .attr("class", "timeLine_slider")
        .attr("x", 0)
        .attr("y", that.margin)
        .attr("rx", 5)
        .attr("width", that.margin)
        .attr("height", that.margin)
        .attr(
          "transform",
          `translate(${[0, that.chartHeight - that.margin * 3]})`
        )
        .style("stoke", "black")
        .style("stroke-width", 1)
        .attr("fill", "black")
        .call(timeLine_dragBehavior);
    },
    mouseEnterLegend(index) {
      d3.selectAll(".cluster" + this.bar.barClass).style("opacity", 0.1);
      d3.selectAll(".cluster_" + index + this.bar.barClass).style(
        "opacity",
        0.5
      );
    },
    mouseLeaveLegend() {
      d3.selectAll(".cluster" + this.bar.barClass).style("opacity", 0.5);
    },

    timeLineDrop(event) {
      let that = this;
      that.frame.push(
        event.dataTransfer.getData("framePocket").trim().split(",")
      ); // 放入多维数据
      that.barColors.push(event.dataTransfer.getData("color"));
      d3.select("#" + that.barClass + "_text").text("The current frame is: 1");
      // console.log("that.barColors ", that.barColors)
      // 请求数据
      that.initRequire();
    },
    barClick(node) {
      this.$emit("barClick", node);
    },
  },
};
</script>

<style scoped>
/* svg {
  pointer-events: all;
} */
</style>
