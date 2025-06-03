import { useTranslation } from "react-i18next";

const BuyCryptoModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-[rgb(var(--background))] text-[rgb(var(--text))] rounded-2xl p-6 w-[90%] max-w-md shadow-2xl border border-slate-700">
        <h2 className="text-xl font-semibold mb-2 text-[rgb(var(--text))]">
          {t("buyCrypto.title")}
        </h2>
        <p className="text-sm text-[rgb(var(--text))] mb-5">
          {t("buyCrypto.description")}
        </p>

        <div className="space-y-3">
          <a
            href="https://www.moonpay.com/buy"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-blue-600 hover:bg-blue-700 transition-colors text-[rgb(var(--text))] text-center py-2 rounded-lg shadow hover:shadow-lg"
          >
            {t("buyCrypto.partners.moonpay")}
          </a>
          <a
            href="https://global.transak.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-purple-600 hover:bg-purple-700 transition-colors text-[rgb(var(--text))] text-center py-2 rounded-lg shadow hover:shadow-lg"
          >
            {t("buyCrypto.partners.transak")}
          </a>
          <a
            href="https://ramp.network/buy"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-green-600 hover:bg-green-700 transition-colors text-[rgb(var(--text))] text-center py-2 rounded-lg shadow hover:shadow-lg"
          >
            {t("buyCrypto.partners.ramp")}
          </a>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-slate-400 hover:text-[rgb(var(--text))] hover:underline transition-colors"
        >
          {t("common.cancel")}
        </button>
      </div>
    </div>
  );
};

export default BuyCryptoModal;
