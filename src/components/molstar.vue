<template>
  <div ref="molstar" class="molstar"></div>
</template>

<script>
export default {
  name: "molstar",
  data() {
    return {
      viewerInstance: null,
      frame: [], // 接收拖入的数据
      framePocket: "1_1",
    };
  },
  mounted() {
    this.initMolstar();
  },
  methods: {
    initMolstar() {
      this.viewerInstance = new PDBeMolstarPlugin();
      let options = {
        customData: {
          url:
            "http://127.0.0.1:5000/molStar/molStarInit?frame_pocket=" +
            this.framePocket,
          format: "pdb",
        },
        visualStyle: "molecular-surface", // 分子表面
        // visualStyle: "carbohydrate",             // 碳水化合物
        // visualStyle: 'distance-restraint',
        // visualStyle:"putty",                     // 线
        // visualStyle: "mesh",                        // 球
        bgColor: { r: 255, g: 255, b: 255 },
        hideControls: true,
        landscape: false,
      };
      this.viewerInstance.render(this.$refs.molstar, options);
    },
    lineSlider(pocketData) {
      console.log(" pocketData   ", pocketData);
      // Update data to create new visual ,第二个参数代表什么？
      this.viewerInstance.visual.update(
        {
          customData: {
            // 返回的数据是由frameinfo和pocketinfo组成的pdb文件
            url:
              "http://127.0.0.1:5000/molStar/slider?frame_pocket=" + pocketData,
            format: "pdb",
          },
          bgColor: { r: 255, g: 255, b: 255 },
          visualStyle: "molecular-surface",
        },
        true
      );
    },
    // 兄弟组件点击时调用
    barClick(node) {
      this.viewerInstance.visual.update(
        {
          customData: {
            url:
              "http://127.0.0.1:5000/molStar/framePocket?frame_pocket=" +
              node["frame_pocket"],
            format: "pdb",
          },
          bgColor: { r: 255, g: 255, b: 255 },
          visualStyle: "molecular-surface",
        },
        true
      );
    },
  },
};
</script>

<style scoped>
.molstar {
  float: left;
  position: relative;
  left: 13%;
  width: 355px;
  height: 355px;
  position: relative;
}
</style>
