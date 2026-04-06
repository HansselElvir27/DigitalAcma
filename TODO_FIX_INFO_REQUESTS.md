# FIX: DriverAdapterError \"unknown pkt\" in InfoRequestsPage

## Status: ✅ db.ts singleton | ✅ page.tsx error handling

### Plan Steps:
- [x] 1. Implement PrismaClient singleton in src/lib/db.ts
- [x] 2. Add error handling/retry to src/app/(admin)/dashboard/info/page.tsx
- [x] 3. Verify prisma/schema.prisma previewFeatures
- [x] 4. Run `npx prisma generate`
- [ ] 5. Start `npm run dev`
- [ ] 6. Test http://localhost:3000/api/debug-db (expect success + userCount)
- [ ] 7. Test /admin/dashboard/info page load
- [ ] 8. Check console/terminal for [DB] logs
- [ ] 9. If fails: Verify Neon dashboard connections

**Next:** Edit info/page.tsx for error boundary.

