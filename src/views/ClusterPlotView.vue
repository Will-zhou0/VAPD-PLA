<template>
  <li :class="cluster.clusterClass" class="btn-toggle-nav list-unstyled fw-normal pb-1">
    <!-- 单击展开，双击在散点图中展示 -->
    <label class="labelClass" @click="toggle" @dblclick="clusterDBClick" draggable="true" @dragstart.stop="clusterDragStart" @drop.stop="clusterViewDrop">{{ cluster.clusterName }}</label>
    <!--    <div>-->
    <a href="#" class="link-secondary" data-bs-toggle="dropdown">
      <img src="@/assets/img/dot.svg" class="imgClass" alt="点击展开"/>
    </a>
    <ul v-if="isFolder" v-show="open">
      <clusterPlotView v-for="(item, index) in cluster.childTree" :cluster="item" :key="index"/>
    </ul>
    <div class="dropdown-menu dropdown-menu-end">
      <input class="dropdown-item" type="color" @change="colorChange">
    </div>
  </li>
</template>
<script>

import {nanoid} from "nanoid";
import {mapActions, mapMutations} from "vuex"

const {request} = require("@/network/request");

let clusterTime = null;
export default {
  name: "ClusterPlotView",
  props: ["cluster"],
  data() {
    return {
      // 控制子列表的显示隐藏
      open: false,
      dropData: null, // 拖拽过来的数据
    }
  },
  computed: {
    // 是否还有子列表需要渲染，作为v-if的判断条件
    isFolder() {
      return this.cluster.childTree && this.cluster.childTree.length;
    }
  },
  mounted() {
    //
    // $("#" + this.cluster.clusterClass + "Submit").on("click", this.clusterModalClick);
  },
  methods: {
    ...mapActions(["changeColor", "highlightScatter"]),
    ...mapMutations(["changeScatterPlotFramePocketData"]),
    // 切换列表显示隐藏的方法
    toggle() {
      clearTimeout(clusterTime);
      clusterTime = setTimeout(() => {
        if (this.isFolder) {
          this.open = !this.open
        }
      }, 300);
    },
    // 点击事件，散点图高亮
    clusterDBClick() {
      let that = this;
      clearTimeout(clusterTime);
      that.highlightScatter(that.cluster.clusterData)
    },
    clusterDragStart(e) {
      e.dataTransfer.setData("identify", this.cluster.clusterClass)
      e.dataTransfer.setData("framePocket", this.cluster.clusterData)
    },
    clusterViewDrop(e) {
      let that = this;
      if (that.cluster.clusterClass.indexOf(e.dataTransfer.getData("identify")) === -1) {
        $("#appModalDIV").modal("show") // 显示模态框
        $("#appModalSubmit").attr("class", "btn btn-primary " + that.cluster.clusterClass)
        $("." + that.cluster.clusterClass).on("click", that.clusterModalClick) // 添加监听事件
      }
      that.dropData = e.dataTransfer.getData("framePocket")
    },
    clusterModalClick() {
      let that = this;
      let modalInputValue = $("#modalInput").val().trim()
      let curClusterData = that.cluster.clusterData.trim().split(",")
      that.cluster.childTree.push({ // 添加子集
        "clusterName": modalInputValue,
        // 交集
        "clusterData": that.dropData.trim().split(",").filter(val => {
          return curClusterData.indexOf(val) > -1
        }).join(","),
        "clusterClass": nanoid(10).replace(/-/g, '').replace(/_/g, ""),
        "childTree": [],
      })
      $("#appModalDIV").modal("hide")
      $("#modalInput").val("")
      // 解绑
      $("." + that.cluster.clusterClass).unbind("click", that.clusterModalClick)
    },
    async colorChange(e) {
      let that = this;
      let rgb = that.hexToRGB(e.target.value)
      that.changeColor({pocket: that.cluster.clusterData, color: rgb})
      that.changeScatterPlotFramePocketData({
        pocket: that.cluster.clusterData,
        color: rgb
      })
      // 更新数据库信息
      await request({
        url: "/forcePlot/changeColor", //
        method: "POST", //
        data: {"frame_pocket": that.cluster.clusterData, color: rgb}
      }).then(res => {
        if (res.status === 200) {
          console.log("颜色更新成功！")
        }
      }).catch(err => {
        console.log("颜色更新失败", err);
      })
    },
    hexToRGB(hex) {
      return 'rgb(' + parseInt('0x' + hex.slice(1, 3)) + ',' + parseInt('0x' + hex.slice(3, 5)) + ',' + parseInt('0x' + hex.slice(5, 7)) + ')';
    }
  },
}
</script>

<style scoped>
.imgClass {
  margin-right: 0;
}

.labelClass {
  font-size: 20px;
}
</style>
