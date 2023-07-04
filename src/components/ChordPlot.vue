<template>
  <div :class="chordPlotClass" ref="chordPlotRef">
  </div>
</template>

<script>
export default {
  name: "ChordPlot",
  props: {
    // 区别不同的chord
    chordID: {type: String, default: "1"}
  },
  data() {
    return {
      chordPlotClass: "chordPlot_" + this.chordID,
      width: 210,
      height: 200,
      padding: 1,

    }
  },
  mounted() {

  },
  methods: {

    drawChart() {
      let chordPlot_width = 210;
      let chordPlot_height = 200;
      let chordPlot_padding = 1;  // 各部分间距
      let chordPlot_padAngle = 0.02;  // 环状图间距
      let chordPlot_circle_radius = 70;   // 弦图内圆半径
      let chordPlot_arc_radius = 15; // 环状图宽度
      let chordPlot_arc_innerRadius = chordPlot_circle_radius + chordPlot_padding;    // 环状图内环半径
      let chordPlot_arc_outerRadius = chordPlot_circle_radius + chordPlot_arc_radius; // 环状图外环半径
      let chordPlot = d3.select("#chordPlot1")
      let chordPlot_svg; // 弦图svg
      let chordPlot_chart; // 表格
      let chordPlot_frame_drop_data = [
        // ["76_4", "49_4", "47_5", "65_4", "2_5", "63_2", "15_8", "86_7", "7_9", "72_5", "22_5", "79_5", "11_4", "12_6", "82_5", "85_6", "28_6", "39_6", "18_6", "66_5",],
        // ["83_6", "95_8", "52_13", "89_5", "8_8", "4_4", "92_6", "40_9", "7_12", "16_6", "94_6", "91_12", "85_8", "53_10", "24_10", "5_10", "42_8", "84_9", "47_8", "64_10", "75_9", "10_7", "86_3", "71_7", "65_10", "34_10", "26_8", "15_9", "43_9", "93_8", "37_9", "46_8", "68_10", "88_9", "17_11", "33_13", "49_12",],
        // ["87_2", "93_4", "47_7", "54_9", "72_4", "65_6", "57_5", "6_5", "3_5", "98_8", "24_5", "69_2", "8_5", "90_8", "66_10", "29_7", "43_7", "71_3", "37_7", "91_4", "28_5", "61_4", "88_5", "4_5", "26_4", "59_4", "30_7",],
        // ["41_4", "29_5", "74_7", "94_3", "83_4", "65_5", "44_4", "31_10", "35_5", "82_6", "75_6", "1_8", "36_5", "23_4", "58_4", "88_7", "92_3", "4_7", "7_8", "56_7", "63_7", "25_11", "68_4", "70_4", "80_3", "27_4", "51_4", "22_4", "84_5", "47_4", "11_5", "32_6",],
        // ["73_6", "45_4", "99_6", "94_4", "32_8", "62_4", "84_2", "12_5", "63_5", "18_9", "44_10", "86_4", "22_8", "25_9", "21_9", "7_5", "52_5", "31_5", "27_5", "41_10", "10_8", "2_10", "78_5", "17_10", "70_6", "49_7", "38_11", "14_4", "40_3", "58_7", "97_8", "15_5", "68_5", "16_3", "1_3", "23_5", "13_4", "5_5",],
        // ["22_3", "21_2", "24_3", "39_7", "3_6", "19_12", "49_15", "99_2", "25_3", "66_14", "78_11", "12_12", "60_12", "23_10", "14_11", "30_12", "9_11", "34_14", "98_12", "88_11", "84_13", "74_12", "65_14", "89_13", "87_13", "53_12", "50_11", "72_12", "77_15", "48_13", "62_11", "97_10", "29_12", "45_13", "46_10", "92_15", "44_8", "54_12",]
      ]  // 传送待处理数据

      let frame_pocket_data; // 接收请求数据

      // 接收拖拽数据
      function chordPlot_initData() {
        // 获取拖动后的数据
        // event.preventDefault();
        // let dropData = event.dataTransfer.getData("frame_pocket");// 数据应为字符串用逗号隔开
        // chordPlot_frame_drop_data.push(dropData.split(","))

        if (chordPlot_frame_drop_data.length > 1) {
          $("#sub_chordPlot1").remove()
          // 数组中添加数据
          // 发送请求
          frame_pocket_data = ajaxPost("/chordPlot/index", {"frame_pocket": chordPlot_frame_drop_data, "padAngle": chordPlot_padAngle})
          chordPlot1_init();
          gradualColor1(frame_pocket_data["ribbons"])
        }
      }

      function chordPlot1_init() {
        chordPlot_svg = chordPlot.selectAll("svg.chord_svg").data([1]).join("svg").attr("width", chordPlot_width).attr("height", chordPlot_height).attr("class", "chord_svg");
        chordPlot_chart = chordPlot_svg.selectAll("g.chordPlot_chart").data([1]).join("g").attr("class", "chordPlot_chart").attr("transform", `translate(${[chordPlot_width / 2, chordPlot_height / 2 + 5]})`)

        let chord_arc = d3.arc().innerRadius(chordPlot_arc_innerRadius).outerRadius(chordPlot_arc_outerRadius);
        let chord_ribbon = d3.ribbon().radius(chordPlot_circle_radius);
        let chord_color = d3.scaleSequential(d3.interpolateRainbow).domain([0, chordPlot_frame_drop_data.length]);
        // 外部环状图
        chordPlot_chart.selectAll("path.arc")
            .data(frame_pocket_data["arcs"])
            .join("path")
            .attr("class", d => d["class"] === undefined ? "arc" : "arc " + d["class"])
            .attr("d", chord_arc)
            .style("fill", d => d["index"] === undefined ? d["color"] : chord_color(d["index"]))
            .on("mouseout", chord_mouseout)
            .on("mouseover", chord_arc_mouseenter)


        // 内部带状图
        chordPlot_chart.selectAll("path.ribbon")
            .data(frame_pocket_data["ribbons"])
            .join("path")
            .attr("class", d => "ribbon " + d["class"])
            .attr("frame_pocket", d => d["frame_pocket"])
            .attr("d", chord_ribbon)
            .style("opacity", .5)
            .style("fill", d => "url(#" + getGradID(d) + ")")
            .on("mouseover", chord_ribbon_mouseenter)
            .on("mouseout", chord_mouseout)
      }

      function getGradID(d) { // 带状图ID生成
        return "linkGrad-" + d["source"]["index"] + "-" + d["target"]["index"];
      }


      function gradualColor1(ribbons) { // 颜色渐变
        let color = d3.scaleSequential(d3.interpolateRainbow).domain([0, chordPlot_frame_drop_data.length])
        let defs = chordPlot_svg.selectAll("defs").data([1]).join("defs");
        let grads = defs
            .selectAll("linearGradient")
            .data(ribbons)
            .join("linearGradient")
            .attr("id", getGradID)
            .attr("gradientUnits", "userSpaceOnUse")
            .attr("x1", d => chordPlot_arc_innerRadius * Math.cos((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
            .attr("y1", d => chordPlot_arc_innerRadius * Math.sin((d.source.endAngle - d.source.startAngle) / 2 + d.source.startAngle - Math.PI / 2))
            .attr("x2", d => chordPlot_arc_innerRadius * Math.cos((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2))
            .attr("y2", d => chordPlot_arc_innerRadius * Math.sin((d.target.endAngle - d.target.startAngle) / 2 + d.target.startAngle - Math.PI / 2))
        // set the starting color (at 0%)
        grads.append("stop").attr("offset", "0%").attr("stop-color", d => color(d.source.index))
        //set the ending color (at 100%)
        grads.append("stop").attr("offset", "100%").attr("stop-color", d => color(d.target.index))
      }

      function chord_mouseout() {
        d3.selectAll("path.arc").style("opacity", 1)
        d3.selectAll("path.arcLine").style("opacity", 1)
        d3.selectAll("path.ribbon").style("opacity", 0.5)
      }

// 高亮
      function chord_ribbon_mouseenter(node) {
        drop_data = node["source"]["frame_pocket"]
        d3.selectAll("#chordPlot1 > svg > .chordPlot_chart > path").style("opacity", 0.2)
        node["class"].split(" ").forEach(d => d3.selectAll("#chordPlot1 > svg > .chordPlot_chart > ." + d).style("opacity", 1))
      }

// 高亮
      function chord_arc_mouseenter(node) {
        drop_data = node["frame_pocket"]
        // 更改所有的透明度
        d3.selectAll("#chordPlot1 > svg > .chordPlot_chart > path").style("opacity", 0.2)
        // 选中的高亮
        d3.selectAll("#chordPlot1 > svg > .chordPlot_chart > ." + node["class"]).style("opacity", 1);
      }

      function chordDrop1(event) {
        chordPlot_frame_drop_data.push(event.dataTransfer.getData("frame_pocket").trim().split(","))
        console.log("chordPlot_drop ", event.dataTransfer.getData("frame_pocket"))
        chordPlot_initData()
      }
    }
  },
}
</script>

<style scoped>

</style>