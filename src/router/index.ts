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
        {
            path: '/chatgpt',
            name: "Chatgpt",
            component: () => import("../pages/ChatgptLayout.vue")
        },
        {
            path: '/setting',
            name: "Setting",
            component: () => import("../pages/Setting.vue")
        },
    ]
})
