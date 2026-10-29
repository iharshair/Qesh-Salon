# Qesh Salon — front-end (Vite + React)

Run: `npm install` then `npm run dev`. Build: `npm run build`.

## Images
- Slot list and sizes: `IMAGE_SLOTS.md`. Manifest: `src/data/images.js` (generated).
- Add a file named exactly like a slot into `public/images/`, then run `npm run sync-images` (dev/build do it for you).
- `npm run check-images` prints FILLED / BLANK for every slot and lists unplaced files.

## What to replace before launch
- `src/data/placeholders.js`: opening hours, email, Instagram, rating, review count, 4 reviews, 3 blog posts, story copy.
- `src/data/config.js`: `MOCK_OTP` (remove with a real OTP backend).

## Flags in `src/data/config.js`
GST_RATE, MEMBERSHIP {price, days}, HAIRWASH_OFFER_PERCENT, STACK_HAIRWASH_OFFER_WITH_ELITE, ENABLE_ONLINE_PAYMENT_FOR_BOOKINGS, BOOKING_WINDOW_DAYS, SLOT_MINUTES.

## Backend (`src/api/index.js`, all mock, localStorage)
auth.sendOtp(phone) · auth.verifyOtp(phone, code) -> {ok,isNew,user} · auth.register({phone,name,email}) · auth.me() · auth.logout()
catalog.get(gender) · bookings.availability(date) -> [{time,available}] · bookings.create({date,time,details,lines,totals,payment}) · bookings.list() · bookings.cancel(id) · bookings.reschedule(id,date,time)
membership.createOrder() -> {orderId,amount,gst,total} · membership.confirm(orderId) -> {status,startedAt,expiresAt} · membership.get() · wallet.get() -> {qoins,tx}
payment.createOrder(order) · payment.pay(order, method) · payment.verify(paymentId)
