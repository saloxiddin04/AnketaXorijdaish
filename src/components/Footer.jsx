import React from "react";
import logo_footer from "../assets/logo2.png";

const Footer = () => {
	return (
		<footer className="bg-gray-100 py-6">
			<div className="container mx-auto px-4">
				{/* Main Flex Container */}
				<div className="flex flex-col md:flex-row justify-between items-center gap-4">
					{/* Combined Logo and Contact Section */}
					<div className="flex flex-col sm:flex-row justify-between items-center gap-4 w-full">
						{/* Logo Section */}
						<div className="mb-3 sm:mb-0 flex items-center">
							<img
								src={logo_footer}
								alt="LOGO"
								className="md:w-2/4 w-32 object-contain"
							/>
						</div>
						{/* Contact and Social Media Section */}
						<div className="flex flex-col sm:flex-row justify-center gap-4 text-gray-700">
							{/* Phone */}
							<a
								href="tel:+998712023355"
								className="flex items-center text-sm sm:text-base hover:text-blue-500 transition"
							>
								<i className="fas fa-phone mr-2"></i> +998712023355
							</a>
							{/* Email */}
							<a
								href="mailto:info@migration.uz"
								className="flex items-center text-sm sm:text-base hover:text-blue-500 transition"
							>
								<i className="fas fa-envelope mr-2"></i> info@migration.uz
							</a>
							{/* Telegram */}
							<a
								href="https://t.me/uzmigration"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center text-sm sm:text-base hover:text-blue-500 transition"
							>
								<i className="fab fa-telegram mr-2"></i> Telegram
							</a>
							{/* Instagram */}
							<a
								href="https://www.instagram.com/migratsiya_agentligi?igsh=ZDNmNmEyZDNuY2Q5"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center text-sm sm:text-base hover:text-blue-500 transition"
							>
								<i className="fab fa-instagram mr-2"></i> Instagram
							</a>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;