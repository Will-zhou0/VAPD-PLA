import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
    state: {
        zoomFactor: 1,    // 缩放比例
        radius: 4, // framePocket: [],
        similarMin: 0.1,   // 两个空腔的相似性下限
        similarMax: 1.0,   // 两个空腔的相似性上限
        scatterPlotFramePocketData: [], // 初始化散点图
        inOrOutDegree: 10,   // 度最大值
    }, getters: {
        //
    }, mutations: {
        initScatterPlotFramePocketData(state, framePocket) {
            state.scatterPlotFramePocketData = framePocket;
        }, //
        changeScatterPlotFramePocketData(state, framePocketMap) {
            state.scatterPlotFramePocketData["forceData"].map(d => {
                if (framePocketMap["pocket"].indexOf(d["frame_pocket"]) > -1) {
                    d["color"] = framePocketMap["color"]
                }
            })
        }, //
        changZoomFactor(state, k) {
            state.zoomFactor = k;
        }, //
        changePocketComparability(state, s) {
            state.pocketComparability = s;
        },  // 更改相似性
        changeSimilarMin(state, s) {
            state.similarMin = s
        },
        changeSimilarMax(state, s) {
            state.similarMax = s
        },// 更改度
        changeInOrOutDegree(state, d) {
            state.inOrOutDegree = d;
        }
    }, actions: {
        highlightScatter(state, nodes) {
            let that = this;
            d3.selectAll("circle.scatterDot").style("opacity", 0.3).attr("r", that.state.radius / that.state.zoomFactor)
            nodes.trim().split(",").forEach(d => {
                d3.select(".c_" + d).attr("r", that.state.radius * 2 / that.state.zoomFactor).style("opacity", "1");
            })
        },//
        changeColor(state, data) {
            console.log(data["pocket"].trim().split(","))
            data["pocket"].trim().split(",").forEach(d => {
                console.log(d3.selectAll("circle").select(".c_" + d + "color"))
                d3.selectAll("circle").select(".c_" + d + "color").style("fill", data["color"])
            })
        },
    },
})
