import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
    history: createWebHashHistory(),
    routes: [
        {
            path: '/',
            name: "PetTest",
            component: () => import("../pages/PetTest.vue")
        },
        {
            path: '/petDetail',
            name: "PetDetail",
            component: () => import("../pages/PetDetail.vue")
        },
    ]
})
