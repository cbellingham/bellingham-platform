import {
    BellAlertIcon,
    CalendarDaysIcon,
    ChartBarIcon,
    ClockIcon,
    Cog6ToothIcon,
    CurrencyDollarIcon,
    DocumentMagnifyingGlassIcon,
    HomeIcon,
    ShoppingCartIcon,
    UserCircleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
    { path: "/", label: "Home", icon: HomeIcon },
    { path: "/buy", label: "Buy", icon: ShoppingCartIcon },
    { path: "/reports", label: "Reports", icon: DocumentMagnifyingGlassIcon },
    { path: "/sell", label: "Sell", icon: CurrencyDollarIcon },
    { path: "/sales", label: "Sales", icon: ChartBarIcon },
    { path: "/calendar", label: "Calendar", icon: CalendarDaysIcon },
    { path: "/history", label: "History", icon: ClockIcon },
    { path: "/settings", label: "Settings", icon: Cog6ToothIcon },
    { path: "/account", label: "Account", icon: UserCircleIcon },
    { path: "/notifications", label: "Notifications", icon: BellAlertIcon },
];

export default navItems;
