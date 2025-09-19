import {
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
    { path: "/", label: "Home", section: "Overview", icon: HomeIcon },
    { path: "/buy", label: "Buy", section: "Buyer", icon: ShoppingCartIcon },
    { path: "/reports", label: "Reports", section: "Buyer", icon: DocumentMagnifyingGlassIcon },
    { path: "/sell", label: "Sell", section: "Seller", icon: CurrencyDollarIcon },
    { path: "/sales", label: "Sales", section: "Seller", icon: ChartBarIcon },
    { path: "/calendar", label: "Calendar", section: "Operations", icon: CalendarDaysIcon },
    { path: "/history", label: "History", section: "Operations", icon: ClockIcon },
    { path: "/settings", label: "Settings", section: "Account", icon: Cog6ToothIcon },
    { path: "/account", label: "Account", section: "Account", icon: UserCircleIcon },
];

export default navItems;
