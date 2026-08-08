module.exports = {
  darkMode: ["selector", '[zaui-theme="dark"]'],
  content: ["./src/**/*.{js,jsx,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        primary: "#F97316",
        "primary-hover": "#EA580C",
        "primary-light": "#FFF7ED",
        surface: {
          page: "#F9FAFB",
          card: "#FFFFFF",
          hover: "#F3F4F6",
          border: "#E5E7EB",
        },
        text: {
          heading: "#111827",
          body: "#6B7280",
          muted: "#9CA3AF",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
      },
      borderRadius: {
        input: "12px",
        btn: "12px",
        card: "16px",
      },
      fontFamily: {
        mono: ["Roboto Mono", "monospace"],
      },
    },
  },
};
