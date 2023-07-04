<template>
  <div id="pdbView">
  </div>
</template>

<script>
export default {
  name: "MolPlotView",
  data() {
    return {
      viewerInstance: null,
      viewerContainer: null,
      optionBall: null,
      frame: [],// 接收拖入的数据
      framePocket: "1_1",
    }
  }, mounted() {
    this.initMolStart()
  }, methods: {
    initMolStart() {
      let that = this;
      that.viewerInstance = new PDBeMolstarPlugin();
      that.viewerContainer = document.getElementById("pdbView")
      that.optionBall = {
        customData: {
          url: "http://127.0.0.1:5000/molStar/molStarInit?frame_pocket=" + that.framePocket, format: "pdb",
        },
        visualStyle: "molecular-surface",        // 分子表面
        // visualStyle: "carbohydrate",             // 碳水化合物
        // visualStyle: 'distance-restraint', 
        // visualStyle:"putty",                     // 线
        // visualStyle: "mesh",                        // 球

        bgColor: { r: 255, g: 255, b: 255 }, hideControls: true, landscape: false,
      }
      that.viewerInstance.render(that.viewerContainer, that.optionBall)
    },
    lineSlider(pocketData) {
      console.log(" pocketData   ", pocketData)
      let that = this;
      // Update data to create new visual ,第二个参数代表什么？
      that.viewerInstance.visual.update({
        customData: {
          // 返回的数据是由frameinfo和pocketinfo组成的pdb文件
          url: "http://127.0.0.1:5000/molStar/slider?frame_pocket=" + pocketData, format: 'pdb',
        }, bgColor: { r: 255, g: 255, b: 255 }, visualStyle: "molecular-surface",
      }, true)
    },
    // 兄弟组件点击时调用
    barClick(node) {
      let that = this;
      that.viewerInstance.visual.update({
        customData: {
          url: "http://127.0.0.1:5000/molStar/framePocket?frame_pocket=" + node["frame_pocket"], format: 'pdb',
        }, bgColor: { r: 255, g: 255, b: 255 }, visualStyle: "molecular-surface",
      }, true)
    }
  }
}
</script>

<style scoped>
/*.rightTop {*/
/*  width: 520px;*/
/*  height: 620px;*/
/*  background: #555555;*/
/*}*/

/*#timeLine_text {*/
/*  height: 20px;*/
/*}*/

#pdbView {
  /*float: left;*/
  width: 520px;
  height: 520px;
  background: #555555;
  position: relative;
}

.rightBottomTimeLine {
  width: 520px;
  height: 250px;
  position: relative;
}
</style>
