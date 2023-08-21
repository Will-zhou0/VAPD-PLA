<template>
  <div class="app">
    <div class="header">
      <header>
        <h2>Visual Analysis of Protein Pocket Dynamics</h2>
      </header>
    </div>
    <div class="container">
      <div>
        <el-row :gutter="5" class="con_top">
          <el-col :span="5">
            <el-card shadow="hover">
              <div>
                <h4>Protein Annotations</h4>
                &nbsp;&nbsp;PDB ENTY：<input
                  type="text"
                  value="4E46"
                  style="width: 60px"
                />
              </div>
              <div>
                <h4>PDB INFO</h4>
                Released:<br />
                &nbsp;&nbsp;2013-03-13
                <br /><br />
                Method:
                <br />
                &nbsp;&nbsp;XRAY DIFFRACTION 1.26 Å
                <br /><br />
                Unique Ligands:
                <br />
                &nbsp;&nbsp;ACT,CL,IPA
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <heatmap />
            </el-card>
          </el-col>
          <el-col :span="7">
            <el-card shadow="hover">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <molstar />
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div>
        <el-row :gutter="5" class="con_center">
          <el-col :span="5">
            <el-card shadow="hover" class="center_left">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <div class="card_content">
                <!-- 遍历指定数量的图 -->
                <div
                  class="center_left_child"
                  v-for="(chord, i) in chords"
                  :key="i"
                >
                  <chordPlotView
                    @chordScatterLinkLine="scatterLinkLine"
                    :chordID="chord.chordID"
                    :chordData="chord.chordData"
                    :chordColor="chord.chordColor"
                  />
                </div>
                <div
                  class="center_left_add"
                  ref="addChord"
                  @drop="addChord"
                  @dragover.prevent
                >
                  <!-- <img src="@/assets/img/add-circle.svg" alt="添加数据" /> -->
                  <i class="el-icon-circle-plus-outline plus_big"></i>
                  <i class="el-icon-circle-plus-outline plus_big"></i>
                </div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover" class="center_scatter">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
            </el-card>
          </el-col>
          <el-col :span="7">
            <el-card shadow="hover" class="center_right">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <div class="card_content">
                <barPlot
                v-for="(bar, index) in bars"
                :bar="bar"
                @barSlider="barSlider"
                @barClick="barClick"
                ref="barPlot"
                :key="index"
              />
                <!-- <div @drop="addBar" @dragover.prevent > -->
                    <img src="@/assets/img/addBar.svg" alt="添加数据" />
                    <img src="@/assets/img/addBar.svg" alt="添加数据" />
                <!-- </div> -->
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div>
        <el-row :gutter="5" class="con_bottom">
          <el-col :span="12">
            <el-card>
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <parallel></parallel>
            </el-card>
            <el-card>
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <box></box>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="bottom_right">
              <div slot="header" class="card_header">
                <span>卡片名称</span>
              </div>
              <singleAxisScatter></singleAxisScatter>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </div>
    <div class="main">
      <div class="center">
        <!--        <div class="bor-left-top"></div>-->
        <!--        <div class="bor-right-top"></div>-->
        <!--        <div class="bor-left-bottom"></div>-->
        <!--        <div class="bor-right-bottom"></div>-->
        <div class="center_top">
          <!-- 遍历指定数量的图 -->
          <div class="center_top_child" v-for="(chord, i) in chords" :key="i">
            <chordPlotView
              @chordScatterLinkLine="scatterLinkLine"
              :chordID="chord.chordID"
              :chordData="chord.chordData"
              :chordColor="chord.chordColor"
            />
            <!-- <img src="@/assets/img/cross.svg" alt="移除弦图" /> -->
          </div>
          <div
            class="center_top_add"
            ref="addChord"
            @drop="addChord"
            @dragover.prevent
          >
            <img src="@/assets/img/add-circle.svg" alt="添加数据" />
          </div>
        </div>
        <div>
          <!-- ref 用于表示，相当于原生JS的id this.$refs.div11(原生dom标签的ref) 获取到真实DOM元素 -->
          <scatterPlotView
            @scatterShowMol="scatterShowMol"
            @scatterShowRadar="scatterShowRadar"
            ref="scatterPlot"
          />
        </div>
        <div class="center_bottom">
          <el-tabs v-model="activeName">
            <el-tab-pane label="Parallel" name="first">
              <parallelPlotView
                @parallelScatterLinkLine="scatterLinkLine"
                @parallelShowMol="parallelShowMol"
                ref="parallelPlot"
              />
            </el-tab-pane>
            <el-tab-pane label="Boxplot" name="second">
              <boxPlotView />
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>
      <div class="right">
        <div class="rightTop">
          <!-- this.$refs.molPlot（组件标签的ref） molplot组件的实例对象VC -->
          <molPlot ref="molPlot" />
        </div>
        <br />
        <div class="right_bottom">
          <!--          <div class="bor-left-top"></div>-->
          <!--          <div class="bor-right-top"></div>-->
          <!--          <div class="bor-left-bottom"></div>-->
          <!--          <div class="bor-right-bottom"></div>-->
          <!-- <el-tabs v-model="activeNameRight">
            <el-tab-pane label="Bar" name="first">
              <barPlot v-for="(bar, index) in bars" :bar="bar" @barSlider="barSlider" @barClick="barClick" ref="barPlot"
                :key="index" />
              <br>
              <div class="right_bottom_add" @drop="addBar" @dragover.prevent>
                <img src="@/assets/img/addBar.svg" alt="添加数据" />
              </div>
            </el-tab-pane>
            <el-tab-pane label="Heatmap" name="second">
              <heatmap ref="heatmap" />
              <br>
            </el-tab-pane>
          </el-tabs> -->
          <barPlot
            v-for="(bar, index) in bars"
            :bar="bar"
            @barSlider="barSlider"
            @barClick="barClick"
            ref="barPlot"
            :key="index"
          />
          <br />
          <div class="right_bottom_add" @drop="addBar" @dragover.prevent>
            <img src="@/assets/img/addBar.svg" alt="添加数据" />
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--  <router-view/>-->
</template>
<script>
import { nanoid } from "nanoid";

