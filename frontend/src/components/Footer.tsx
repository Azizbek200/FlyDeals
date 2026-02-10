export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} FlyDeals. All rights reserved.
      </div>
    </footer>
  );
}
