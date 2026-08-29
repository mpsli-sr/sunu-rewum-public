"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { http } from "@/lib/api";

interface MenuItem {
  id: string;
  label: string;
  href: string;
  icon: string;
  roles: string;
  enabled: boolean;
  parentId: string | null;
  order: number;
  children?: MenuItem[];
}

function buildTree(items: MenuItem[]): MenuItem[] {
  const map: any = {};
  const roots: MenuItem[] = [];
  items.forEach((item) => {
    map[item.id] = { ...item, children: [] };
  });
  items.forEach((item) => {
    if (item.parentId && map[item.parentId]) {
      map[item.parentId].children.push(map[item.id]);
    } else if (!item.parentId) {
      roots.push(map[item.id]);
    }
  });
  const sort = (items: MenuItem[]) => {
    items.sort((a, b) => a.order - b.order);
    items.forEach((i) => {
      if (i.children) sort(i.children);
    });
  };
  sort(roots);
  return roots;
}

export default function DynamicMenu({ userRole }: { userRole: string }) {
  const [menuTree, setMenuTree] = useState<MenuItem[]>([]);
  const pathname = usePathname();

  useEffect(() => {
    http
      .get<MenuItem[]>("/api/menus")
      .then((data) => {
        const filtered = data.filter((item: MenuItem) => {
          if (!item.enabled) return false;
          const roles = item.roles.split(",").map((r) => r.trim());
          return roles.includes(userRole);
        });
        const tree = buildTree(filtered);
        setMenuTree(tree);
      })
      .catch(() => setMenuTree([]));
  }, [userRole]);

  const renderItems = (items: MenuItem[]) => {
    return items.map((item) => {
      if (item.children && item.children.length > 0) {
        return (
          <div key={item.id} className="space-y-1">
            <button
              className="flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm text-white/80 hover:bg-white/10"
              onClick={() => {
                const el = document.getElementById("submenu-" + item.id);
                if (el) el.classList.toggle("hidden");
              }}
            >
              <span>
                {item.icon} {item.label}
              </span>
              <span>▾</span>
            </button>
            <div id={"submenu-" + item.id} className="ml-4 space-y-1 hidden">
              {renderItems(item.children)}
            </div>
          </div>
        );
      }
      return (
        <Link
          key={item.id}
          href={item.href}
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
            pathname === item.href
              ? "bg-white/20 text-yellow-300 font-medium"
              : "text-white/70 hover:bg-white/10"
          }`}
        >
          <span>{item.icon || "🔗"}</span>
          <span>{item.label}</span>
        </Link>
      );
    });
  };

  if (!menuTree.length) return null;

  return <nav className="space-y-1">{renderItems(menuTree)}</nav>;
}
