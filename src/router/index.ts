import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/',
      name: 'list',
      component: () => import('../views/ListView.vue')
    },
    {
      path: '/',
      name: 'specialized-documentation',
      component: () => import('../views/DocumentationView.vue')
    },{
      path: '/',
      name: 'concrete-reuse-in-short',
      component: () => import('../views/ReuseView.vue')
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue')
    }
  ]
})

export default router