export default {
  name: "app",
  props: {},
  data() {
    return {
      chords: [],
      clusters: [
        {
          clusterClass: "asdf", //
          clusterName: "Pocket1",
          clusterData: [
            "20_1",
            "78_1",
            "32_3",
            "63_3",
            "94_2",
            "24_8",
            "68_1",
            "85_1",
            "6_2",
            "89_2",
            "55_1",
            "22_11",
            "90_7",
            "34_6",
            "84_7",
            "77_6",
            "49_2",
            "15_1",
            "86_1",
            "13_9",
            "21_4",
            "37_6",
            "12_4",
            "19_5",
            "54_5",
            "95_5",
            "97_6",
            "57_6",
            "71_5",
            "61_6",
            "72_3",
            "55_6",
            "53_7",
            "33_5",
            "9_5",
            "90_5",
            "87_6",
            "39_8",
            "41_4",
            "98_8",
            "24_5",
            "69_2",
            "8_5",
            "90_8",
            "66_10",
            "29_7",
            "43_7",
            "71_3",
            "37_7",
            "91_4",
            "28_5",
            "61_4",
            "88_5",
            "63_4",
            "99_7",
            "59_1",
            "32_5",
            "98_4",
            "40_2",
            "41_5",
            "15_3",
            "73_4",
            "81_3",
            "46_4",
            "68_6",
            "39_5",
            "52_4",
            "99_3",
            "38_7",
            "74_5",
            "75_3",
            "25_5",
            "84_8",
            "100_2",
            "69_7",
          ].join(","),
          childTree: [],
        },
      ],
      dropData: [],
      classes: [],
      bars: [], // 柱状图信息
      activeName: "first", // 中间底部的tab默认项
      activeNameRight: "first", // 右侧底部的tab默认项
    };
  },
  mounted() {
    // 监听页面销毁
    window.addEventListener("unload", this.pocketUnload);
    // 获取数据
    let chordsData = localStorage.getItem("chords"); // 弦图
    let clusterData = localStorage.getItem("clusters"); // 簇
    let barData = localStorage.getItem("bars"); // 柱状图
    let parallelData = localStorage.getItem("parallel"); // 平行坐标
  },
  components: {
    scatterPlotView: () => import("./views/ScatterPlotView"), // 散点图
    chordPlotView: () => import("./views/ChordPlotView"), // 弦图
    clusterPlotView: () => import("./views/ClusterPlotView"), // 口袋簇
    pdbPlotView: () => import("./views/PDBPlotView"), // PDB文件展示
    parallelPlotView: () => import("./views/ParallelPlotView"), // 平行坐标图
    boxPlotView: () => import("./views/BoxPlotView"), // 盒图
    radarChart: () => import("./views/RadarChart"), // 雷达图
    molPlot: () => import("./views/MolPlotView"),
    barPlot: () => import("./views/BarPlotView"),
    // heatmap: () => import("./views/Heatmap"),
    heatmap: () => import("@/components/heatmap"),
    molstar: () => import("@/components/molstar"),
    chord: () => import("@/components/chord"),
    parallel: () => import("@/components/parallel"),
    box: () => import("@/components/box"),
    singleAxisScatter: () => import("@/components/singleAxisScatter"),
  },
  methods: {
    addChord(e) {
      let that = this;
      that.dropData = e.dataTransfer.getData("framePocket");
      // framePocket = that.dropData;
      // console.log("app add chord ", this.$refs.addChord.classList[0], e.dataTransfer.getData("identify"))
      // 创建新元素
      if (
        e.dataTransfer.getData("identify") &&
        e.dataTransfer.getData("identify") !== this.$refs.addChord.classList[0]
      ) {
        that.chords.push({
          chordID: nanoid(10).replace(/-/g, "").replace(/_/g, ""),
          chordData: that.dropData.trim().split(","),
          chordColor: e.dataTransfer.getData("color"),
        });
      }
    },
    // cluster 拖拽
    clusterDrop(e) {
      let that = this;
      console.log(e);
      that.dropData = e.dataTransfer.getData("framePocket"); // 接收数据
      // 表示不存在
      if (that.classes.indexOf(e.dataTransfer.getData("identify")) === -1) {
        $("#appModalDIV").modal("show");
        $("#appModalSubmit").on("click", that.clusterModalClick);
      }
    },
    clusterModalClick() {
      // 添加数据
      let that = this;
      $("#appModalDIV").modal("hide");
      let modalInputValue = $("#modalInput").val().trim(); // 输入列表名称
      let randomClass = nanoid(10).replace(/-/g, "").replace(/_/g, "");
      that.clusters.push({
        clusterClass: randomClass, //
        clusterName: modalInputValue,
        clusterData: that.dropData,
        childTree: [],
      });
      that.classes.push(randomClass);
      $("#modalInput").val(""); // 更改为空
      $("#appModalSubmit").unbind("click", that.clusterModalClick);
    },
    // 平行坐标图自定义事件 显示三维结构
    parallelShowMol(node) {
      this.$refs.molPlot.barClick(node);
    },

    // 散点中的自定义事件 显示三维结构
    scatterShowMol(node) {
      this.$refs.molPlot.barClick(node);
    },
    // 绘制雷达图
    scatterShowRadar(node) {
      console.log("展示雷达图", node);
      this.$refs.radarChart.radarClick(node);
    },

    addBar(e) {
      this.bars.push({
        barClass: nanoid(10).replace(/-/g, "").replace(/_/g, ""),
        barData: e.dataTransfer.getData("framePocket").trim().split(","),
        barName: nanoid(10).replace(/-/g, "").replace(/_/g, ""),
        barColor: e.dataTransfer.getData("color"),
      });
    },
    // 滑动块结束事件,显示
    barSlider(node) {
      // 显示三维结构
      this.$refs.molPlot.lineSlider(node);
      // 高亮
    },
    barClick(node) {
      console.log("App barClick ", node);
      this.$refs.molPlot.barClick(node);
    },

    scatterLinkLine(nodes) {
      // 调用绘线方法
      this.$refs.scatterPlot.circleLinkLine(nodes);
    },
    // 页面销毁
    pocketUnload() {
      // 数据存储
    },
  },
};
</script>
<style lang="less">
svg {
  border: 1px solid rgba(31, 31, 31, 0.99);
}

