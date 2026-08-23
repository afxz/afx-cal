import type { Metadata, Viewport } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { Toaster } from "@/lib/toast";

export const metadata: Metadata = {
  title: {
    default: "Afx Cal — 开发者工具箱",
    template: "%s · Afx Cal",
  },
  description:
    "面向开发与日常编码的计算器/工具箱：编解码、格式化、加密哈希、JWT、正则、单位换算、房贷个税等 38 个小工具。",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

const themeScript = `(function(){try{var m=localStorage.getItem('afx-theme')||'system';var d=m==='dark'||(m==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches);if(d)document.documentElement.classList.add('dark');}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="min-w-0 flex-1">{children}</main>
        </div>
        <Toaster />
      </body>
    </html>
  );
}
