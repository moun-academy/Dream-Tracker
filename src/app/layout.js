export const metadata = {
  title: "Dream Tracker",
  description: "Track your dream outcomes and milestones",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
