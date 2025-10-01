import { Motorcycle, UserList, ChatText, ChatsCircle, ChatCircleDots, ChatDots } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react/dist/lib/types';
import { ChartPie as ChartPieIcon } from '@phosphor-icons/react/dist/ssr/ChartPie';
import { GearSix as GearSixIcon } from '@phosphor-icons/react/dist/ssr/GearSix';
import { PlugsConnected as PlugsConnectedIcon } from '@phosphor-icons/react/dist/ssr/PlugsConnected';
import { Storefront as StoreFront } from '@phosphor-icons/react/dist/ssr/Storefront';
import { User as UserIcon } from '@phosphor-icons/react/dist/ssr/User';
import { Users as UsersIcon } from '@phosphor-icons/react/dist/ssr/Users';
import { XSquare } from '@phosphor-icons/react/dist/ssr/XSquare';
import { FolderSimple as FolderSimpleIcon } from '@phosphor-icons/react/dist/ssr/FolderSimple';

export const navIcons = {
  'chart-pie': ChartPieIcon,
  'gear-six': GearSixIcon,
  'plugs-connected': PlugsConnectedIcon,
  'x-square': XSquare,
  user: UserIcon,
  users: UsersIcon,
  shops: StoreFront,
  shopAdmins: UserList,
  deliveryMan: Motorcycle,
  'chat-text': ChatText,
  'chats-circle': ChatsCircle,
  'chat-circle-dots': ChatCircleDots,
  'chat-dots': ChatDots,
  category: FolderSimpleIcon,
} as Record<string, Icon>;
