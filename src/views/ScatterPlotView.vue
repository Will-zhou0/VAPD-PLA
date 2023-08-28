<template>
  <div class="com-page">
    <div class="center_center">
      <div class="input-group">
        <div class="input-group-prepend">
          <span class="input-group-text">Similarity Min:</span>
        </div>
        <input
          style="width: 60px"
          type="number"
          step="0.01"
          min="0"
          max="1"
          :value="similarMin"
          @change="inputChangeSimilarMin"
          @blur="inputChangeSimilarMin"
        />
        <span class="input-group-text">Max:</span>
        <input
          style="width: 60px"
          type="number"
          step="0.01"
          min="0"
          max="1"
          :value="similarMax"
          @change="inputChangeSimilarMax"
          @blur="inputChangeSimilarMax"
        />
        <div class="input-group-prepend">
          <span class="input-group-text"
            >The number of pockets: {{ pocketsNum }}</span
          >
        </div>
      </div>
      <div
        class="sub_center_center"
        draggable="true"
        @dragstart="scatterSubDragStart"
      ></div>
    </div>
  </div>
</template>

<script>
import { request } from "@/network/request";
import { mapState } from "vuex";

const { mapMutations } = require("vuex");

export default {
  name: "ScatterPlotView",
  data() {
    return {
      margin: 10,
      width: 730,
      height: 450,
      scatterChart: null,
      scatterView: null,
      scatterScaleX: null,
      scatterScaleY: null,
      scatterColorScale: null,
      scatterCircles: null, // 选中的点
      scatterCtrlKeyDown: false,
      scatterShift: false,
      scaleExtent: [1, 20],
      // k: 1,  // 默认缩放比例

      scatterSvg: null,
      // scatterPlotFramePocketData: null, // 接收到的数据
      maxData: { maxX: 0, maxY: 0 },
      scatterLasso: null,
      scatterZoom: null,
      pocketsNum: 0,
      subScatterWidth: 0,
      subScatterHeight: 0,
      enterTimeCount: null,
      color: null,
    };
  },
  mounted() {
    this.initRequire();
  },
  computed: {
    ...mapState([
      "zoomFactor",
      "radius",
      "similarMin",
      "similarMax",
      "scatterPlotFramePocketData",
      "inOrOutDegree",
    ]), // 默认缩放比例
  },
  methods: {
    ...mapMutations([
      "changZoomFactor",
      "initScatterPlotFramePocketData",
      "changeSimilarMin",
      "changeSimilarMax",
      "changeInOrOutDegree",
    ]),
    async initRequire() {
      let that = this;
      await request({
        url: "/forcePlot/index",
        method: "POST",
        data: {},
      })
        .then((res) => {
          if (res.status === 200) {
            // that.scatterPlotFramePocketData = res.data
            that.initScatterPlotFramePocketData(res.data); // 初始化数据
            that.maxData["maxX"] = res.data["maxX"];
            that.maxData["maxY"] = res.data["maxY"];
            that.initData();
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },

    initData() {
      let that = this;

      that.scatterSvg = d3
        .select(".center_center")
        .append("svg")
        .attr("width", that.width - 2 * that.margin)
        .attr("height", that.height - 2 * that.margin)
        .attr("transform", `translate(${[that.margin, that.margin]})`);
      that.scatterSvg
        .append("defs")
        .append("clipPath")
        .attr("id", "scatterChart")
        .append("rect")
        .attr("width", that.width - that.margin * 2)
        .attr("height", that.height - that.margin * 2);
      that.scatterChart = that.scatterSvg
        .append("g")
        .attr("transform", `translate(${[that.margin * 2, 0]})`);
      that.scatterView = that.scatterChart
        .append("g")
        .attr("class", "scatterView")
        .attr("clip-path", "url(#scatterChart)")
        .append("g");

      that.scatterScaleX = d3
        .scaleLinear()
        .range([0, that.width - 2 * that.margin]);
      that.scatterScaleY = d3
        .scaleLinear()
        .range([0, that.height - 2 * that.margin]); // 刻度尺
      that.scatterColorScale = d3.scaleOrdinal(d3.schemeCategory10);
      that.scatterCtrlKeyDown = false; // 设置热键，zoom和lasso切换
      that.scatterShift = false; // 切换是否显示子图，圈选之后进行展示
      // that.k = 1;                           // 默认缩放比例
      that.scatterScaleX.domain([-that.maxData["maxX"], that.maxData["maxX"]]);
      that.scatterScaleY.domain([-that.maxData["maxY"], that.maxData["maxY"]]);

      /* 子图配置 */
      that.subScatterWidth = that.width / 5;
      that.subScatterHeight = that.height / 5;

      d3.select(".sub_center_center").style("display", "none");
      this.drawChart();
    },
    drawChart() {
      let that = this;
      that.scatterCircles = that.scatterView
        .selectAll(".scatterDot")
        .data(that.scatterPlotFramePocketData["forceData"])
        .join("circle")
        .attr("id", (d) => d["frame_pocket"])
        .attr("class", (d) => {
          return (
            "scatterDot " +
            " c_" +
            d["frame_pocket"] +
            " c_" +
            d["frame_pocket"] +
            "color"
          );
        })
        .attr("r", that.radius / that.zoomFactor)
        .attr("cx", (d) => that.scatterScaleX(d["x"]))
        .attr("cy", (d) => that.scatterScaleY(d["y"]))
        .style("fill", (d) => d["color"])
        .on("click", that.scatterClick) // 点击显示三维结构
        .on("mouseenter", that.scatterMouseEnter) // 鼠标移入
        .on("mouseout", that.scatterMouseOut);

      d3.select("body")
        .on("keydown", function () {
          if (d3.event.keyCode === 17) {
            // ctrl
            that.scatterCtrlKeyDown = !that.scatterCtrlKeyDown;
          }

          if (d3.event.keyCode === 16) {
            // shift
            that.scatterShift = !that.scatterShift;
            d3.select(".sub_center_center").style(
              "display",
              that.scatterShift ? "" : "none"
            );
          }
        })
        .on("mousemove", function () {
          if (that.scatterCtrlKeyDown) {
            // 真 进行lasso操作
            that.scatterLassoConfig(that.scatterCircles, true);
            that.scatterZoomConfig(false);
          } else {
            that.scatterZoomConfig(true);
            that.scatterLassoConfig(that.scatterCircles, false);
          }
        });
    },
    scatterLassoConfig(circles, lassoStatus) {
      let that = this;
      let scatterStartTime; // 开始时间
      let scatterEndTime; // 结束时间
      let scatterSelectedCircle = []; // 选中的点
      // .items()用于指定可选择的DOM元素集合。
      that.scatterLasso = d3
        .lasso()
        .closePathSelect(true)
        .closePathDistance(100)
        .items(circles)
        .targetArea(that.scatterSvg);

      function lassoStart() {
        // 圈选前先进行初始化
        scatterStartTime = new Date().getTime();
        if (lassoStatus) {
          that.scatterLasso
            .items()
            .attr("r", that.radius / that.zoomFactor)
            .classed("not_possible", true)
            .style("fill", null)
            .classed("selected", true);
        }
        // 清空名为 ".scatterView" 的元素中的所有线段元素。
        d3.select(".scatterView").selectAll("line").data([]).join("line");
      }

      function lasso_draw() {
        that.scatterLasso
          .possibleItems()
          .classed("not_possible", false)
          .classed("possible", false);
        that.scatterLasso
          .notPossibleItems()
          .classed("not_possible", true)
          .classed("possible", false);
      }

      function lasso_end() {
        that.scatterLasso
          .items()
          .style("fill", (d) => d["color"])
          .classed("not_possible", false)
          .classed("possible", false);
        // selected points
        let pockets = [];
        that.scatterLasso
          .selectedItems()
          .classed("selected", true)
          .attr("r", (d) => {
            pockets.push(d);
            scatterSelectedCircle.push(d);
            return (that.radius * 2) / that.zoomFactor;
          })
          .style("opacity", 1);
        that.pocketsNum = pockets.length; // 选中口袋的数量
        scatterEndTime = new Date().getTime();
        // reset the style of the not selected points
        that.scatterLasso
          .notSelectedItems()
          .attr("r", that.radius / that.zoomFactor)
          .style("opacity", 0.5);
        // 表示没有选中
        if (that.scatterLasso.selectedItems()._groups[0].length === 0) {
          that.scatterLasso.notSelectedItems().style("opacity", 1);
        }
        // 添加时间限制，防止误点
        if (scatterEndTime - scatterStartTime > 500) {
          that.subScatterInit(scatterSelectedCircle);
        }
      }

      if (lassoStatus) {
        that.scatterSvg.call(
          that.scatterLasso
            .on("start", lassoStart)
            .on("draw", lasso_draw)
            .on("end", lasso_end)
        );
      } else {
        that.scatterSvg.call(
          that.scatterLasso.on("start", null).on("draw", null).on("end", null)
        );
      }
    },
    scatterZoomConfig(zoomStatus) {
      let that = this;
      let currentZoom = d3.zoomIdentity;
      const extent = [
        [0, 0],
        [that.width, that.height],
      ];

      function zooming() {
        currentZoom = d3.event.transform;
        that.changZoomFactor(currentZoom.k);
        that.scatterView.attr("transform", currentZoom);
        // 散点
        d3.selectAll("circle.scatterDot")
          .attr("r", that.radius / that.zoomFactor)
          .style("opacity", 1);
        // 连线
        d3.select(".scatterView")
          .selectAll("line")
          .attr("stroke-width", 1 / that.zoomFactor);
      }

      function zoomEnd() {
        if (d3.event.transform.k <= 1 + 1e-6) {
          d3.select("#zoom-reset").style("opacity", 0);
        } else {
          d3.select("#zoom-reset").style("opacity", 1);
        }
      }

      that.scatterZoom = d3
        .zoom()
        .scaleExtent(that.scaleExtent)
        .extent(extent)
        .translateExtent(extent);
      if (zoomStatus) {
        that.scatterSvg.call(
          that.scatterZoom.on("zoom", zooming).on("end", zoomEnd)
        );
      } else {
        that.scatterSvg.call(that.scatterZoom.on("zoom", null).on("end", null));
      }
    },

    // 右上角子图
    subScatterInit(frame_pockets) {
      let that = this;
      let forcePlotSub_div = d3.select(".sub_center_center");
      let colorMap = new Map();
      // 展示子图数据
      let forcePlotSub_svg = forcePlotSub_div
        .selectAll("svg.forcePlotSubSvg")
        .data([1])
        .join("svg")
        .attr("class", "forcePlotSubSvg")
        .attr("width", that.subScatterWidth)
        .attr("height", that.subScatterHeight);
      let forcePlotSub_scaleX = d3
        .scaleLinear()
        .range([0, that.subScatterWidth])
        .domain([-that.maxData["maxX"], that.maxData["maxX"]]);
      let forcePlotSub_scaleY = d3
        .scaleLinear()
        .range([0, that.subScatterHeight])
        .domain([-that.maxData["maxY"], that.maxData["maxY"]]); // 刻度尺
      let pockets = [];
      forcePlotSub_svg
        .selectAll("circle.subCircle")
        .data(frame_pockets)
        .join("circle")
        .attr("class", "subCircle")
        .attr("r", (d) => {
          pockets.push(d["frame_pocket"]);
          if (!colorMap.has(d["color"])) {
            colorMap.set(d["color"], 0);
          }
          colorMap.set(d["color"], parseInt(colorMap.get(d["color"]) + 1));
          return 1; // 圆的半径
        })
        .attr("cx", (d) => forcePlotSub_scaleX(d["x"]))
        .attr("cy", (d) => forcePlotSub_scaleY(d["y"]));
      // 添加属性值
      d3.select(".sub_center_center").attr("frame_pocket", pockets.join(","));

      // 设置颜色
      let map = { color: "", count: 0 };
      for (const [key, value] of colorMap.entries()) {
        if (value > map["count"]) {
          map["color"] = key;
          map["count"] = value;
        }
      }
      that.color = map["color"];
    },

    scatterMouseEnter(node) {
      // console.log("scatterMouseEnter  ", node, node.x, node.y)
      let that = this;

      that.scatterView
        .selectAll("text.scatterToopTips")
        .data([1])
        .join("text")
        .attr("class", "scatterToopTips")
        .attr("x", that.scatterScaleX(node.x))
        .attr("y", that.scatterScaleY(node.y))
        .style("font-size", 20 / that.zoomFactor)
        .text(node["frame_pocket"]);
      that.scatterView
        .select(".c_" + node["frame_pocket"])
        .attr("r", (that.radius * 2) / that.zoomFactor);
      that.scatterView
        .selectAll(".l_" + node["frame_pocket"])
        .attr("stroke-width", 3 / that.zoomFactor);
    },
    scatterMouseOut(node) {
      let that = this;
      that.scatterView.selectAll(".scatterToopTips").data([]).join("text");
      that.scatterView
        .select(".c_" + node["frame_pocket"])
        .attr("r", that.radius / that.zoomFactor);
      that.scatterView
        .selectAll(".l_" + node["frame_pocket"])
        .attr("stroke-width", 1 / that.zoomFactor);
    },
    scatterSubDragStart(event) {
      let that = this;
      // console.log(d3.selectAll(".forcePlotSubSvg circle"));
      // 设置传输的数据
      // console.log(d3.select(".sub_center_center"));
      event.dataTransfer.setData("color", that.color); // 颜色
      event.dataTransfer.setData("identify", "scatter");
      event.dataTransfer.setData(
        "framePocket",
        d3.select(".sub_center_center").attr("frame_pocket")
      );
      // 拖拽数据存储在event.dataTransfer对象的type中，但是在控制台打印为空
      // dataTransfer对象是一个只读的对象，而getData()方法只能用于在drop或dragover事件处理程序中调用，否则将返回empty string。
      // console.log(event.dataTransfer);
    },
    // 高亮某个点 没用到？？
    parallelToScatterHighlight(node) {
      let that = this;
      d3.selectAll("circle.scatterDot")
        .style("opacity", 0.3)
        .attr("r", that.radius / that.zoomFactor);
      d3.select($("#" + node)[0])
        .attr("r", (that.radius * 2) / that.zoomFactor)
        .style("opacity", "1");
    },

    // 触发自定义事件
    scatterClick(node) {
      // 显示三维结构
      this.$emit("scatterShowMol", node);
      this.$emit("scatterShowRadar", node);
    },
    // 连线
    // 什么时候调用？？ 通过refs
    async circleLinkLine(nodes) {
      let that = this;
      await request({
        url: "/forcePlot/linkLine", //
        method: "POST", //
        data: {
          frame_pocket: nodes, //
          similarMin: that.similarMin, // that.state.similar
          similarMax: that.similarMax, // that.state.similar
        },
      })
        .then((res) => {
          // 请求成功
          if (res.status === 200) {
            // 后端处理得到的 度data["degree"] 信息没用到
            // data["link"] 是包含 [source,target] 的二维数组
            that.drawLinkLine(res.data["link"]);
          }
        })
        .catch((err) => {
          console.log(err);
        });
    },
    // 使用了jQuery选择器$("#" + d[0])选中了ID为d[0]的圆的DOM元素，
    // 并使用.attr()方法读取其cx和cy属性的值，分别作为线段起点的x和y坐标。
    drawLinkLine(node) {
      let that = this;
      let chartView = d3.select(".scatterView");
      chartView
        .select("g")
        .selectAll("line")
        .data(node)
        .join("line")
        .attr("x1", (d) => $("#" + d[0]).attr("cx"))
        .attr("y1", (d) => $("#" + d[0]).attr("cy"))
        .attr("x2", (d) => $("#" + d[1]).attr("cx"))
        .attr("y2", (d) => $("#" + d[1]).attr("cy"))
        .attr("class", (d) => "l_" + d[0] + " l_" + d[1])
        .attr("stroke-width", 1 / that.zoomFactor)
        .style("stroke", "black")
        .style("opacity", 0.3);
    },
    inputChangeSimilarMin(v) {
      // 相似度更改之后 调用vuex mutations中的changeSimilar() 改变state中的相似度
      // 在调用异步函数 async circleLinkLine进行渲染页面的时候 只过滤出了相似度>设定值的 data["link"]
      // 异步函数什么时候调用的？ similar改变之后就调用了？
      if (v.target.value >= 1) {
        v.target.value = 1;
        this.changeSimilarMin(1);
      } else if (v.target.value <= 0) {
        v.target.value = 0;
        this.changeSimilarMin(0);
      } else {
        console.log(v);
        this.changeSimilarMin(v.target.value);
      }
    },
    inputChangeSimilarMax(v) {
      if (v.target.value >= 1) {
        v.target.value = 1.0;
        this.changeSimilarMax(1.0);
      } else if (v.target.value <= 0) {
        v.target.value = 0;
        this.changeSimilarMax(0);
      } else {
        console.log(v);
        this.changeSimilarMax(v.target.value);
      }
    },
    //
    inputChangeInOrOutDegree(v) {
      this.changeInOrOutDegree(v.target.value);
    },
  },
};
</script>
<style lang="less">
/* 中间力导向图 */
.center_center {
  position: relative;
  width: 100%;
  height: 100%;
  //background: lightblue;
  //border: 1px solid red;
  // margin-left: 20px;
  // float: left;
}

circle {
  fill-opacity: 0.5;
}

.lasso path {
  stroke: rgb(80, 80, 80);
  stroke-width: 2px;
}

.lasso .drawn {
  fill-opacity: 0.05;
}

.lasso .loop_close {
  fill: none;
  stroke-dasharray: 4, 4;
}

.lasso .origin {
  fill: #3399ff;
  fill-opacity: 0.5;
}

.not_possible {
  fill: rgb(200, 200, 200);
}

.possible {
  fill: #ec888c;
}

.selected {
  fill: steelblue;
}

.sub_center_center {
  z-index: 1;
  border: 1px solid black;
  position: absolute;
  top: -3px;
  right: -3px;
  width: 174px;
  height: 100px;
  // margin-top: 10px;
  // margin-right: 12px;
  //background-color: white;
  opacity: 1;
}

.input_center_center {
  z-index: 1;
  position: absolute;
  left: -7px;
  top: 12px;
}
</style>
