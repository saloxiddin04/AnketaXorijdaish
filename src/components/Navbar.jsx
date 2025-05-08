import React from 'react';
import logo from '../assets/Logo_Color.svg';
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
					{/* Chap bo‘sh joy (kerak bo‘lsa ikon qo‘yiladi) */}
					<div className="w-24" />
					
					{/* Logo o‘rtada */}
					<div className="flex-1 flex justify-center">
						<img src={logo} alt="logo" className="w-40 md:w-56" />
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
