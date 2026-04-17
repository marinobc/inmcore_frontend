export interface NavLink {
  label: string;
  to: string;
  roles?: string[];
  userTypes?: string[];
  name?: string;
}

export const navigationLinks: NavLink[] = [
  {
    label: 'nav.users',
    to: '/dashboard/admin/users',
    roles: ['ADMIN'],
    userTypes: ['ADMIN'],
    name: 'Users',
  },
  {
    label: 'nav.myInmuebles',
    to: '/dashboard/agent',
    userTypes: ['EMPLOYEE'],
    roles: ['AGENT'],
    name: 'AgentDashboard',
  },
  {
    label: 'nav.myProperties',
    to: '/dashboard/owner',
    roles: ['OWNER'],
    userTypes: ['OWNER'],
    name: 'OwnerDashboard',
  },
  {
    label: 'nav.favorites',
    to: '/dashboard/client/favorites',
    roles: ['INTERESTED_CLIENT'],
    userTypes: ['INTERESTED_CLIENT'],
    name: 'ClientFavorites',
  },
  {
    label: 'nav.inventoryManagement',
    to: '/dashboard/admin/properties',
    roles: ['ADMIN'],
    userTypes: ['ADMIN'],
  },
  {
    label: 'nav.audit',
    to: '/dashboard/admin/audit',
    roles: ['ADMIN'],
    userTypes: ['ADMIN'],
    name: 'Audit',
  },
  {
    label: 'nav.myClients',
    to: '/dashboard/agent/clients',
    roles: ['AGENT'],
    userTypes: ['EMPLOYEE'],
    name: 'AgentClients',
  },
  {
    label: 'nav.myOwners',
    to: '/dashboard/agent/owners',
    roles: ['AGENT'],
    userTypes: ['EMPLOYEE'],
    name: 'AgentOwners',
  },
  {
    label: 'nav.availableProperties',
    to: '/properties',
    roles: ['INTERESTED_CLIENT'],
    userTypes: ['INTERESTED_CLIENT'],
    name: 'PropertiesListing',
  },
  {
    label: 'nav.operations',
    to: '/dashboard/operations',
    roles: ['AGENT'],
    userTypes: ['EMPLOYEE'],
  },
  {
    label: 'nav.receivedRequests',
    to: '/reassignments/inbox',
    roles: ['AGENT'],
    userTypes: ['EMPLOYEE'],
  },
  {
    label: 'nav.sentRequests',
    to: '/reassignments/sent',
    roles: ['AGENT'],
    userTypes: ['EMPLOYEE'],
  },
];