* {
  margin: 0;
}
.app {
  width: 100%;
  height: 100%;
  overflow: auto;
}
header {
  text-align: center;
  line-height: normal;
}
.container {
  /* height: 100%; */
  position: relative;
  top: 0;
  right: 0;
  z-index: 9; 
  width: 100%;
  max-width: 1500px;
}
.con_top {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
}
/deep/.el-card__header {
  padding: 5px 20px;
}
.card_header {
  display: block;
  font-size: 10px;
  // height: 7px;
}

.con_center {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  .center_left {
    width: 100%;
    height: 100%;
    .card_content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      .plus_big {
        font-size: 190px;
        color: #aaa;
      }
    }
  }
  .center_scatter {
    width: 100%;
    height: 100%;
  }
  .center_right {
    width: 100%;
    height: 100%;
    .card_content {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    }
  }
}

.con_bottom {
  width: 100%;
  height: 100%;
  .bottom_right{
    width: 100%;
    height: 100%;
  }
}

.addCluster {
  overflow: auto;
}
</style>

<style>
.main {
  margin: 0 auto;
  /*background: #555555;*/
}

.left {
  width: 230px;
  height: 500px;
  float: left;
  /* TODO */
  border: 1px solid black;
  position: relative;
}

.left-bottom {
  overflow: auto;
  /*background-color: #15e3c4;*/
  border: 1px solid black;
  width: 100%;
  height: 456px;
}

