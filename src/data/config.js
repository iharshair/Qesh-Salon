// Site-wide flags and facts. Edit here, never inside components.
export const config = {
  GST_RATE: 0.05,
  MEMBERSHIP: { price: 999, days: 365 },
  HAIRWASH_OFFER_PERCENT: 50,
  // true  = the 50% hairwash offer is taken on the Elite price (they stack)
  // false = member gets whichever is lower: 50% of standard, or the Elite price
  STACK_HAIRWASH_OFFER_WITH_ELITE: true,
  // false = booking is "Pay at the salon". true = show the same PaymentStep as membership checkout.
  ENABLE_ONLINE_PAYMENT_FOR_BOOKINGS: false,
  BOOKING_WINDOW_DAYS: 180,
  SLOT_MINUTES: 30,
  MOCK_OTP: '123456', // MOCK ONLY. Remove when the real SMS/OTP backend is connected.
  WELCOME_QOINS: 499,
  WELCOME_QOINS_VALUE: 100,
  REFERRAL_QOINS: 999,
  REFERRAL_QOINS_VALUE: 200,
  contact: {
    brand: 'Qesh Salon',
    tagline: 'A Step to Your Best Self',
    address: 'Ground Floor, Triaa, Shop No, 33-34, Dhanori-Lohegaon Rd, Dhanori, Pune, Maharashtra 411015, India',
    phoneDisplay: '+91 75663 66375',
    phoneTel: 'tel:+917566366375',
  },
};
config.contact.mapUrl =
  'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(config.contact.address);
