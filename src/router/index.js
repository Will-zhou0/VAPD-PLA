import Vue from 'vue'
import VueRouter from 'vue-router'

Vue.use(VueRouter)

const routes = [
    {
        path: "/scatter",
        component: () => import("../views/ScatterPlotView")  // 散点图
    },
    {
        path: "/chord",
        component: () => import("../views/ChordPlotView")
    },
    {
        path: "/cluster",
        component: () => import("../views/ClusterPlotView")
    },
    {
        path: "/pdbPlotView",
        component: () => import("../views/PDBPlotView")
    }
]

const router = new VueRouter({
    mode: 'history', base: process.env.BASE_URL, routes
})

export default router