.left-bottom-content {
  margin: 10px;
  width: 90%;
  height: 370px;
  /*border: 1px red solid;*/
}

.bor-left-top,
.bor-left-bottom,
.bor-right-top,
.bor-right-bottom {
  width: 25px;
  height: 25px;
  border-style: solid;
  /* TODO */
  border-color: black;
  position: absolute;
  z-index: 99;
}

.bor-left-top {
  border-width: 2px 0 0 2px;
  left: 0;
  top: 0;
}

.bor-left-bottom {
  border-width: 0 0 2px 2px;
  left: 0;
  bottom: 0;
}

.bor-right-top {
  border-width: 2px 2px 0 0;
  right: 0;
  top: 0;
}

.bor-right-bottom {
  border-width: 0 2px 2px 0;
  right: 0;
  bottom: 0;
}

.center {
  width: 1000px;
  height: 900px;
  /*background: #3e9671;*/
  float: left;
  /* TODO */
  /*border: 1px solid black;*/
  /*border: 1px solid pink;*/
  position: relative;
  margin-right: -30px;
}

.center_top {
  width: 900px;
  height: 210px;
  margin-left: 30px;
  float: left;
  overflow: auto;
}

.center_top_add {
  width: 210px;
  height: 200px;
  margin: 3px;
  /*margin-right: 3px;*/
  /*background: green;*/
  /*border: 1px black solid;*/
  float: left;
}

.center_top_child {
  width: 210px;
  height: 200px;
  margin: 3px;
  /*margin-right: 3px;*/
  /*background: green;*/
  float: left;
}

.center_bottom {
  width: 980px;
  height: 190px;
  /*background: darksalmon;*/
  margin-left: 40px;
  float: left;
}

.right {
  width: 520px;
  height: 900px;
  /*background: #94923c;*/
  float: right;
  margin-left: -10px;
}

/*.right_top {*/
/*  width: 520px;*/
/*  height: 650px;*/
/*  background: #555555;*/
/*}*/

.right_bottom {
  width: 520px;
  height: 410px;
  /*background: rgb(224, 147, 147);*/
  overflow-y: auto;
  overflow-x: hidden;
  /* TODO */
  /*border: 1px solid pink;*/
  /*border: 1px solid black;*/
  position: relative;
  /*overflow: hidden;*/
}

.right_bottom_add {
  width: 500px;
  height: 200px;

  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
