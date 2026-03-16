import { Link } from 'react-router-dom';

function ErrPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#E8DCC4] px-4">
      <div className="max-w-xl w-full bg-white border-4 border-black p-8 text-center drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]">
        <h1 className="text-5xl font-black text-[#6B9B8E] mb-4">404</h1>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Page Not Found</h2>
        <p className="text-gray-700 mb-6">
          The page you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-block bg-[#F4A460] text-white font-bold px-6 py-3 border-2 border-black hover:bg-[#E89450] transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}

export default ErrPage;
