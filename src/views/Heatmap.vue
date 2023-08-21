<template>
        <div ref="heatmap" style="width: 500px;height: 250px;">热力图</div>
</template>
  
<script>
import { request } from "@/network/request";
let heatmap_frame_pocket = ["1_1", "2_4", "3_3", "4_6", "4_11", "5_4", "6_3", "7_2", "8_11", "9_2", "11_7", "12_9", "13_3", "14_1", "16_8", "19_8", "20_2", "22_7", "23_9", "24_9", "25_5", "26_2", "27_1", "29_1"];
export default {
    name: "Heatmap",
    data() {
        return {
            width: 880,       /*  平行坐标图宽度 */
            height: 190,      /*  平行坐标图高度 */
            margin: 40,
            charts: null,  //

            pocketData: [],     // 请求数据
            frameData: [],
            columnName: [],     // 列名
            rangeData: [],      // 范围
            mapIndex: [],       // 下标映射
            arrs: [],
            axis: [],
            mouseX: 0, // 鼠标位置
            timeOut: null,
        }
    },
    mounted() {
        this.pocketData = heatmap_frame_pocket;
        this.initData();
        // this.myEcharts()
    },
    methods: {
        async initData() {
            let that = this;
            await request({
                url: "/subPocket/index",
                method: "POST",
                data: { "frame_pocket": that.pocketData }
            }).then(res => {
                if (res.status === 200) {
                    let volumes = res.data["frame_pocket_data"].map(item => item.volume)
                    that.arrs.push(volumes)
                    let frame_pockets = res.data["frame_pocket_data"].map(item => item.frame_pocket)

                    that.frameData = res.data["frame_pocket_data"];  // 每一帧的各个属性值
                    that.columnName = res.data["columnName"];        // 显示的列名
                    that.rangeData = res.data["rangeData"]           // 返回属性范围
                    that.mapIndex = res.data["mapIndex"]             // 下标映射
                    that.myEcharts();
                }
            }).catch(err => {
                console.log(err)
            })
            // that.drawChart();
        },
        myEcharts() {
            let that = this
            let myChart = echarts.init(document.getElementById('heatmap'));
            // prettier-ignore
            const xData = that.pocketData
            // prettier-ignore
            const yData = that.pocketData
            // prettier-ignore
            const data = [[0, 0, 5], [0, 1, 1], [0, 2, 0], [0, 3, 0], [0, 4, 0], [0, 5, 0], [0, 6, 0], [0, 7, 0], [0, 8, 0], [0, 9, 0], [0, 10, 0], [0, 11, 2], [0, 12, 4], [0, 13, 1], [0, 14, 1], [0, 15, 3], [0, 16, 4], [0, 17, 6], [0, 18, 4], [0, 19, 4], [0, 20, 3], [0, 21, 3], [0, 22, 2], [0, 23, 5], [1, 0, 7], [1, 1, 0], [1, 2, 0], [1, 3, 0], [1, 4, 0], [1, 5, 0], [1, 6, 0], [1, 7, 0], [1, 8, 0], [1, 9, 0], [1, 10, 5], [1, 11, 2], [1, 12, 2], [1, 13, 6], [1, 14, 9], [1, 15, 11], [1, 16, 6], [1, 17, 7], [1, 18, 8], [1, 19, 12], [1, 20, 5], [1, 21, 5], [1, 22, 7], [1, 23, 2], [2, 0, 1], [2, 1, 1], [2, 2, 0], [2, 3, 0], [2, 4, 0], [2, 5, 0], [2, 6, 0], [2, 7, 0], [2, 8, 0], [2, 9, 0], [2, 10, 3], [2, 11, 2], [2, 12, 1], [2, 13, 9], [2, 14, 8], [2, 15, 10], [2, 16, 6], [2, 17, 5], [2, 18, 5], [2, 19, 5], [2, 20, 7], [2, 21, 4], [2, 22, 2], [2, 23, 4], [3, 0, 7], [3, 1, 3], [3, 2, 0], [3, 3, 0], [3, 4, 0], [3, 5, 0], [3, 6, 0], [3, 7, 0], [3, 8, 1], [3, 9, 0], [3, 10, 5], [3, 11, 4], [3, 12, 7], [3, 13, 14], [3, 14, 13], [3, 15, 12], [3, 16, 9], [3, 17, 5], [3, 18, 5], [3, 19, 10], [3, 20, 6], [3, 21, 4], [3, 22, 4], [3, 23, 1], [4, 0, 1], [4, 1, 3], [4, 2, 0], [4, 3, 0], [4, 4, 0], [4, 5, 1], [4, 6, 0], [4, 7, 0], [4, 8, 0], [4, 9, 2], [4, 10, 4], [4, 11, 4], [4, 12, 2], [4, 13, 4], [4, 14, 4], [4, 15, 14], [4, 16, 12], [4, 17, 1], [4, 18, 8], [4, 19, 5], [4, 20, 3], [4, 21, 7], [4, 22, 3], [4, 23, 0], [5, 0, 2], [5, 1, 1], [5, 2, 0], [5, 3, 3], [5, 4, 0], [5, 5, 0], [5, 6, 0], [5, 7, 0], [5, 8, 2], [5, 9, 0], [5, 10, 4], [5, 11, 1], [5, 12, 5], [5, 13, 10], [5, 14, 5], [5, 15, 7], [5, 16, 11], [5, 17, 6], [5, 18, 0], [5, 19, 5], [5, 20, 3], [5, 21, 4], [5, 22, 2], [5, 23, 0], [6, 0, 1], [6, 1, 0], [6, 2, 0], [6, 3, 0], [6, 4, 0], [6, 5, 0], [6, 6, 0], [6, 7, 0], [6, 8, 0], [6, 9, 0], [6, 10, 1], [6, 11, 0], [6, 12, 2], [6, 13, 1], [6, 14, 3], [6, 15, 4], [6, 16, 0], [6, 17, 0], [6, 18, 0], [6, 19, 0], [6, 20, 1], [6, 21, 2], [6, 22, 2], [6, 23, 6]]
            var option = {
                tooltip: {
                    position: 'top'
                },
                grid: {
                    height: '50%',
                    top: '10%'
                },
                xAxis: {
                    type: 'category',
                    data: xData,
                    splitArea: {
                        show: true
                    }
                },
                yAxis: {
                    type: 'category',
                    data: yData,
                    splitArea: {
                        show: true
                    }
                },
                visualMap: {
                    min: 0,
                    max: 10,
                    calculable: true,
                    orient: 'horizontal',
                    left: 'center',
                    bottom: '15%'
                },
                series: [
                    {
                        name: 'Punch Card',
                        type: 'heatmap',
                        data: data,
                        label: {
                            show: false
                        },
                        emphasis: {
                            itemStyle: {
                                shadowBlur: 10,
                                shadowColor: 'rgba(0, 0, 0, 0.5)'
                            }
                        }
                    }
                ]
            };
            // 使用刚指定的配置项和数据显示图表。
            myChart.setOption(option);
        },



        mouseXY(e) {
            this.mouseX = e.offsetX
        },

        boxPlotDrop(event) {
            // console.log(event.dataTransfer.getData("framePocket"));
            this.pocketData = event.dataTransfer.getData("framePocket").trim().split(",")
            this.initData()
        },
        parallelClick(node) {
            console.log(node);
            this.$emit("parallelShowMol", node)
            this.$emit("parallelScatterLinkLine", node["frame_pocket"])
            this.highlightScatter(node["frame_pocket"])
        }
    }
}
</script>

  