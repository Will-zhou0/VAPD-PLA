<template>
  <div ref="molstar" class="molstar"></div>
</template>

<script>
export default {
  name: "molstar",
  data() {
    return {};
  },
  mounted() {
    this.initMolstar();
  },
  methods: {
    initMolstar() {
      let that = this;
      const viewerInstance = new PDBeMolstarPlugin();
      let options = {
        customData: {
          url: "https://alphafold.ebi.ac.uk/files/AF-O15552-F1-model_v1.cif",
          format: "cif",
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
      viewerInstance.render(this.$refs.molstar, options);
    },
    lineSlider(pocketData) {
      console.log(" pocketData   ", pocketData);
      let that = this;
      // Update data to create new visual ,第二个参数代表什么？
      that.viewerInstance.visual.update(
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
      let that = this;
      that.viewerInstance.visual.update(
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
  width: 290px;
  height: 320px;
  position: relative;
}
</style>
