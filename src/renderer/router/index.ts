import { createRouter, createWebHashHistory } from 'vue-router'

export default createRouter({
	history: createWebHashHistory(),
	routes: [
		{
			path: '/',
			name: 'PetTest',
			component: () => import('../pages/PetMain.vue'),
		},
		{
			path: '/petDetail',
			name: 'PetDetail',
			component: () => import('../pages/example/FunctionalDemo.vue'),
		},
		{
			path: '/chatgpt',
			name: 'Chatgpt',
			component: () => import('../pages/chatLayout/Layout.vue'),
		},
		{
			path: '/setting',
			name: 'Setting',
			component: () => import('../pages/Setting.vue'),
		},
	],
})
