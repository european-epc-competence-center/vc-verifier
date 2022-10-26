import { createRouter, createWebHashHistory } from 'vue-router'

import DefaultLayout from '@/layouts/DefaultLayout'

const routes = [
  {
    path: '/',
    name: 'Default',
    component: DefaultLayout,
    children: [
      {
        path: '/',
        name: 'Entry',
        component: () =>
          import( '@/views/Entry.vue'),
      },
      {
        path: '/verify',
        name: 'Verify',
        component: () => import('@/views/Verify.vue'),
      },
    ]
  }  
]

const router = createRouter({
  history: createWebHashHistory(process.env.BASE_URL),
  routes,
  scrollBehavior() {
    // always scroll to top
    return { top: 0 }
  },
})

export default router
