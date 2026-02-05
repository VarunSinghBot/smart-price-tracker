import toast from 'react-hot-toast';

// Success Toast
export const showSuccessToast = (message, duration = 4000) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white border-4 border-black pointer-events-auto flex drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-[#6B9B8E] flex items-center justify-center border-2 border-black">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">SUCCESS</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l-3 border-black">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

// Error Toast
export const showErrorToast = (message, duration = 4000) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white border-4 border-black pointer-events-auto flex drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-red-500 flex items-center justify-center border-2 border-black">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">ERROR</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l-3 border-black">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

// Warning Toast
export const showWarningToast = (message, duration = 4000) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white border-4 border-black pointer-events-auto flex drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-[#F4A460] flex items-center justify-center border-2 border-black">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">WARNING</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l-3 border-black">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

// Info Toast
export const showInfoToast = (message, duration = 4000) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white border-4 border-black pointer-events-auto flex drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            <div className="shrink-0">
              <div className="w-10 h-10 bg-blue-500 flex items-center justify-center border-2 border-black">
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={3}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">INFO</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l-3 border-black">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

// Custom Toast with custom content
export const showCustomToast = (title, message, icon = null, duration = 4000) => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-custom-enter' : 'animate-custom-leave'
        } max-w-md w-full bg-white border-4 border-black pointer-events-auto flex drop-shadow-[8px_8px_0px_rgba(0,0,0,1)]`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start gap-3">
            {icon && (
              <div className="shrink-0">
                <div className="w-10 h-10 bg-[#E8F4F1] flex items-center justify-center border-2 border-black">
                  {icon}
                </div>
              </div>
            )}
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900">{title}</p>
              <p className="mt-1 text-sm text-gray-700 font-medium">{message}</p>
            </div>
          </div>
        </div>
        <div className="flex border-l-3 border-black">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full p-4 flex items-center justify-center text-gray-800 hover:bg-gray-100 transition-colors font-bold"
          >
            ✕
          </button>
        </div>
      </div>
    ),
    { duration }
  );
};

// Export all toast functions
export const toastUtils = {
  success: showSuccessToast,
  error: showErrorToast,
  warning: showWarningToast,
  info: showInfoToast,
  custom: showCustomToast,
};

export default toastUtils;
