import { router } from "./trpc";
import { bookRouter } from "./routers/book";
import { reviewRouter } from "./routers/review";
import { aiSummaryRouter } from "./routers/aiSummary";
import { favoriteRouter } from "./routers/favorite";
import { userRouter } from "./routers/user";
import { followRouter } from "./routers/follow";
import { notificationRouter } from "./routers/notification";
import { discoveryRouter } from "./routers/discovery";
import { companyRouter } from "./routers/company";
import { contactRouter } from "./routers/contact";
import { readingRouter } from "./routers/reading";

export const appRouter = router({
  book: bookRouter,
  review: reviewRouter,
  aiSummary: aiSummaryRouter,
  favorite: favoriteRouter,
  user: userRouter,
  follow: followRouter,
  notification: notificationRouter,
  discovery: discoveryRouter,
  company: companyRouter,
  contact: contactRouter,
  reading: readingRouter,
});

export type AppRouter = typeof appRouter;
