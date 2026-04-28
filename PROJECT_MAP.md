# PROJECT MAP

[files]
src/app/api/capsule/create/route.ts     | Creates capsule
src/app/api/capsule/get/route.ts        | Get capsule
src/app/api/capsule/list/route.ts       | Get list of capules based on user id
src/app/api/capsule/capsule.dao.ts      | DAO object of capsule

src/app/capsule/write/page.tsx          | Page for creating capsule
src/app/capsule/capsule.module.css
src/app/capsule/page.tsx                | Page with capsules listed out

[dependencies]
src/app/capsule/write/page.tsx          -> [src/app/api/capsule/get/route.ts, src/app/api/capsule/list/route.ts]
src/app/capsule/page.tsx                -> [src/app/api/capsule/create/route.ts]
