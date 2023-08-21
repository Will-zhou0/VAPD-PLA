import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
// 全局样式
import "./assets/global.less.css"


// 按需引入element-ui 
// import { Tabs, TabPane } from 'element-ui'
// // 引入element样式
// import 'element-ui/lib/theme-chalk/index.css';
// // 使用element ui
// // Vue.component(Button.name, Button)
// Vue.use(Tabs)
// Vue.use(TabPane)

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import locale from 'element-ui/lib/locale/lang/en' // lang i18n
// set ElementUI lang to EN
Vue.use(ElementUI, { locale })

Vue.config.productionTip = false

new Vue({
    router, store, render: function (h) {
        return h(App)
    }
}).$mount('#app')
