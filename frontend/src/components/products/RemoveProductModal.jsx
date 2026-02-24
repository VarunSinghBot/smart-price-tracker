function RemoveProductModal({ isOpen, onClose, onConfirm, productName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white border-3 border-black max-w-md w-full relative drop-shadow-[12px_12px_0px_rgba(0,0,0,1)]">
                {/* Header */}
                <div className="bg-[#F4A460] p-6 border-b-3 border-black">
                    <h2 className="text-2xl font-bold text-white">Stop Tracking Product?</h2>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-700 mb-6">
                        Are you sure you want to stop tracking "<strong>{productName}</strong>"? You won't receive price alerts for this product anymore.
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onConfirm}
                            className="flex-1 px-6 py-3 bg-red-600 text-white font-semibold border-3 border-black hover:bg-red-700 transition-all drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                        >
                            Remove
                        </button>
                        <button
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border-3 border-black bg-white text-gray-800 font-semibold hover:bg-gray-50 transition-all drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:drop-shadow-[6px_6px_0px_rgba(0,0,0,1)]"
                        >
                            Keep Tracking
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RemoveProductModal;
