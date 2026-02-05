// Example usage of the toast utilities
// Import this component anywhere you need to show toast notifications

import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast, 
  showCustomToast,
  toastUtils 
} from './Toast';

// Usage Examples:

// 1. Success Toast
// showSuccessToast('Product added to tracker successfully!');

// 2. Error Toast
// showErrorToast('Failed to fetch product details. Please try again.');

// 3. Warning Toast
// showWarningToast('This product is currently out of stock.');

// 4. Info Toast
// showInfoToast('Price update available for this product.');

// 5. Custom Toast with icon
// showCustomToast(
//   'New Message',
//   'You have a new notification!',
//   <img 
//     className="h-10 w-10 rounded-full" 
//     src="https://via.placeholder.com/150" 
//     alt="User" 
//   />,
//   5000 // duration in milliseconds
// );

// 6. Using toastUtils object
// toastUtils.success('Operation completed!');
// toastUtils.error('Something went wrong!');
// toastUtils.warning('Please review your input.');
// toastUtils.info('System maintenance scheduled.');

// Example Component showing all toast types
const ToastExamples = () => {
  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-6">Toast Notifications Examples</h2>
      
      <button
        onClick={() => showSuccessToast('This is a success message!')}
        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
      >
        Show Success Toast
      </button>

      <button
        onClick={() => showErrorToast('This is an error message!')}
        className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
      >
        Show Error Toast
      </button>

      <button
        onClick={() => showWarningToast('This is a warning message!')}
        className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
      >
        Show Warning Toast
      </button>

      <button
        onClick={() => showInfoToast('This is an info message!')}
        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Show Info Toast
      </button>

      <button
        onClick={() => showCustomToast(
          'Custom Notification',
          'This is a custom toast with custom content!',
          <img 
            className="h-10 w-10 rounded-full" 
            src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2.2&w=160&h=160&q=80" 
            alt="User avatar" 
          />
        )}
        className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
      >
        Show Custom Toast
      </button>
    </div>
  );
};

export default ToastExamples;
