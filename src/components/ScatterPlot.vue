<template>
  <div id="scatter_plot" class="com-chart" ref="scatter_plot_ref">
    <div id="sub_scatter_plot" draggable="true" @dragstart="forcePlotSub_dragstart($event)"></div>
  </div>
</template>

<script>
import {request} from "@/network/request";

export default {
  name: "ScatterPlot",
  data() {
    return {
      margin: 10,
      width: 870,
      height: 500,
      radius: 3,
      scatterScaleX: null,
      scatterScaleY: null,
      k: 0.5, // 默认缩放比例
      svg: null,
      chart: null,
      view: null,
      maxData: {"maxX": 0, "maxY": 0},
      scatterPlotShift: false,
      scatterPlotCtrl: false,
      scatterPlotZoom: null,
      scatterPlotFramePocketData: null,
      circlesChart: null,
      scatterCircles: null,
      /*子图配置*/
      subWidth: 0,
      subHeight: 0
    }
  },
  mounted() {
    this.initRequire();
  },
  methods: {
    async initRequire() {
      await request({
        url: "/forcePlot/index",
        method: "POST",
        data: {}
      }).then(res => {
        if (res.status === 200) {
          this.scatterPlotFramePocketData = res.data
          this.maxData["maxX"] = res.data["maxX"]
          this.maxData["maxY"] = res.data["maxY"]
          this.initCharts()
        }
      }).catch(err => {
        console.log(err)
      })
    },
    // 初始化数据
    initCharts() {
      let that = this;
      that.margin = 10;
      that.width = 870;
      that.height = 500;
      that.radius = 3;
      // console.log([-that.maxData["maxX"], that.maxData["maxX"]], [-that.maxData["maxY"], that.maxData["maxY"]])
      that.scatterScaleX = d3.scaleLinear().range([0, that.width - 2 * that.margin]).domain([-that.maxData["maxX"], that.maxData["maxX"]]);
      that.scatterScaleY = d3.scaleLinear().range([0, that.height - 2 * that.margin]).domain([-that.maxData["maxY"], that.maxData["maxY"]]);
      that.svg = d3.select("#scatter_plot").append("svg").attr("width", that.width - 2 * that.margin).attr("height", that.height - 2 * that.margin).attr("transform", `translate(${[that.margin, that.margin]})`);
      that.svg.append("defs").append("clipPath").attr("id", "scatterChart").append("rect").attr("width", that.width - that.margin * 2).attr("height", that.height - that.margin * 2)
      that.chart = that.svg.append("g").attr("transform", `translate(${[0, 0]})`)
      that.view = that.chart.append("g").attr("class", "scatterView").attr("clip-path", "url(#scatterChart)");

      /*配置子图*/
      that.subHeight = that.height / 5;
      that.subWidth = that.width / 5;
      // d3.select("#sub_scatter_plot").style("display", "none")

      that.drawChart(); // 绘制图形
    },
    // 绘制图形
    drawChart() {
      let that = this;
      that.scatterCircles = that.view.selectAll(".forceDot")
          .data(that.scatterPlotFramePocketData["forceData"])
          .join("circle")
          .attr("id", d => d["frame_pocket"])
          .attr("class", "forceDot")
          .attr("r", that.radius / that.k)
          .attr("cx", d => that.scatterScaleX(d["x"]))
          .attr("cy", d => that.scatterScaleY(d["y"]))
          .attr("fill", "RGB(148,201,247)")


      d3.select("body").on("keydown", () => {
        if (d3.event.keyCode === 17) {
          console.log("17")
        }
      }).on("mousemove", () => {
        console.log("mousemove")
      })


      scatterPlotLassoConfig(that.scatterCircles, true);

      function scatterPlotLassoConfig(circles, lassoStatus) {
        // Lasso functions
        let lasso_start = function () {
          lasso.items()
              .attr("r", 3.5) // reset size
              .classed("not_possible", true)
              .classed("selected", false);
        };

        let lasso_draw = function () {

          // Style the possible dots
          lasso.possibleItems()
              .classed("not_possible", false)
              .classed("possible", true);

          // Style the not possible dot
          lasso.notPossibleItems()
              .classed("not_possible", true)
              .classed("possible", false);
        };

        let lasso_end = function () {
          // Reset the color of all dots
          lasso.items()
              .classed("not_possible", false)
              .classed("possible", false);

          // Style the selected dots
          lasso.selectedItems()
              .classed("selected", true)
              .attr("r", 7);

          // Reset the style of the not selected dots
          lasso.notSelectedItems()
              .attr("r", 3.5);
        };

        let lasso = d3.lasso()
            .closePathSelect(true)
            .closePathDistance(100)
            .items(circles)
            .targetArea(that.svg)
            .on("start", lasso_start)
            .on("draw", lasso_draw)
            .on("end", lasso_end);
        that.svg.call(lasso);
      }


      // d3.select("body").on("keydown", function () {
      //   if (d3.event.keyCode === 17) {  // ctrl
      //     that.scatterPlotCtrl = !that.scatterPlotCtrl;
      //   }
      //
      //   if (d3.event.keyCode === 16) {  // shift
      //     that.scatterPlotShift = !that.scatterPlotShift;
      //     d3.select("#sub_scatter_plot").style("display", that.scatterPlotShift ? "" : "none")
      //   }
      // }).on("mousemove", function () {
      //   console.log("mouseover")
      //   // that.scatterPlot_LassoConfig(that.scatterCircles,true);
      //   if (that.scatterPlotCtrl) {  // lasso
      //     scatterPlot_LassoConfig(that.scatterCircles, true);
      //     scatterPlot_zoomConfig(false);
      //   } else {  // zoom
      //     scatterPlot_zoomConfig(true);
      //     scatterPlot_LassoConfig(that.scatterCircles, false);
      //   }
      // })
      // function scatterPlot_LassoConfig(circles, lassoStatus) {
      //   let start_time, end_time, selected_circle = [];
      //   let lasso_start = function () {
      //     // 圈选前
      //     start_time = new Date().getTime();
      //     if (lassoStatus) {
      //       scatterPlot_lasso.items().attr("r", that.radius / that.k).classed("not_possible", true).style("fill", null).classed("selected", true)
      //     }
      //   }
      //   let lasso_draw = function () {
      //     scatterPlot_lasso.possibleItems().classed("not_possible", false).classed("possible", false);
      //     scatterPlot_lasso.notPossibleItems().classed("not_possible", true).classed("possible", false)
      //   }
      //
      //   let lasso_end = function () {
      //     scatterPlot_lasso.items().style("fill", "RGB(148,201,247)").classed("not_possible", false).classed("possible", false)
      //     scatterPlot_lasso.selectedItems().classed("selected", true).attr("r", d => {
      //       selected_circle.push(d)
      //       return that.radius * 2 / that.k;
      //     })
      //
      //     end_time = new Date().getTime();
      //
      //     scatterPlot_lasso.notSelectedItems().attr("r", that.radius / that.k);
      //
      //     // 添加时间防止误点
      //     if (end_time - start_time > 1000) {
      //       scatterPlotSub_init(selected_circle)
      //     }
      //   }
      //
      //   let scatterPlot_lasso = d3.lasso().closePathSelect(true).closePathDistance(100).items(circles).targetArea(that.svg).on("start", lasso_start).on("draw", lasso_draw).on("end", lasso_end);
      //   // console.log(circles);
      //   if (lassoStatus) {
      //     that.svg.call(scatterPlot_lasso.on("start", lasso_start).on("draw", lasso_draw).on("end", lasso_end))
      //   } else {
      //     that.svg.call(scatterPlot_lasso.on("start", null).on("draw", null).on("end", null))
      //   }
      // }
      //
      // function scatterPlot_zoomConfig(zoomStatus) {
      //   console.log("forcePlot_zoomConfig ", zoomStatus)
      // }
      //
      // function scatterPlotSub_init(frame_pockets) {
      //   // 添加子图
      //   console.log("显示子图")
      // }
    },
  },
}
</script>

<style scoped>
svg {
  border: 1px solid black;
}

circle {
  fill-opacity: 0.5;
}

.lasso path {
  stroke: rgb(80, 80, 80);
  stroke-width: 2px;
}

.lasso .drawn {
  fill-opacity: .05;
}

.lasso .loop_close {
  fill: none;
  stroke-dasharray: 4, 4;
}

.lasso .origin {
  fill: #3399FF;
  fill-opacity: .5;
}

.not_possible {
  fill: rgb(200, 200, 200);
}

.possible {
  fill: #EC888C;
}

.selected {
  fill: steelblue;
}
</style>
