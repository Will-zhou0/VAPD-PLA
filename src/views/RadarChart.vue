<template>
    <div class="com-page">
        <div id="radarChart" ref="boxPlotRef" @drop="boxPlotDrop" @dragover.prevent @mousemove="mouseXY"></div>
    </div>
</template>
  
<script>
import { request } from "@/network/request";
let radar_frame_pocket = ["93_7", "99_13", '78_4'];
export default {
    name: "RadarChart",
    data() {
        return {
            width: 880,       /*  平行坐标图宽度 */
            height: 190,      /*  平行坐标图高度 */
            margin: 40,
            pocketData: [],     // 请求数据
            frameData: [],
            columnName: [],     // 列名
            rangeData: [],      // 范围
            mapIndex: [],       // 下标映射
            arr: [],
            axis: [],
            mouseX: 0, // 鼠标位置
            timeOut: null,
            result: [[], [], [], [], [], []],
            drugscoreMax: 0,
            hydropscoreMax: 0,
            polarityscoreMax: 0,
            totalsasaMax: 0,
            volumeMax: 0,
            alphaspmaxdistMax: 0,
        }
    },
    mounted() {
        this.pocketData = radar_frame_pocket;
        this.initData();
    },
    methods: {
        async initData() {
            let that = this;
            await request({
                url: "/parallelPlot/index",
                method: "POST",
                data: { "frame_pocket": that.pocketData }
            }).then(res => {
                if (res.status === 200) {
                    console.log('radar_data', res.data);
                    // let drugscore = res.data["frame_pocket_data"].map(item => item.drugscore) // 成药性得分
                    // let hydropscore = res.data["frame_pocket_data"].map(item => item.hydropscore) // 疏水性得分
                    // let polarityscore = res.data["frame_pocket_data"].map(item => item.polarityscore) // 极性得分
                    // let totalsasa = res.data["frame_pocket_data"].map(item => item.totalsasa) // SASA溶剂可及表面积
                    // let volume = res.data["frame_pocket_data"].map(item => item.volume) // 体积
                    // let alphaspmaxdist = res.data["frame_pocket_data"].map(item => item.alphaspmaxdist) //阿尔法球质心最大距离

                    that.arr = res.data["frame_pocket_data"]
                    // let result = [[], [], [],[],[],[]];
                    that.result = that.arr.map(obj => [obj.drugscore, obj.hydropscore, obj.polarityscore, obj.totalsasa, obj.volume, obj.alphaspmaxdist]);

                    // for (let i = 0; i < that.arr.length; i++) {
                    //     that.result[0].push(that.arr[i].drugscore);
                    //     that.result[1].push(that.arr[i].hydropscore);
                    //     that.result[2].push(that.arr[i].polarityscore);
                    //     that.result[3].push(that.arr[i].totalsasa);
                    //     that.result[4].push(that.arr[i].volume);
                    //     that.result[5].push(that.arr[i].alphaspmaxdist);
                    // }
                    console.log('00000', that.result);

                    that.drugscoreMax = res.data["rangeData"].drugscore.max
                    that.hydropscoreMax = res.data["rangeData"].hydropscore.max
                    that.polarityscoreMax = res.data["rangeData"].polarityscore.max
                    that.totalsasaMax = res.data["rangeData"].totalsasa.max
                    that.volumeMax = res.data["rangeData"].volume.max
                    that.alphaspmaxdistMax = res.data["rangeData"].alphaspmaxdist.max

                    // that.arrs.push(volumes)
                    // let frame_pockets = res.data["frame_pocket_data"].map(item => item.frame_pocket)

                    // that.frameData = res.data["frame_pocket_data"];  // 每一帧的各个属性值
                    // that.columnName = res.data["columnName"];        // 显示的列名
                    // that.rangeData = res.data["rangeData"]           // 返回属性范围
                    // that.mapIndex = res.data["mapIndex"]             // 下标映射
                    that.myEcharts();
                }
            }).catch(err => {
                console.log(err)
            })
            // that.drawChart();
        },
        myEcharts() {
            let that = this
            let myChart = echarts.init(document.getElementById('radarChart'));
            // let data = echarts.dataTool.prepareBoxplotData(that.arrs);
            // console.log('echarts_data', that.drugscoreMax);

            let option = {
                legend: {
                    data: ['0', '1', '2']
                },
                tooltip: {
                    trigger: 'axis'
                },
                radar: {
                    // shape: 'circle',
                    indicator: [
                        { name: 'drugscore', max: that.drugscoreMax },
                        { name: 'hydropscore', max: that.hydropscoreMax },
                        { name: 'polarityscore', max: that.polarityscoreMax },
                        { name: 'totalsasa', max: that.totalsasaMax },
                        { name: 'volume', max: that.volumeMax },
                        { name: 'alphaspmaxdist', max: that.alphaspmaxdistMax }
                    ]
                },
                series: [
                    {
                        type: 'radar',
                        tooltip: {
                            trigger: 'item'
                        },
                        areaStyle: {},
                        data: [
                            {
                                value: that.result[0],
                                name: '0'
                            },
                            {
                                value: that.result[1],
                                name: '1'
                            },
                            {
                                value: that.result[2],
                                name: '2'
                            },

                        ]
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

        // 兄弟组件点击时调用
        radarClick(node) {
            console.log('radarClick', node);
        }
    }
}
</script>
  
<style scoped>
.com-page {
    /* z-index: 9; */
}

#radarChart {
    width: 270px;
    height: 270px;
    top: 0px;
    margin: auto;
}
</style>
  