import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import MainLayout from '@/shared/layouts/MainLayout.vue';
import LoginView from '@/modules/auth/views/LoginView.vue';
import DashboardView from '@/modules/properties/views/DashboardView.vue';
import UsersView from '@/modules/users/views/UsersView.vue';
import AdminProperties from '@/modules/properties/views/AdminProperties.vue';
import AgentDashboard from '@/modules/properties/views/AgentDashboard.vue';
import AgentClients from '@/modules/users/views/AgentClients.vue';
import AgentOwners from '@/modules/users/views/AgentOwners.vue';
import CalendarView from '@/modules/visits/views/CalendarView.vue';
import ScheduleVisitView from '@/modules/visits/views/ScheduleVisitView.vue';
import PropertiesClientView from '@/modules/properties/views/PropertiesClientView.vue';
import OwnerDashboard from '@/modules/properties/views/OwnerDashboard.vue';
import ClientDashboard from '@/modules/properties/views/ClientDashboard.vue';
import ReassignmentInboxView from '@/modules/visits/views/ReassignmentInboxView.vue';
import OperationDetailView from '@/modules/operations/views/OperationDetailView.vue';
import SentRequestsView from '@/modules/visits/views/SentRequestsView.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: LoginView,
    meta: { requiresGuest: true },
  },
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: DashboardView,
      },
      {
        path: 'admin/users',
        name: 'Users',
        component: UsersView,
        meta: { role: 'ADMIN' },
      },
      {
        path: 'admin/properties',
        name: 'AdminProperties',
        component: AdminProperties,
        meta: { role: 'ADMIN' },
      },
      {
        path: 'agent',
        name: 'AgentDashboard',
        component: AgentDashboard,
        meta: { role: 'AGENT' },
      },
      {
        path: 'agent/clients',
        name: 'AgentClients',
        component: AgentClients,
        meta: { role: 'AGENT' },
      },
      {
        path: 'agent/owners',
        name: 'AgentOwners',
        component: AgentOwners,
        meta: { role: 'AGENT' },
      },
      {
        path: '/reassignments/inbox',
        name: 'ReassignmentInbox',
        component: ReassignmentInboxView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/calendar',
        name: 'Calendar',
        component: CalendarView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/schedule-visit',
        name: 'ScheduleVisit',
        component: ScheduleVisitView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/properties',
        name: 'PropertiesListing',
        component: PropertiesClientView,
        meta: { role: 'CLIENT' },
      },
      {
        path: 'owner',
        name: 'OwnerDashboard',
        component: OwnerDashboard,
        meta: { role: 'OWNER' },
      },
      {
        path: 'client/favorites',
        name: 'ClientFavorites',
        component: () => import('@/modules/properties/views/ClientFavorites.vue'),
        meta: { role: 'CLIENT' },
      },
      {
        path: 'client',
        name: 'ClientDashboard',
        component: ClientDashboard,
        meta: { role: 'CLIENT' },
      },
      {
        path: 'admin/audit',
        name: 'Audit',
        component: () => import('@/modules/audit/views/AuditView.vue'),
        meta: { requiresAuth: true, role: 'ADMIN' },
      },
      {
        path: 'operations',
        name: 'Operations',
        component: () => import('@/modules/operations/views/OperationsView.vue'),
        meta: { role: 'AGENT' },
      },
      {
        path: '/operations/:id',
        name: 'OperationDetail',
        component: OperationDetailView,
        meta: { role: 'AGENT' },
      },
      {
        path: '/reassignments/sent',
        name: 'SentRequests',
        component: SentRequestsView,
        meta: { role: 'AGENT' },
      },
    ],
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  if (!authStore.isAuthenticated && to.name !== 'Login') {
    next({ name: 'Login' });
  } else if (to.meta.requiresGuest && authStore.isAuthenticated) {
    next({ name: 'Dashboard' });
  } else if (to.meta.role) {
    const roles = (authStore.user?.roles as string[]) || [];
    const userType = authStore.user?.userType;
    const hasRole =
      roles.includes(to.meta.role as string) ||
      userType === 'ADMIN' ||
      (to.meta.role === 'AGENT' && userType === 'EMPLOYEE') ||
      (to.meta.role === 'CLIENT' && userType === 'INTERESTED_CLIENT');

    hasRole ? next() : next({ name: 'Dashboard' });
  } else {
    next();
  }
});

router.onError((error) => {
  console.error('Router error:', error);
  if (error.message?.includes('Cannot destructure property')) {
    window.location.reload();
  }
});

export default router;
