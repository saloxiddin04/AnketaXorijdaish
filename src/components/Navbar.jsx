import React from 'react';
import logo1 from '../assets/logo1.png'
import logo2 from '../assets/logo2.png'
import logo3 from '../assets/logo3.png'
import { useTranslation } from 'react-i18next';

const Navbar = () => {
	const { i18n } = useTranslation();
	
	const handleLanguageChange = (e) => {
		i18n.changeLanguage(e.target.value);
		localStorage.setItem("language", e.target.value)
	};
	
	return (
		<header className="bg-white fixed shadow-lg w-full p-3 z-50">
			<nav className="container mx-auto">
				<div className="flex items-center justify-between">
					
					{/* Logo o‘rtada */}
					<div className="flex-1 flex justify-between">
						<img src={logo1} alt="logo" className="w-24 md:w-56" />
						<img src={logo2} alt="logo" className="w-24 md:w-56" />
						<img src={logo3} alt="logo" className="w-24 md:w-56" />
					</div>
					
					{/*/!* Til select o‘ngda *!/*/}
					{/*<div className="w-24 flex justify-end">*/}
					{/*	<select*/}
					{/*		onChange={handleLanguageChange}*/}
					{/*		defaultValue={i18n.language}*/}
					{/*		className="border border-gray-300 rounded px-3 py-1 text-sm"*/}
					{/*	>*/}
					{/*		<option value="uz">UZ</option>*/}
					{/*		<option value="ru">RU</option>*/}
					{/*	</select>*/}
					{/*</div>*/}
				</div>
			</nav>
		</header>
	);
};

export default Navbar;
