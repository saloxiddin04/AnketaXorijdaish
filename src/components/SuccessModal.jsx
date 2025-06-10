import React from "react";

const SuccessModal = ({ isOpen, onClose }) => {
	if (!isOpen) return null;
	
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(0,0,0,0.7)]">
			<div className="bg-white rounded-xl shadow-xl w-[340px] p-6 text-center relative">
				<div className="mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full bg-green-100">
					<svg
						className="w-10 h-10 text-green-600 animate-draw-check"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M5 13L9 17L19 7"
							stroke="currentColor"
							strokeWidth="3"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="path"
						/>
					</svg>
				</div>
				
				<h2 className="text-xl text-gray-800 mb-2">So‘rovnomadan muvaffaqiyatli o‘tdingiz!</h2>
				
				<button
					onClick={onClose}
					className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-md transition"
				>
					Yopish
				</button>
			</div>
		</div>
	);
};

export default SuccessModal;
