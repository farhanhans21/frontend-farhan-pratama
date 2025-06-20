# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

***NOTE

cara deploy di vercel
tools
1. vercel
2. github
3. VS Code
Langkah
1. Buat atau siapkan proyek React berbasis Vite yang sudah dikembangkan secara lokal.
(dan pastikan waktu fetch data, harus meng-hit endpoint berbasis HTTPS kalau tidak bisa pake hendler agar si endpoint dari http bisa di tampung dan di hit ketika naik ke production)
2. push project ke github di branch main (production)
3. buka vercel lalu login mengunkan github
4. github akan menvalidasi melaui web github dan memberikan izin akses
5. setelah berhasil masuk ke new project (pojok kanan atas)
6. cari project yang mau di deploy dan import 
7. pilih brach yang akan di deploy
8. lalu ada kofigurasi build disini karna tidak ada validasi ts dan env jadi saya langsung mambuat
base path di kofigurasinya
9. tambahkan konfigurasi base seperti ini (base: process.env.VITE_BASE_PATH || "/frontend-farhan-pratama")
selelah or itu (||) ini berdasarkan url terakhir kita di github diambil example:("https://github.com/farhanhans21/frontend-farhan-pratama")
10. klik deploy dan tunggu beberapa saat
11.  setelah di deploy kamu sudah bisa mengaksesnya secara global di web dan jika ingin kamu mencoba membukanya cukup klik visit di pojok kanan atas
12. dan kamu telah menjalankan program kamu secara global
