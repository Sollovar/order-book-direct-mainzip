import { X, Globe, Volume2, Bell, Moon, Sun, Check, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SettingsSheetProps {
  onClose: () => void;
  theme: "light" | "dark";
  toggleTheme: () => void;
  alertSound: boolean;
  onAlertSoundChange: (v: boolean) => void;
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="relative flex-shrink-0 transition-all duration-200 active:scale-95"
      style={{ width: 36, height: 20 }}
      aria-checked={enabled}
      role="switch"
    >
      <span
        className="absolute inset-0 rounded-full transition-colors duration-200"
        style={{ backgroundColor: enabled ? "#EFCFA7" : "rgba(128,128,128,0.25)" }}
      />
      <span
        className="absolute top-[3px] rounded-full bg-white shadow-sm transition-all duration-200"
        style={{ width: 14, height: 14, left: enabled ? 19 : 3 }}
      />
    </button>
  );
}

const LANGUAGES = [
  "English",
  "Deutsch",
  "Español (Latinoamérica)",
  "日本語",
  "한국어",
  "Polski",
  "Português (Brasil)",
  "Русский",
  "Türkçe",
  "简体中文",
  "繁體中文",
];

function LanguageSheet({
  selectedLanguage,
  onSelect,
  onClose,
}: {
  selectedLanguage: string;
  onSelect: (lang: string) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="absolute inset-0 flex flex-col justify-end"
      style={{ zIndex: 1 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet — same hamburger texture as parent */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl overflow-hidden"
        style={{ paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-5 pt-2 pb-4">
          <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium">Language</p>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
            aria-label="Close language picker"
          >
            <X className="h-[14px] w-[14px] text-trade-text/70" />
          </button>
        </div>

        {/* Language list */}
        <div className="divide-y divide-trade-text/5 max-h-[60vh] overflow-y-auto">
          {LANGUAGES.map((lang) => {
            const active = lang === selectedLanguage;
            return (
              <button
                key={lang}
                onClick={() => { onSelect(lang); onClose(); }}
                className="w-full flex items-center justify-between px-5 py-4 active:bg-trade-text/5 transition-colors"
              >
                <span
                  className="text-[15px] text-left"
                  style={{ color: active ? "#EFCFA7" : "var(--color-trade-text, white)", fontWeight: active ? 600 : 400 }}
                >
                  {lang}
                </span>
                {active && <Check className="h-4 w-4 flex-shrink-0" style={{ color: "#EFCFA7" }} />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export function SettingsSheet({ onClose, theme, toggleTheme, alertSound, onAlertSoundChange }: SettingsSheetProps) {
  const [fillSound, setFillSound] = useState(false);
  const [language, setLanguage] = useState("English");
  const [langOpen, setLangOpen] = useState(false);

  const rows = [
    {
      icon: theme === "dark" ? Moon : Sun,
      label: "Theme",
      right: (
        <Toggle enabled={theme === "dark"} onToggle={toggleTheme} />
      ),
      sub: theme === "dark" ? "Dark" : "Light",
      onClick: undefined,
    },
    {
      icon: Globe,
      label: "Language",
      right: (
        <span className="flex items-center gap-1 text-[13px] text-trade-text-muted">
          {language}
          <ChevronRight className="h-3.5 w-3.5 opacity-50" />
        </span>
      ),
      sub: undefined,
      onClick: () => setLangOpen(true),
    },
    {
      icon: Volume2,
      label: "Fill Sounds",
      right: <Toggle enabled={fillSound} onToggle={() => setFillSound(v => !v)} />,
      sub: "Play a sound when an order is filled",
      onClick: undefined,
    },
    {
      icon: Bell,
      label: "Price Alert Sound",
      right: <Toggle enabled={alertSound} onToggle={() => onAlertSoundChange(!alertSound)} />,
      sub: "Play a sound when a price alert fires",
      onClick: undefined,
    },
  ];

  return (
    <div
      className={`fixed inset-0 flex flex-col justify-end ${theme === "dark" ? "dark" : ""}`}
      style={{ zIndex: 9999 }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        className="relative bg-trade-card rounded-t-3xl shadow-2xl"
        style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-[4px] w-9 rounded-full bg-trade-text/20" />
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full bg-trade-surface active:opacity-60 transition-opacity"
          aria-label="Close"
        >
          <X className="h-[15px] w-[15px] text-trade-text/70" />
        </button>

        {/* Header */}
        <div className="px-5 pt-2 pb-4">
          <p className="text-[11px] text-trade-text-muted uppercase tracking-widest font-medium">Preferences</p>
          <p className="text-[18px] font-bold text-trade-text leading-tight">Settings</p>
        </div>

        {/* Rows */}
        <div className="px-5 divide-y divide-trade-text/5">
          {rows.map(({ icon: Icon, label, sub, right, onClick }) => (
            <div
              key={label}
              className={`flex items-center gap-3 py-3.5 ${onClick ? "cursor-pointer active:opacity-70 transition-opacity" : ""}`}
              onClick={onClick}
            >
              <Icon className="h-[18px] w-[18px] flex-shrink-0 text-trade-text/60" />
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-medium text-trade-text leading-tight">{label}</p>
                {sub && <p className="text-[11px] text-trade-text-muted mt-0.5">{sub}</p>}
              </div>
              {right}
            </div>
          ))}
        </div>

        {/* Language picker sheet — anchored inside this sheet */}
        {langOpen && (
          <LanguageSheet
            selectedLanguage={language}
            onSelect={setLanguage}
            onClose={() => setLangOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
