import { Config } from "../../config/store";
import QuotesController, { Quote } from "../../controllers/quotes-controller";
import {
  showErrorNotification,
  showSuccessNotification,
} from "../../states/notifications";
import { isAuthenticated } from "../../states/core";
import { showLoaderBar, hideLoaderBar } from "../../states/loader-bar";
import { Command } from "../types";
import { getCurrentQuote } from "../../states/test";
import { t } from "../../i18n/store";

const commands: Command[] = [
  {
    id: "addQuoteToFavorite",
    display: t("Add current quote to favorite"),
    fa: { icon: "fa-heart" },
    available: (): boolean => {
      const quote = getCurrentQuote();
      return (
        isAuthenticated() &&
        quote !== null &&
        Config.mode === "quote" &&
        !QuotesController.isQuoteFavorite(quote)
      );
    },
    exec: async (): Promise<void> => {
      showLoaderBar();
      const { error } = await QuotesController.setQuoteFavorite(
        getCurrentQuote() as Quote,
        true,
      );
      hideLoaderBar();
      if (error !== null) {
        showErrorNotification(t("Failed to add quote to favorites"), { error });
        return;
      }
      showSuccessNotification(t("Quote added to favorites"));
    },
  },
  {
    id: "removeQuoteFromFavorite",
    display: t("Remove current quote from favorite"),
    fa: { icon: "fa-heart-broken" },
    available: (): boolean => {
      const quote = getCurrentQuote();
      return (
        isAuthenticated() &&
        quote !== null &&
        Config.mode === "quote" &&
        QuotesController.isQuoteFavorite(quote)
      );
    },
    exec: async (): Promise<void> => {
      showLoaderBar();
      const { error } = await QuotesController.setQuoteFavorite(
        getCurrentQuote() as Quote,
        false,
      );
      hideLoaderBar();
      if (error !== null) {
        showErrorNotification(t("Failed to remove quote from favorites"), {
          error,
        });
        return;
      }
      showSuccessNotification(t("Quote removed from favorites"));
    },
  },
];

export default commands;
