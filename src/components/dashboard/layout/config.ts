import type { NavItemConfig } from '@/types/nav';
import { paths } from '@/paths';

export const navItems = [
  { key: 'overview', title: 'Overview', href: paths.dashboard.overview, icon: 'chart-pie' },
  { key: 'customers', title: 'Customers', href: paths.dashboard.customers, icon: 'users' },
  { key: 'shop', title: 'Shops', href: paths.dashboard.shop, icon: 'shops' },
  { key: 'shopAdmin', title: 'ShopAdmins', href: paths.dashboard.shopAdmin, icon: 'shopAdmins' },
  { key: 'deliveryMan', title: 'deliveryMans', href: paths.dashboard.deliveryMans, icon: 'deliveryMan' },
  { key: 'comments', title: 'Comments', href: paths.dashboard.comments, icon: 'chat-text' },
  { key: 'chat', title: 'Chat', href: paths.dashboard.chat, icon: 'chats-circle' },
  { key: 'categories', title: 'Categories', href: paths.dashboard.categories, icon: 'category' },
  
  {
    key: 'integrations',
    title: 'Integrations',
    href: paths.dashboard.integrations,
    icon: 'plugs-connected',
  },
  { key: 'settings', title: 'Settings', href: paths.dashboard.settings, icon: 'gear-six' },
  { key: 'account', title: 'Account', href: paths.dashboard.account, icon: 'user' },
] satisfies NavItemConfig[];
