import { createStore } from 'vuex'

export default createStore({// 后面开启模块化用：https://juejin.cn/post/7021536624848666631
    state: {
        test: 1,
    },
    mutations: {
        setTest(state, value) {
            state.test = value;
        }
    },
    actions: {
    },
    modules: {
    }
})
