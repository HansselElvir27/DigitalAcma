# TODO Plan: Inscripción de Embarcaciones Menores

## Confirmed Requirements
- Public form: fullName, port (select from DB ports), phone, email. NO signature.
- POST → Assigned to CAPITAN of selected port.
- CAPITAN dashboard: Approve → Set citaDate (DateTime), observation, generate citaNumber, update status.
- Cita = inspection date/time notification.

## Step-by-Step TODO
- [x] 1. Create TODO_INSCRIPCION.md (current)
- [x] 2. Add EmbarcacionInscripcionRequest model to schema.prisma + migrate (db push + generate done)

- [x] 3. Create /api/public/inscripcion-embarcaciones/route.ts (POST/GET) ✅ FIXED transaction error

- [x] 4. Create src/app/(public)/inscripcion-embarcaciones/page.tsx form (TypeScript fixed)
- [ ] 5. Add /api/public/puertos/route.ts (GET ports list)
- [x] 6. Add links to nav (layout.tsx) + homepage services (page.tsx) (homepage card added)
- [ ] 7. Admin: /dashboard/inscripcion-embarcaciones/page.tsx + table
- [ ] 8. Extend tracking/[id], recent requests, stats
- [ ] 9. Update TODO + test
- [ ] 10. Complete

Progress marked on completion.

